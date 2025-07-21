// eslint-disable-next-line import/no-extraneous-dependencies
const AWS = require('aws-sdk');
const { Service } = require('@g-network/service-chassis');
const { NotFoundError, ValidationError } = require('@g-network/service-chassis/errors');
const get = require('lodash.get');
const {
  orderStatus,
  errorMessages,
  productTypes,
  recordTypes,
  stageNames,
  residentialOrBusinessFields,
  orderTypes,
  opportunityLossReasons,
  orderCancellationReasons,
  categories,
  priceBookNames,
  propertyTypes,
} = require('../constants');

AWS.config.update({ region: process.env.REGION });

function isEmpty(data) {
  if (data instanceof Array || typeof data === 'string') return data.length === 0;

  if (data && typeof data === 'object') return Object.keys(data).length === 0;

  return !data;
}

function extractDateDiff(installationDate, currentDate = new Date()) {
  const oneDay = 24 * 60 * 60 * 1000;
  const formattedDate = new Date(installationDate);
  return Math.round((currentDate - formattedDate) / oneDay);
}

function isActionDateValid(actionDate) {
  const daysDifference = extractDateDiff(new Date().toISOString().split('T')[0], new Date(actionDate));
  return daysDifference >= 0;
}

class OrderService extends Service {
  constructor(props) {
    super(props);

    this.wsOrderCreateTopicArn = process.env.WS_ORDER_CREATED_SNS_TOPIC_ARN;
    this.orderCancelledTopicArn = process.env.ORDER_CANCELLED_SNS_TOPIC_ARN;
  }

  static validateProduct(companyName, product) {
    if (!product.type) {
      throw new ValidationError(errorMessages.productTypeIsNotSet(product.id));
    }

    if (companyName) {
      if (product.type !== productTypes.BUSINESS) {
        throw new ValidationError(errorMessages.productIsNotForBusiness);
      }
    } else if (product.type !== productTypes.RESIDENTIAL) {
      throw new ValidationError(errorMessages.productIsNotForResidential);
    }
  }

  static validateUpdatePayload(order) {
    if (!order) {
      throw new NotFoundError(errorMessages.orderNotFound);
    }

    if (order.Status !== orderStatus.DRAFT) {
      throw new ValidationError(errorMessages.orderNotDraft);
    }

    if (order.Date_Survey_Booked_for__c) {
      throw new ValidationError(errorMessages.dateSurveyBooked);
    }
  }

  static validateContact(contactType, category) {
    const expectedContactType =
      category === categories.WHOLESALE ? recordTypes.WHOLESALE_CONTACT : recordTypes.STANDARD_CONTACT;

    if (contactType !== expectedContactType) {
      throw new ValidationError(errorMessages.invalidContactType(expectedContactType));
    }
  }

  static validateAccount(account, accountType) {
    const allowedAccountTypes = [recordTypes.WHOLESALE_ACCOUNT, recordTypes.STANDARD_ACCOUNT];

    if (!account) {
      throw new ValidationError(errorMessages.thereIsNoLinkedAccount);
    }

    if (!allowedAccountTypes.includes(accountType)) {
      throw new ValidationError(errorMessages.invalidAccountType(allowedAccountTypes));
    }
  }

  async createOrder(orderData) {
    const [account, contact] = await Promise.all([
      this.models.Account.getById(orderData.partnerId),
      this.services.contact.getByExternalId(orderData.contactId),
    ]);
    const accountType = get(account, 'RecordType.Name');
    const contactType = get(contact, 'RecordType.Name');

    OrderService.validateAccount(account, accountType);

    const category = accountType === recordTypes.WHOLESALE_ACCOUNT ? categories.WHOLESALE : categories.RETAIL;

    OrderService.validateContact(contactType, category);

    const [property, productsData] = await Promise.all([
      this.services.propertyService.getProperty(orderData.installationSite.uprn),
      Promise.all(
        orderData.products.map((product) => this.services.productService.getById(category, product.productId)),
      ),
    ]);

    const products = productsData.map(({ data: product }) => {
      OrderService.validateProduct(contact.Company_Name__c, product);
      return product;
    });

    const populatedOrderData = {
      ...orderData,
      property,
      products,
      contact,
      priceBookName: priceBookNames[category],
    };

    return orderData.type === orderTypes.NEW_BUSINESS
      ? this.newBusinessOrder(populatedOrderData)
      : this.upgradeDowngradeOrder(populatedOrderData);
  }

  async newBusinessOrder({ property, partnerId, type, products, contact, priceBookName }) {
    const isWholesale = priceBookName === priceBookNames[categories.WHOLESALE];
    const { LastName: lastName, FirstName: firstName, Company_Name__c: companyName, Id: internalContactId } = contact;

    const residentialOrBusiness = isEmpty(companyName)
      ? residentialOrBusinessFields.RESIDENTIAL
      : residentialOrBusinessFields.BUSINESS;

    const opportunityName = isEmpty(companyName)
      ? `${firstName} ${lastName} - ${property.streetUnitName} ${property.streetNumber}`
      : `${companyName} - ${property.streetUnitName} ${property.streetNumber}`;

    const opportunity = await this.services.opportunity.create({
      type,
      partnerId,
      contactId: internalContactId,
      priceBookName,
      opportunityName,
      residentialOrBusiness,
      buildingId: property.buildingId,
      stageName: stageNames.PROGRESSING,
      streetUnitId: property.streetUnitId,
      recordType: isWholesale ? recordTypes.WHOLESALE_OPPORTUNITY : recordTypes.STANDARD_OPPORTUNITY,
      propertyId: property.propertyId,
      propertyType: property.propertyType,
      isWholesale,
    });

    await Promise.all(
      products.map(async (product) => {
        const pricebookEntry = await this.getPricebookEntry(priceBookName, product.id);
        await this.services.opportunityLineItem.create(pricebookEntry, opportunity.id);
      }),
    );

    if (isWholesale) {
      await this.services.opportunity.updateById(opportunity.id, {
        StageName: stageNames.CLOSED_WON,
      });

      await this.wsOrderCreatedNotification(
        partnerId,
        opportunity.externalOpportunityUUID,
        isEmpty(companyName) ? productTypes.RESIDENTIAL : productTypes.BUSINESS,
      );
    }

    return { id: opportunity.externalOpportunityUUID, serviceId: null };
  }

  wsOrderCreatedNotification(partnerId, orderId, tagType) {
    const params = {
      Message: JSON.stringify({ partnerId, orderId, tagType }),
      TopicArn: this.wsOrderCreateTopicArn,
    };

    return new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();
  }

  async upgradeDowngradeOrder({ partnerId, type, products, actionDate, serviceId, priceBookName }) {
    if (!isActionDateValid(actionDate)) {
      throw new ValidationError(errorMessages.invalidActionDate);
    }

    if (await this.models.OrderSalesforce.getPendingUpgradeDowngradeOrder(partnerId, serviceId)) {
      throw new ValidationError(errorMessages.upgradeDowngradeRestriction);
    }

    const { Id: opportunityId } = await this.services.opportunity.getByOrderStatus(
      orderStatus.LIVE,
      partnerId,
      serviceId,
    );

    let productIDs = '';
    await Promise.all(
      products.map(async (product) => {
        const { Product2Id: productId } = await this.getPricebookEntry(priceBookName, product.id);
        productIDs += `${productId},`;
      }),
    );

    await this.services.opportunity.updateById(opportunityId, {
      Sent_From_API__c: true,
      Product__c: productIDs.slice(0, -1),
      Action_Date__c: actionDate,
      Reason_of_New_Opportunity__c: type,
    });

    const { External_ID__c: newOpportunityId } = await this.services.opportunity.getByOrderStatus(
      orderStatus.DRAFT,
      partnerId,
      serviceId,
    );

    return { id: newOpportunityId, serviceId };
  }

  async updateOrder(payload) {
    const { partnerId, id, ...updateData } = payload;

    if (isEmpty(updateData)) {
      throw new ValidationError(errorMessages.allParamsNotSet);
    }

    const order = await this.models.OrderSalesforce.getOrderById({ id, partnerId });

    if (partnerId) {
      OrderService.validateUpdatePayload(order);
    }

    const contactId = get(order, 'Related_Opportunity__r.End_User_Contact__r.External_ID__c');

    const [opportunity, contact] = await Promise.all([
      this.services.opportunity.getByExternalId(id),
      this.services.contact.getByExternalId(contactId),
    ]);

    if (opportunity.StageName !== stageNames.PROGRESSING && updateData.status === orderStatus.DRAFT) {
      throw new ValidationError(errorMessages.orderAlreadyDraft);
    }

    if (opportunity.StageName === stageNames.PROGRESSING && updateData.status === orderStatus.DRAFT) {
      await this.services.opportunity.updateById(opportunity.Id, {
        StageName: stageNames.CLOSED_WON,
      });

      // for now we are only allowed to make Retail order Draft
      // all other update actions are not implemented for Pending retail order
      return id;
    }

    const { installationSite, products, actionDate, status, serviceDelivery } = updateData;

    const actions = new Map();

    actions.set(
      {
        condition: !isEmpty(products),
        params: [order, products, partnerId, contact.Company_Name__c],
      },
      this.updateProduct,
    );
    actions.set(
      {
        condition: !isEmpty(installationSite),
        params: [installationSite, opportunity.Id],
      },
      this.updateInstallationSite,
    );
    actions.set(
      {
        condition: !!actionDate,
        params: [order, opportunity, actionDate, partnerId],
      },
      this.updateActionDate,
    );
    actions.set(
      {
        condition: !!status,
        params: [order, opportunity, status, partnerId],
      },
      this.updateStatus,
    );
    actions.set(
      {
        condition: !!serviceDelivery,
        params: [order, serviceDelivery],
      },
      this.updateServiceDelivery,
    );

    await Promise.all(
      [...actions.entries()].filter(([key]) => key.condition).map(([key, value]) => value.apply(this, key.params)),
    );

    return id;
  }

  async updateProduct(order, products, partnerId, companyName) {
    const category = partnerId ? categories.WHOLESALE : categories.RETAIL;

    const productsData = await Promise.all(
      products.map((product) => this.services.productService.getById(category, product.productId)),
    );

    productsData.forEach(({ data: product }) => OrderService.validateProduct(companyName, product));

    const [orderItems, opportunityLineItems] = await Promise.all([
      this.models.OrderItem.getByOrderId(order.Id),
      this.models.OpportunityLineItem.getAllByOpportunityId(order.Related_Opportunity__c),
    ]);

    await Promise.all([
      ...orderItems.map((orderItem) => this.services.orderItem.delete(orderItem.Id)),
      ...opportunityLineItems.map((opportunityLineItem) =>
        this.services.opportunityLineItem.delete(opportunityLineItem.Id),
      ),
    ]);

    const pricebookEntries = await Promise.all(
      productsData.map(({ data: product }) => this.getPricebookEntry(priceBookNames[category], product.id)),
    );

    await Promise.all(
      pricebookEntries.map((pricebookEntry) =>
        Promise.all([
          this.services.opportunityLineItem.create(pricebookEntry, order.Related_Opportunity__c),
          this.services.orderItem.create(pricebookEntry, order.Id),
        ]),
      ),
    );
  }

  async updateInstallationSite(installationSite, opportunityId) {
    const { propertyType, propertyId, buildingId, streetUnitId } = await this.services.propertyService.getProperty(
      installationSite.uprn,
    );
    const params = {
      Street_Unit__c: streetUnitId,
      Building__c: buildingId,
      Organisation_Name__c: null,
      Flat_Lookup__c: null,
    };

    // eslint-disable-next-line default-case
    switch (propertyType) {
      case propertyTypes.BUSINESS:
        params.Organisation_Name__c = propertyId;
        break;
      case propertyTypes.RESIDENTIAL:
        params.Flat_Lookup__c = propertyId;
        break;
    }

    await this.services.opportunity.updateById(opportunityId, params);
  }

  async updateActionDate(order, opportunity, actionDate, partnerId) {
    if (![orderTypes.UPGRADE, orderTypes.DOWNGRADE].includes(order.Order_category__c)) {
      throw new ValidationError(errorMessages.orderIsNotUpgradeDowngrade);
    }

    const updateQuery = { Action_Date__c: actionDate };

    const oldOpportunity = await this.services.opportunity.getByOrderStatus(
      orderStatus.LIVE,
      partnerId,
      opportunity.Service_ID__c,
    );

    await Promise.all([
      this.services.opportunity.updateById(opportunity.Id, updateQuery),
      this.services.opportunity.updateById(oldOpportunity.Id, updateQuery),
    ]);
  }

  async updateStatus(order, opportunity, status, partnerId) {
    let opportunityUpdate = null;
    let orderUpdate = null;

    if (status === orderStatus.CANCELLED) {
      opportunityUpdate = {
        StageName: stageNames.CLOSED_LOST,
        Loss_Reason__c: opportunityLossReasons.SERVICE_CANCELLED,
      };

      orderUpdate = {
        Status: status,
        Reason_for_cancellation__c: orderCancellationReasons.CUSTOMER_CHANGED_MIND,
      };

      await this.publishCancelOrderNotification(
        partnerId,
        order.External_ID__c,
        order.RecordType.Name,
        order.S_Tag__c,
        order.C_Tag__c,
      );
    }

    await Promise.all([
      opportunityUpdate && this.services.opportunity.updateById(opportunity.Id, opportunityUpdate),
      orderUpdate && this.updateById(order.Id, orderUpdate),
    ]);
  }

  updateById(id, data) {
    return this.models.OrderSalesforce.updateOrder({
      Id: id,
      ...data,
    });
  }

  async updateServiceDelivery(order, serviceDelivery) {
    await this.models.OrderSalesforce.updateOrder({
      Id: order.Id,
      Date_Time_survey_booked__c: get(serviceDelivery, 'survey.booked.date'),
      Survey_Booked_Delay_Reason__c: get(serviceDelivery, 'survey.booked.delayReason'),

      Date_Survey_Completed__c: get(serviceDelivery, 'survey.completed.date'),
      Survey_Completed_Delay_Reason__c: get(serviceDelivery, 'survey.completed.delayReason'),

      Date_Wayleave_Agreement_Sent__c: get(serviceDelivery, 'wayleave.sent.date'),
      Wayleave_sent_to_Lawyer_Delay_Reason__c: get(serviceDelivery, 'wayleave.sent.delayReason'),

      Date_Lawyer_Signed_off_Wayleave__c: get(serviceDelivery, 'wayleave.signed.date'),
      Lawyer_signed_off_wayleave_Delay_Reason__c: get(serviceDelivery, 'wayleave.signed.delayReason'),

      SLD_completed__c: !!get(serviceDelivery, 'installation.booked.date') || order.SLD_completed__c,
      Installation_Date__c: get(serviceDelivery, 'installation.booked.date'),
      Install_Booked_Delay_Reason__c: get(serviceDelivery, 'installation.booked.delayReason'),

      ActivatedDate: get(serviceDelivery, 'installation.completed.date'),
    });
  }

  async publishCancelOrderNotification(partnerId, orderId, orderType, sTag, cTag) {
    const order = await this.getOrderById(orderId);
    const appointments = [
      order.serviceDelivery.survey.booked.appointmentId,
      order.serviceDelivery.installation.booked.appointmentId,
    ].filter((item) => item);

    const params = {
      Message: JSON.stringify({
        partnerId,
        orderId,
        orderType,
        sTag,
        cTag,
        appointments,
      }),
      TopicArn: this.orderCancelledTopicArn,
    };

    return new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();
  }

  async getOrderById(id, partnerId) {
    const order = await this.models.OrderSalesforce.getOrderById({ id, partnerId });

    if (order) {
      const data = {
        ...(await this.getExternalData(order)),
        ...order,
      };

      const [mappedOrder] = this.models.OrderSalesforce.mapOrderResponse([data]);

      return mappedOrder;
    }

    const opportunity = await this.services.opportunity.getByExternalId(id, partnerId);

    if (!opportunity) {
      throw new NotFoundError(errorMessages.orderNotFound);
    }

    const [opportunityLineItems, property] = await Promise.all([
      this.services.opportunityLineItem.getAllByOpportunityId(opportunity.Id),
      opportunity.UPRN__c ? this.services.propertyService.getProperty(opportunity.UPRN__c) : {},
    ]);

    return {
      id: opportunity.External_ID__c,
      orderNumber: null,
      orderDate: opportunity.CloseDate || null,
      status: opportunity.StageName === stageNames.PROGRESSING ? orderStatus.PENDING : orderStatus.DRAFT,
      type: opportunity.Type,
      serviceId: null,
      actionDate: null,
      partnerId: null,
      contactId: get(opportunity, 'Account.Contact__r.External_ID__c') || null,
      installationSite: {
        uprn: opportunity.UPRN__c,
        streetNumber: property.streetNumber,
        street: this.models.OrderSalesforce.getStreetName(property.streetUnitName),
        postcode: property.postcode || null,
      },
      serviceDelivery: {
        survey: {
          booked: {
            date: null,
            delayReason: null,
            appointmentId: null,
          },
          completed: {
            date: null,
            delayReason: null,
          },
        },
        wayleave: {
          sent: {
            date: null,
            delayReason: null,
          },
          signed: {
            date: null,
            delayReason: null,
          },
        },
        installation: {
          booked: {
            date: null,
            delayReason: null,
            appointmentId: null,
          },
          completed: {
            date: null,
          },
        },
      },
      products: opportunityLineItems.map((oppLineItem) => ({
        productId: get(oppLineItem, 'Product2.External_ID__c'),
        productName: get(oppLineItem, 'Product2.Name'),
      })),
      streetUnit: {
        name: get(opportunity, 'Street_Unit__r.Name'),
        cabName: get(opportunity, 'Street_Unit__r.Cabinet_Name__c'),
      },
      circuitConfiguration: {
        ontId: null,
        ontSerialNo: null,
        servicePort: null,
        sTag: null,
        cTag: null,
        f: null,
        s: null,
        p: null,
      },
      createdBy: get(opportunity, 'Account.Name'),
      createdAt: opportunity.CreatedDate,
      updatedBy: get(opportunity, 'Account.Name'),
      updatedAt: opportunity.LastModifiedDate,
    };
  }

  async getOrderByServiceId(partnerId, serviceId) {
    const order = await this.models.OrderSalesforce.getOrderByServiceId({ serviceId, partnerId });

    if (!order) {
      throw new NotFoundError(errorMessages.orderNotFound);
    }

    return order;
  }

  async getOrderCollection(partnerId, status, pageNum, pageSize) {
    const result = await this.models.OrderSalesforce.getOrderCollection({
      partnerId,
      status,
      pageNum,
      pageSize,
    });

    const populatedOrders = await Promise.all(
      (result.data || result).map(async (order) => {
        const externalData = await this.getExternalData(order);
        return {
          ...order,
          products: externalData.products,
          streetUnit: externalData.streetUnit,
          propertyDetails: externalData.propertyDetails,
          contact: externalData.contact,
          appointments: externalData.appointments,
        };
      }),
    );
    const mappedOrders = this.models.OrderSalesforce.mapOrderResponse(populatedOrders);

    return pageNum && pageSize ? { ...result, data: mappedOrders } : { data: mappedOrders };
  }

  async getProducts(orderId) {
    const orderItems = await this.models.OrderItem.getByOrderId(orderId);

    return orderItems.map((orderItem) => ({
      id: get(orderItem, 'Product2.External_ID__c'),
      name: get(orderItem, 'Product2.Name'),
    }));
  }

  async getExternalData(order) {
    const uprn = order.Related_Opportunity__r.UPRN__c;
    const surveyBookedDated = order.Date_Time_survey_booked__c;
    const installationBookedDate = order.Installation_Date__c;

    const [streetUnit, products, propertyDetails, { data: appointments }] = await Promise.all([
      this.getStreetUnit(order.Street_Unit_Wholesale__c),
      this.getProducts(order.Id),
      uprn ? this.services.propertyService.getProperty(uprn) : {},
      surveyBookedDated || installationBookedDate
        ? this.services.appointmentService.getCollection({
            orderId: order.External_ID__c,
          })
        : [],
    ]);

    return { streetUnit, products, propertyDetails, appointments };
  }

  logAndCheckErrorMessage(data, message) {
    if (!isEmpty(data.errors)) {
      this.logger.error(data.errors);
      throw new ValidationError(message);
    }
  }

  async getPricebookEntry(priceBookName, productId) {
    const priceBookEntry = await this.models.PricebookEntry.getPricebookEntry(priceBookName, productId);

    if (isEmpty(priceBookEntry)) {
      throw new NotFoundError(
        `${errorMessages.productIsNotFound} with ID: ${productId} and Price book name: ${priceBookName}`,
      );
    }

    this.logAndCheckErrorMessage(priceBookEntry, errorMessages.unableToGetPriceBookEntry);

    return priceBookEntry[0];
  }

  async getStreetUnit(streetUnitId) {
    const streetUnitData = (await this.models.Street.getStreetUnit(streetUnitId))[0];

    if (!streetUnitData) {
      return null;
    }

    streetUnitData.cabName =
      get(streetUnitData, 'New_Backhauled_To_Cab__r.Name') ||
      get(streetUnitData, 'New_Backhauled_To_Cab__r.Name') ||
      null;

    streetUnitData.olt = null;
    streetUnitData.preAgg = null;

    if (streetUnitData.cabName) {
      streetUnitData.olt = `olt.${streetUnitData.cabName.toLowerCase()}`;
      streetUnitData.preAgg = `pre-agg.${streetUnitData.cabName.toLowerCase()}`;
    }

    return streetUnitData;
  }

  async updateCircuit({ serviceId, id, partnerId, ...circuitData }) {
    const order = serviceId
      ? await this.getOrderByServiceId(partnerId, serviceId)
      : await this.getOrderById(id, partnerId);

    await this.models.OrderSalesforce.updateOrderCircuitData({
      id: order.Id,
      ontId: order.ONT_ID__c,
      ontSerialNo: order.ONT_Serial_No__c,
      servicePort: order.Service_Port__c,
      sTag: order.S_Tag__c,
      cTag: order.C_Tag__c,
      F: order.F__c,
      S: order.S__c,
      P: order.P__c,
      ...circuitData,
    });
  }
}

module.exports = OrderService;
