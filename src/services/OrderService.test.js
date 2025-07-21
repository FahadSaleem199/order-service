const assert = require('assert').strict;
const sinon = require('sinon');
const get = require('lodash.get');
const { Schema } = require('@g-network/service-chassis/middleware');
const {
  orderStatus,
  orderTypes,
  errorMessages,
  residentialOrBusinessFields,
  stageNames,
  recordTypes,
  productTypes,
  opportunityLossReasons,
  orderCancellationReasons,
  categories,
  priceBookNames,
} = require('../constants');

const OrderService = require('./OrderService');

const sandbox = sinon.createSandbox();

const models = {
  Street: {
    getStreetUnit: async () => {},
  },
  OrderSalesforce: {
    getOrderById: async () => {},
    getOrderByServiceId: async () => {},
    getOrderCollection: async () => {},
    updateOrder: async () => {},
    mapOrderResponse: () => {},
    updateOrderCircuitData: () => {},
    getPendingUpgradeDowngradeOrder: () => {},
    getStreetName: () => {},
  },
  PricebookEntry: {
    getPricebookEntry: async () => {},
  },
  Account: {
    create: async () => {},
    getById: async () => {},
  },
  OrderItem: {
    getByOrderId: async () => {},
  },
  OpportunityLineItem: {
    getAllByOpportunityId: async () => {},
  },
};

const services = {
  opportunity: {
    create: async () => {},
    updateById: async () => {},
    getById: async () => {},
    getByExternalId: async () => {},
    getByOrderStatus: async () => {},
  },
  contact: {
    create: async () => {},
    updateById: async () => {},
    getById: async () => {},
    getByExternalId: async () => {},
  },
  opportunityLineItem: {
    create: async () => {},
    delete: async () => {},
    getByOpportunityId: async () => {},
    getAllByOpportunityId: async () => {},
  },
  orderItem: {
    create: async () => {},
    delete: async () => {},
    getByOrderId: async () => {},
  },
  propertyService: {
    getProperty: async () => {},
  },
  productService: {
    getById: async () => {},
  },
  appointmentService: {
    getCollection: async () => {},
  },
};

const contactObj = {
  id: 'adf786adf5a78df5aQ',
  errors: [],
};

const getContactObj = {
  attributes: {
    type: 'Contact',
    url: '/services/data/v42.0/sobjects/Contact/0030C000008vWvrQAE',
  },
  Id: contactObj.id,
  Company_Name__c: null,
  FirstName: 'Dark',
  LastName: 'knight',
  Phone: '07777 777777',
  Email: 'robmacgregor@g.network',
  Street__c: null,
  Building__c: null,
  Flat__c: 'a1Z0C0000062OjSUAU',
  Organisation_Name__c: null,
  RecordType: {
    Name: recordTypes.WHOLESALE_CONTACT,
  },
};

const updateOpportunityObj = { id: '0060C0000036BiQQAU', success: true, errors: [] };
const oppCreatedObj = { id: '0060C0000036BiQQAU', success: true, errors: [] };
const pBbook2Obj = [
  {
    attributes: {
      type: 'PricebookEntry',
      url: '/services/data/v42.0/sobjects/PricebookEntry/01u4I00000p6CdFQAU',
    },
    Id: '01u4I00000p6CdFQAU',
    UnitPrice: 0,
    Pricebook2Id: '01u4I00000p6CdFQAU',
    Product2Id: '01t4I0000061ykyQAA',
  },
];

const createLineItemObj = { id: '00k0C000003D3swQAC', success: true, errors: [] };
const createOrderItemObj = { id: '8020C000000kzO6QAI', success: true, errors: [] };
const deleteLineItemObj = { id: '00k0C000003D3r0QAC', success: true, errors: [] };
const deleteOrderItemObj = { id: '8020C000000kzMoQAI', success: true, errors: [] };

const lineItemObj = [
  {
    attributes: {
      type: 'OpportunityLineItem',
      url: '/services/data/v42.0/sobjects/OpportunityLineItem/00k0C000003D3r0QAC',
    },
    Id: '00k0C000003D3r0QAC',
  },
];

const orderItems = [
  {
    attributes: {
      type: 'OrderItem',
      url: '/services/data/v42.0/sobjects/OrderItem/8020C000000kzMoQAI',
    },
    Id: '8020C000000kzMoQAI',
    PricebookEntryId: '1111C000000kzMoQAI',
  },
];

const opportunityObj = {
  Id: '0040D0000090C9ASFZ',
  attributes: {
    type: 'Opportunity',
    url: '/services/data/v42.0/sobjects/Opportunity/0060C000003aLagQAE',
  },
  Loss_Reason__c: null,
  Type: 'New Business',
  End_User_Contact__c: '0030C0000070J7DQAU',
  End_User_Contact__r: {
    attributes: {
      type: 'Contact',
      url: '/services/data/v42.0/sobjects/Contact/0030C0000070J7DQAU',
    },
    FirstName: 'Third',
    LastName: 'Test',
    Phone: '+923130000444',
    Email: 'thirdtest@gmail.com',
  },
  UPRN__c: 787,
  Res_or_Bus__c: 'Business',
  Service_ID__c: 'S-0000007',
  StageName: 'Progressing',
};

const pbEntryObj = [
  {
    attributes: {
      type: 'PricebookEntry',
      url: '/services/data/v42.0/sobjects/PricebookEntry/01u0C000001tsapQAA',
    },
    Id: '01u4I00000p6CdFQAU',
    Name: 'Business Oct-19 3 year PROMO',
    UnitPrice: 0,
    Pricebook2Id: '01u4I00000p6CdFQAU',
    Product2Id: '01t4I0000061ykyQAA',
  },
];

let partnerId = 'D3E1C2A3a5a6FaFa8a9a76a3';
const streetUnit = 'adg adf 3';
const productId = '5e6b7582d2c9190008bc625d';
const id = '4ea3fe9e-97f8-493a-9b35-88b523b8937d';
const contactId = 'ea712ae8-e389-11ea-87d0-0242ac130003';

const type = orderTypes.NEW_BUSINESS;

const product = {
  id: productId,
  name: '1 Month Free Offer',
  type: productTypes.RESIDENTIAL,
};

const propertyObj = {
  uprn: '777',
  streetNumber: '123456',
  postcode: '82000',
  propertyType: 'residential',
  propertyId: 'a1Z0C0000062OjSUAU',
  propertySurveyComplete: true,
  buildingSurveyComplete: false,
  streetUnitStatus: { code: 100, message: 'Ready For Service' },
  streetUnitName: 'TestStreet 1',
  buildingId: '1234',
  streetUnitId: '56789',
};

const orderParams = {
  installationSite: {
    uprn: '777',
  },
  contactId,
  partnerId,
  id,
  type,
  streetUnit,
  products: [
    {
      productId,
    },
  ],
};

const opportunityNameBusiness = `testCompany - ${propertyObj.streetUnitName} ${propertyObj.streetNumber}`;
const opportunityNameResidential = `${getContactObj.FirstName} ${getContactObj.LastName} - ${propertyObj.streetUnitName} ${propertyObj.streetNumber}`;
const resOrBussForRes = residentialOrBusinessFields.RESIDENTIAL;
const resOrBussForBus = residentialOrBusinessFields.BUSINESS;

const productObj = {
  id: '5e86fafcb4b6b50007a73787',
  name: 'Business Oct-19 3 year PROMO',
  type: productTypes.RESIDENTIAL,
};

const appointmentObj = {
  id: 'f451bf69-9545-47cb-b4a6-49a32ef7c08c',
  partnerId: '9f1a5ad3-4d42-4f22-b8ab-477eb38daa26',
  appointmentType: 'Standard Survey',
  status: 'In Progress',
  orderId: '1ff254a1-4fd0-4ba0-b352-61de4a2148af',
  caseId: 'f32a2130-6eaf-4567-b830-680a60855c8a',
  startDateTime: '2020-06-26T10:00:00.000+0000',
  finishDateTime: '2020-06-26T10:00:00.000+0000',
  createdAt: '2020-06-26T10:01:58.000+0000',
  createdBy: 'Fahad Saleem',
};

const logger = {
  info: () => {},
  error: () => {},
};

const service = new OrderService({ models, services, logger });

function testService(serviceName, params, errorType, details) {
  return assert.rejects(service[serviceName](params), (err) => {
    assert.strictEqual(err.name, errorType);
    assert.strictEqual(err.message, details);
    return true;
  });
}

describe('OrderService', () => {
  beforeEach(() => {
    sandbox.stub(logger, 'error').resolves('Test Log');
  });
  afterEach(() => {
    sandbox.restore();
  });

  const getOrderData = [
    {
      attributes: { type: 'Order', url: '/services/data/v42.0/sobjects/Order/8010C000000SqjSQAS' },
      AccountId: '0010C000009d64CQAQ',
      External_ID__c: '4ea3fe9e-97f8-493a-9b35-88b523b8937d',
      EffectiveDate: '2019-11-24',
      Status: 'Draft',
      Related_Opportunity__c: '0060C000003aLagQAE',
      Id: '8010C000000SqjSQAS',
      ServiceId__c: 'S-00000001',
      Date_Survey_Booked_for__c: null,
      Date_Time_survey_booked__c: '2020-06-12',
      Survey_Booked_Delay_Reason__c: 'Customer unwilling to commit to a date',
      Date_Survey_Completed__c: '2020-06-12',
      Survey_Completed_Delay_Reason__c: 'Unable to contact customer',
      Date_Wayleave_Agreement_Sent__c: '2020-06-12',
      Wayleave_sent_to_Lawyer_Delay_Reason__c: 'Unable to contact customer',
      Date_Lawyer_Signed_off_Wayleave__c: '2020-06-12',
      Lawyer_signed_off_wayleave_Delay_Reason__c: 'slow response from lawyer',
      Date_Pack_Generated__c: null,
      Date_Pack_Sent_to_Lawyer__c: null,
      Install_Booked_Delay_Reason__c: 'Customer Access Issue',
      Installation_Date__c: null,
      ActivatedDate: '2020-04-20',
      Related_Opportunity__r: {
        attributes: {
          type: 'Opportunity',
          url: '/services/data/v42.0/sobjects/Opportunity/0060C000003aLagQAE',
        },
        Type: 'New Business',
        End_User_Contact__r: {
          External_ID__c: 'fb1d8f86-eb76-11ea-adc1-0242ac120002',
        },
        UPRN__c: 777,
        External_ID__c: 'qwert123',
      },
      RecordType: {
        Name: 'Wholesale Order',
      },
      F__c: 8,
      S__c: 12,
      P__c: 3,
      S_Tag__c: 3001,
      C_Tag__c: 4,
      Service_Port__c: 302,
      ONT_ID__c: 123,
      ONT_Serial_No__c: 'SRG457-35SGFHR-45DF',
      Street_Unit_Wholesale__c: 'TestStreet 1',
      Order_category__c: orderTypes.UPGRADE,
      Pricebook2Id: '0080C000003fLagQAS',
      Account: {
        External_ID__c: '4ea3fe9e-97f8-493a-9b35-88b523b8937q',
      },
      orderNumber: '0005460',
    },
  ];

  const streetData = [
    {
      attributes: {
        type: 'Street_Unit__c',
        url: '/services/data/v42.0/sobjects/Street_Unit__c/a000C000003KuKNQA0',
      },
      Id: 'a000C000003KuKNQA0',
      Name: 'TestStreet 1',
      New_Backhauled_To_Cab__r: null,
      Backhauled_To_Cab__r: {
        attributes: {
          type: 'Cabs__c',
          url: '/services/data/v42.0/sobjects/Cabs__c/a1J0C000000XGBlUAO',
        },
        Name: 'testCab',
      },
      cabName: 'testCab',
    },
  ];

  const getOrderCollectionData = [
    {
      attributes: { type: 'Order', url: '/services/data/v42.0/sobjects/Order/8010C000000SqjSQAS' },
      AccountId: '0010C000009d64CQAQ',
      External_ID__c: 'ac420442-1248-4409-bf3a-7ce77d9610f1',
      EffectiveDate: '2019-11-24',
      Status: 'Draft',
      Related_Opportunity__c: '0060C000003aLagQAE',
      Id: '8010C000000SqjSQAS',
      ServiceId__c: 'S-00000001',
      Date_Time_survey_booked__c: '2020-06-12',
      Survey_Booked_Delay_Reason__c: 'Customer unwilling to commit to a date',
      Date_Survey_Completed__c: '2020-06-12',
      Survey_Completed_Delay_Reason__c: 'Unable to contact customer',
      Date_Wayleave_Agreement_Sent__c: '2020-06-12',
      Wayleave_sent_to_Lawyer_Delay_Reason__c: 'Unable to contact customer',
      Date_Lawyer_Signed_off_Wayleave__c: '2020-06-12',
      Lawyer_signed_off_wayleave_Delay_Reason__c: 'slow response from lawyer',
      Date_Pack_Generated__c: null,
      Date_Pack_Sent_to_Lawyer__c: null,
      Install_Booked_Delay_Reason__c: 'Customer Access Issue',
      Installation_Date__c: '2020-04-20',
      ActivatedDate: '2020-04-20',
      Related_Opportunity__r: {
        attributes: {
          type: 'Opportunity',
          url: '/services/data/v42.0/sobjects/Opportunity/0060C000003aLagQAE',
        },
        Type: 'New Business',
        End_User_Contact__c: '0032600000ni5mkAAA',
        UPRN__c: 777,
      },
      F__c: 8,
      S__c: 12,
      P__c: 3,
      S_Tag__c: 3001,
      C_Tag__c: 4,
      Service_Port__c: 302,
      ONT_ID__c: 123,
      ONT_Serial_No__c: 'SRG457-35SGFHR-45DF',
      Street_Unit_Wholesale__c: 'TestStreet 1',
      Pricebook2Id: '0080C000003fLagQAS',
      Account: {
        External_ID__c: '4ea3fe9e-97f8-493a-9b35-88b523b8937q',
      },
      orderNumber: '0005460',
    },
    {
      attributes: { type: 'Order', url: '/services/data/v42.0/sobjects/Order/8010C000000SqjSQAS' },
      AccountId: '0010C000009d64CQAQ',
      External_ID__c: 'ac420442-1248-4409-bf3a-7ce77d9610f1',
      EffectiveDate: '2019-11-24',
      Status: 'Draft',
      Related_Opportunity__c: '0060C000003aLagQAE',
      Id: '8010C000000SqjSQAS',
      ServiceId__c: 'S-00000001',
      Date_Time_survey_booked__c: '2020-06-12',
      Survey_Booked_Delay_Reason__c: 'Customer unwilling to commit to a date',
      Date_Survey_Completed__c: '2020-06-12',
      Survey_Completed_Delay_Reason__c: 'Unable to contact customer',
      Date_Wayleave_Agreement_Sent__c: '2020-06-12',
      Wayleave_sent_to_Lawyer_Delay_Reason__c: 'Unable to contact customer',
      Date_Lawyer_Signed_off_Wayleave__c: '2020-06-12',
      Lawyer_signed_off_wayleave_Delay_Reason__c: 'slow response from lawyer',
      Date_Pack_Generated__c: null,
      Date_Pack_Sent_to_Lawyer__c: null,
      Install_Booked_Delay_Reason__c: 'Customer Access Issue',
      Installation_Date__c: '2020-04-20',
      ActivatedDate: '2020-04-20',
      Related_Opportunity__r: {
        attributes: {
          type: 'Opportunity',
          url: '/services/data/v42.0/sobjects/Opportunity/0060C000003aLagQAE',
        },
        Type: 'New Business',
        End_User_Contact__c: '0032600000ni5mkAAA',
        UPRN__c: 777,
      },
      F__c: 8,
      S__c: 12,
      P__c: 3,
      S_Tag__c: 3001,
      C_Tag__c: 4,
      Service_Port__c: 302,
      ONT_ID__c: 123,
      ONT_Serial_No__c: 'SRG457-35SGFHR-45DF',
      Street_Unit_Wholesale__c: 'TestStreet 1',
      Pricebook2Id: '0080C000003fLagQAS',
      Account: {
        External_ID__c: '4ea3fe9e-97f8-493a-9b35-88b523b8937q',
      },
      orderNumber: '0004460',
    },
    {
      attributes: { type: 'Order', url: '/services/data/v42.0/sobjects/Order/8010C000000SqjSQAS' },
      AccountId: '0010C000009d64CQAQ',
      External_ID__c: 'ac420442-1248-4409-bf3a-7ce77d9610f1',
      EffectiveDate: '2019-11-24',
      Status: 'Draft',
      Related_Opportunity__c: '0060C000003aLagQAE',
      Id: '8010C000000SqjSQAS',
      ServiceId__c: 'S-00000001',
      Date_Time_survey_booked__c: '2020-06-12',
      Survey_Booked_Delay_Reason__c: 'Customer unwilling to commit to a date',
      Date_Survey_Completed__c: '2020-06-12',
      Survey_Completed_Delay_Reason__c: 'Unable to contact customer',
      Date_Wayleave_Agreement_Sent__c: '2020-06-12',
      Wayleave_sent_to_Lawyer_Delay_Reason__c: 'Unable to contact customer',
      Date_Lawyer_Signed_off_Wayleave__c: '2020-06-12',
      Lawyer_signed_off_wayleave_Delay_Reason__c: 'slow response from lawyer',
      Date_Pack_Generated__c: null,
      Date_Pack_Sent_to_Lawyer__c: null,
      Install_Booked_Delay_Reason__c: 'Customer Access Issue',
      Installation_Date__c: '2020-04-20',
      ActivatedDate: '2020-04-20',
      Related_Opportunity__r: {
        attributes: {
          type: 'Opportunity',
          url: '/services/data/v42.0/sobjects/Opportunity/0060C000003aLagQAE',
        },
        Type: 'New Business',
        End_User_Contact__c: '0032600000ni5mkAAA',
        UPRN__c: 777,
      },
      F__c: 8,
      S__c: 12,
      P__c: 3,
      S_Tag__c: 3001,
      C_Tag__c: 4,
      Service_Port__c: 302,
      ONT_ID__c: 123,
      ONT_Serial_No__c: 'SRG457-35SGFHR-45DF',
      Street_Unit_Wholesale__c: 'TestStreet 1',
      Pricebook2Id: '0080C000003fLagQAS',
      Account: {
        External_ID__c: '4ea3fe9e-97f8-493a-9b35-88b523b8937q',
      },
      orderNumber: '0003460',
    },
  ];

  const mappedOrders = [
    {
      orderNumber: 'fe28aa3b-0b15-46d2-8a74-ce9e52d69397',
      orderDate: '2020-03-10',
      orderStatus: 'Draft',
      property: {
        address_line_1: 'dummy add 1',
        address_line_2: 'dummy add 2',
        address_line_3: 'dummy add 3',
      },
      products: [
        {
          product: 'dummy_id',
          product_name: 'dummy_name',
          product_type: 'dummy_type',
        },
      ],
      createdBy: 'GNetworks API User',
      createdAt: '2020-06-11T12:52:39.000+0000',
      updatedBy: 'GNetworks API User',
      updatedAt: '2020-06-18T11:27:58.000+0000',
    },
    {
      orderNumber: 'ce1b83a3-6804-43ac-9656-677fb48e2f8a',
      orderDate: '2020-03-06',
      orderStatus: 'Draft',
      property: {
        address_line_1: 'dummy add 1',
        address_line_2: 'dummy add 2',
        address_line_3: 'dummy add 3',
      },
      products: [
        {
          product: 'dummy_id',
          product_name: 'dummy_name',
          product_type: 'dummy_type',
        },
      ],
      createdBy: 'GNetworks API User',
      createdAt: '2020-06-11T12:52:39.000+0000',
      updatedBy: 'GNetworks API User',
      updatedAt: '2020-06-18T11:27:58.000+0000',
    },
  ];

  describe('Create Order', () => {
    const getAccountResult = { Id: '1234566789', RecordType: { Name: recordTypes.WHOLESALE_ACCOUNT } };
    const isWholesale = true;

    it('should create an order for residential product', async () => {
      const stubGetProperty = sandbox.stub(services.propertyService, 'getProperty').resolves(propertyObj);
      const stubGetProduct = sandbox.stub(services.productService, 'getById').resolves({
        data: product,
      });

      const stubGetContact = sandbox.stub(services.contact, 'getByExternalId').resolves(getContactObj);
      const stubCreateOpportunity = sandbox.stub(services.opportunity, 'create').resolves(oppCreatedObj);
      const stubGetPricebookEntry = sandbox.stub(models.PricebookEntry, 'getPricebookEntry').resolves(pBbook2Obj);
      const stubCreateLineItem = sandbox.stub(services.opportunityLineItem, 'create').resolves(lineItemObj);
      const stubUpdateOpportunity = sandbox.stub(services.opportunity, 'updateById').resolves(updateOpportunityObj);
      const stubGetAccountById = sandbox.stub(models.Account, 'getById').resolves(getAccountResult);
      const stubWsOrderCreatedNotification = sandbox.stub(service, 'wsOrderCreatedNotification');

      const order = await service.createOrder(orderParams);

      sinon.assert.calledOnceWithExactly(stubGetAccountById, orderParams.partnerId);

      sinon.assert.calledOnceWithExactly(stubGetProperty, orderParams.installationSite.uprn);
      sinon.assert.calledOnceWithExactly(stubGetProduct, categories.WHOLESALE, orderParams.products[0].productId);

      sinon.assert.calledOnceWithExactly(stubGetContact, contactId);

      sinon.assert.calledOnceWithExactly(stubCreateOpportunity, {
        opportunityName: opportunityNameResidential,
        partnerId,
        priceBookName: priceBookNames[categories.WHOLESALE],
        recordType: recordTypes.WHOLESALE_OPPORTUNITY,
        residentialOrBusiness: resOrBussForRes,
        stageName: stageNames.PROGRESSING,
        contactId: getContactObj.Id,
        type,
        buildingId: propertyObj.buildingId,
        streetUnitId: propertyObj.streetUnitId,
        propertyType: propertyObj.propertyType,
        propertyId: propertyObj.propertyId,
        isWholesale,
      });
      sinon.assert.calledOnceWithExactly(stubGetPricebookEntry, priceBookNames[categories.WHOLESALE], product.id);
      sinon.assert.calledOnceWithExactly(stubCreateLineItem, pBbook2Obj[0], oppCreatedObj.id);
      sinon.assert.calledOnceWithExactly(stubUpdateOpportunity, oppCreatedObj.id, {
        StageName: stageNames.CLOSED_WON,
      });

      sinon.assert.calledOnce(stubWsOrderCreatedNotification);
      assert.equal(stubWsOrderCreatedNotification.firstCall.args[0], partnerId);
      Schema.assert(stubWsOrderCreatedNotification.firstCall.args[1], Schema.string().guid());
      assert.equal(stubWsOrderCreatedNotification.firstCall.args[2], productTypes.RESIDENTIAL);

      Schema.assert(order.id, Schema.string().guid());
      assert.strictEqual(order.serviceId, null);
    });

    it('should create an order for business product', async () => {
      const stubGetProperty = sandbox
        .stub(services.propertyService, 'getProperty')
        .resolves({ ...propertyObj, propertyType: 'business' });
      const stubGetProduct = sandbox.stub(services.productService, 'getById').resolves({
        data: { ...product, type: productTypes.BUSINESS },
      });

      const stubGetContact = sandbox
        .stub(services.contact, 'getByExternalId')
        .resolves({ ...getContactObj, Company_Name__c: 'testCompany' });
      const stubCreateOpportunity = sandbox.stub(services.opportunity, 'create').resolves(oppCreatedObj);
      const stubGetPricebookEntry = sandbox.stub(models.PricebookEntry, 'getPricebookEntry').resolves(pBbook2Obj);
      const stubCreateLineItem = sandbox.stub(services.opportunityLineItem, 'create').resolves(lineItemObj);
      const stubUpdateOpportunity = sandbox.stub(services.opportunity, 'updateById').resolves(updateOpportunityObj);
      const stubGetAccountById = sandbox.stub(models.Account, 'getById').resolves(getAccountResult);
      const stubWsOrderCreatedNotification = sandbox.stub(service, 'wsOrderCreatedNotification');

      const order = await service.createOrder({
        ...orderParams,
        contactId,
      });

      sinon.assert.calledOnceWithExactly(stubGetAccountById, orderParams.partnerId);

      sinon.assert.calledOnceWithExactly(stubGetProperty, orderParams.installationSite.uprn);
      sinon.assert.calledOnceWithExactly(stubGetProduct, categories.WHOLESALE, orderParams.products[0].productId);

      sinon.assert.calledOnceWithExactly(stubGetContact, contactId);

      sinon.assert.calledOnceWithExactly(stubCreateOpportunity, {
        opportunityName: opportunityNameBusiness,
        partnerId,
        priceBookName: priceBookNames[categories.WHOLESALE],
        recordType: recordTypes.WHOLESALE_OPPORTUNITY,
        residentialOrBusiness: resOrBussForBus,
        stageName: stageNames.PROGRESSING,
        contactId: getContactObj.Id,
        type,
        buildingId: propertyObj.buildingId,
        streetUnitId: propertyObj.streetUnitId,
        propertyType: 'business',
        propertyId: propertyObj.propertyId,
        isWholesale,
      });
      sinon.assert.calledOnceWithExactly(stubGetPricebookEntry, priceBookNames[categories.WHOLESALE], product.id);
      sinon.assert.calledOnceWithExactly(stubCreateLineItem, pBbook2Obj[0], oppCreatedObj.id);
      sinon.assert.calledOnceWithExactly(stubUpdateOpportunity, oppCreatedObj.id, {
        StageName: stageNames.CLOSED_WON,
      });

      sinon.assert.calledOnce(stubWsOrderCreatedNotification);
      assert.equal(stubWsOrderCreatedNotification.firstCall.args[0], partnerId);
      Schema.assert(stubWsOrderCreatedNotification.firstCall.args[1], Schema.string().guid());
      assert.equal(stubWsOrderCreatedNotification.firstCall.args[2], productTypes.BUSINESS);

      Schema.assert(order.id, Schema.string().guid());
      assert.strictEqual(order.serviceId, null);
    });

    it(`should throw NotFoundError Product is not found with name ${product.name}`, async () => {
      const stubGetProperty = sandbox.stub(services.propertyService, 'getProperty').resolves(propertyObj);
      const stubGetProduct = sandbox.stub(services.productService, 'getById').resolves({
        data: product,
      });
      const stubGetContact = sandbox.stub(services.contact, 'getByExternalId').resolves(getContactObj);
      const stubCreateOpportunity = sandbox.stub(services.opportunity, 'create').resolves(oppCreatedObj);
      const stubGetPricebookEntry = sandbox.stub(models.PricebookEntry, 'getPricebookEntry').resolves([]);
      const stubCreateLineItem = sandbox.stub(services.opportunityLineItem, 'create').resolves(lineItemObj);
      const stubUpdateOpportunity = sandbox.stub(services.opportunity, 'updateById').resolves(updateOpportunityObj);
      const stubGetAccountById = sandbox.stub(models.Account, 'getById').resolves(getAccountResult);

      await testService(
        'createOrder',
        orderParams,
        'NotFoundError',
        `Product is not found with ID: ${product.id} and Price book name: ${priceBookNames[categories.WHOLESALE]}`,
      );

      sinon.assert.calledOnceWithExactly(stubGetAccountById, orderParams.partnerId);

      sinon.assert.calledOnceWithExactly(stubGetProperty, orderParams.installationSite.uprn);
      sinon.assert.calledOnceWithExactly(stubGetProduct, categories.WHOLESALE, productId);

      sinon.assert.calledOnceWithExactly(stubGetContact, contactId);

      sinon.assert.calledOnceWithExactly(stubCreateOpportunity, {
        opportunityName: opportunityNameResidential,
        partnerId,
        priceBookName: priceBookNames[categories.WHOLESALE],
        recordType: recordTypes.WHOLESALE_OPPORTUNITY,
        residentialOrBusiness: resOrBussForRes,
        stageName: stageNames.PROGRESSING,
        contactId: getContactObj.Id,
        type,
        buildingId: propertyObj.buildingId,
        streetUnitId: propertyObj.streetUnitId,
        propertyType: propertyObj.propertyType,
        propertyId: propertyObj.propertyId,
        isWholesale,
      });
      sinon.assert.calledOnceWithExactly(stubGetPricebookEntry, priceBookNames[categories.WHOLESALE], product.id);
      sinon.assert.notCalled(stubCreateLineItem);
      sinon.assert.notCalled(stubUpdateOpportunity);
    });

    it(`should throw ValidationError 'Unable to get PricebookEntry'`, async () => {
      const stubGetProperty = sandbox.stub(services.propertyService, 'getProperty').resolves(propertyObj);
      const stubGetProduct = sandbox.stub(services.productService, 'getById').resolves({ data: productObj });
      const stubGetContact = sandbox.stub(services.contact, 'getByExternalId').resolves(getContactObj);
      const stubCreateOpportunity = sandbox.stub(services.opportunity, 'create').resolves(oppCreatedObj);
      const stubGetPricebookEntry = sandbox
        .stub(models.PricebookEntry, 'getPricebookEntry')
        .resolves({ ...pbEntryObj, errors: [errorMessages.unableToGetPriceBookEntry] });
      const stubCreateLineItem = sandbox.stub(services.opportunityLineItem, 'create').resolves(lineItemObj);
      const stubUpdateOpportunity = sandbox.stub(services.opportunity, 'updateById').resolves(updateOpportunityObj);
      const stubGetAccountById = sandbox.stub(models.Account, 'getById').resolves(getAccountResult);

      await testService('createOrder', orderParams, 'ValidationError', errorMessages.unableToGetPriceBookEntry);

      sinon.assert.calledOnceWithExactly(stubGetAccountById, orderParams.partnerId);
      sinon.assert.calledOnceWithExactly(stubGetProperty, orderParams.installationSite.uprn);
      sinon.assert.calledOnceWithExactly(stubGetProduct, categories.WHOLESALE, productId);

      sinon.assert.calledOnceWithExactly(stubGetContact, contactId);

      sinon.assert.calledOnceWithExactly(stubCreateOpportunity, {
        opportunityName: opportunityNameResidential,
        partnerId,
        priceBookName: priceBookNames[categories.WHOLESALE],
        recordType: recordTypes.WHOLESALE_OPPORTUNITY,
        residentialOrBusiness: resOrBussForRes,
        stageName: stageNames.PROGRESSING,
        contactId: getContactObj.Id,
        type,
        buildingId: propertyObj.buildingId,
        streetUnitId: propertyObj.streetUnitId,
        propertyType: propertyObj.propertyType,
        propertyId: propertyObj.propertyId,
        isWholesale,
      });
      sinon.assert.calledOnceWithExactly(stubGetPricebookEntry, priceBookNames[categories.WHOLESALE], productObj.id);
      sinon.assert.notCalled(stubCreateLineItem);
      sinon.assert.notCalled(stubUpdateOpportunity);
    });

    it(`Should throw ValidationError 'Product does not exist'`, async () => {
      const stubGetProduct = sandbox.stub(services.productService, 'getById').rejects({
        name: 'ValidationError',
        message: errorMessages.productIsNotFound,
      });
      const stubGetAccountById = sandbox.stub(models.Account, 'getById').resolves(getAccountResult);
      const stubGetContact = sandbox.stub(services.contact, 'getByExternalId').resolves(getContactObj);

      await testService('createOrder', orderParams, 'ValidationError', errorMessages.productIsNotFound);

      sinon.assert.calledOnceWithExactly(stubGetAccountById, orderParams.partnerId);
      sinon.assert.calledOnceWithExactly(stubGetProduct, categories.WHOLESALE, productId);
      sinon.assert.calledOnceWithExactly(stubGetContact, contactId);
    });

    it(`Should throw ValidationError 'Property with such UPRN not found.'`, async () => {
      const stubGetProperty = sandbox.stub(services.propertyService, 'getProperty').rejects({
        name: 'ValidationError',
        message: errorMessages.propertyNotFound,
      });
      const stubGetAccountById = sandbox.stub(models.Account, 'getById').resolves(getAccountResult);
      const stubGetContact = sandbox.stub(services.contact, 'getByExternalId').resolves(getContactObj);

      await testService('createOrder', orderParams, 'ValidationError', errorMessages.propertyNotFound);

      sinon.assert.calledOnceWithExactly(stubGetAccountById, orderParams.partnerId);
      sinon.assert.calledOnceWithExactly(stubGetProperty, orderParams.installationSite.uprn);
      sinon.assert.calledOnceWithExactly(stubGetContact, contactId);
    });

    it(`Should throw ValidationError ${errorMessages.productIsNotForBusiness}`, async () => {
      const stubGetProduct = sandbox.stub(services.productService, 'getById').resolves({
        data: {
          ...product,
          configuration: { ...product.configuration, productType: productTypes.RESIDENTIAL },
        },
      });
      const stubGetProperty = sandbox
        .stub(services.propertyService, 'getProperty')
        .resolves({ ...propertyObj, propertyType: 'business' });
      const stubGetAccountById = sandbox.stub(models.Account, 'getById').resolves(getAccountResult);
      const stubGetContact = sandbox
        .stub(services.contact, 'getByExternalId')
        .resolves({ ...getContactObj, Company_Name__c: 'testCompany' });

      await testService('createOrder', orderParams, 'ValidationError', errorMessages.productIsNotForBusiness);

      sinon.assert.calledOnceWithExactly(stubGetContact, contactId);
      sinon.assert.calledOnceWithExactly(stubGetAccountById, orderParams.partnerId);
      sinon.assert.calledOnceWithExactly(stubGetProperty, orderParams.installationSite.uprn);
      sinon.assert.calledOnceWithExactly(stubGetProduct, categories.WHOLESALE, productId);
    });

    it(`Should throw ValidationError ${errorMessages.productIsNotForResidential}`, async () => {
      const stubGetProduct = sandbox.stub(services.productService, 'getById').resolves({
        data: { ...product, type: productTypes.BUSINESS },
      });
      const stubGetProperty = sandbox
        .stub(services.propertyService, 'getProperty')
        .resolves({ ...propertyObj, propertyType: productTypes.RESIDENTIAL });
      const stubGetAccountById = sandbox.stub(models.Account, 'getById').resolves(getAccountResult);
      const stubGetContact = sandbox.stub(services.contact, 'getByExternalId').resolves(getContactObj);

      await testService(
        'createOrder',
        { ...orderParams, contact: { ...orderParams.contact, companyName: '' } },
        'ValidationError',
        errorMessages.productIsNotForResidential,
      );

      sinon.assert.calledOnceWithExactly(stubGetContact, contactId);
      sinon.assert.calledOnceWithExactly(stubGetAccountById, orderParams.partnerId);
      sinon.assert.calledOnceWithExactly(stubGetProperty, orderParams.installationSite.uprn);
      sinon.assert.calledOnceWithExactly(stubGetProduct, categories.WHOLESALE, productId);
    });

    it('should create Retail order', async () => {
      const stubGetProperty = sandbox.stub(services.propertyService, 'getProperty').resolves(propertyObj);
      const stubGetProduct = sandbox.stub(services.productService, 'getById').resolves({ data: productObj });
      const stubGetContact = sandbox
        .stub(services.contact, 'getByExternalId')
        .resolves({ ...getContactObj, RecordType: { Name: recordTypes.STANDARD_CONTACT } });
      const stubCreateOpportunity = sandbox.stub(services.opportunity, 'create').resolves(oppCreatedObj);
      const stubGetPricebookEntry = sandbox.stub(models.PricebookEntry, 'getPricebookEntry').resolves(pBbook2Obj);
      const stubCreateLineItem = sandbox.stub(services.opportunityLineItem, 'create').resolves(lineItemObj);
      const stubGetAccountById = sandbox
        .stub(models.Account, 'getById')
        .resolves({ ...getAccountResult, RecordType: { Name: recordTypes.STANDARD_ACCOUNT } });

      const order = await service.createOrder({ ...orderParams });

      sinon.assert.calledOnceWithExactly(stubGetProperty, orderParams.installationSite.uprn);
      sinon.assert.calledOnceWithExactly(stubGetProduct, categories.RETAIL, productId);

      sinon.assert.calledOnceWithExactly(stubGetContact, contactId);

      sinon.assert.calledOnceWithExactly(stubCreateOpportunity, {
        opportunityName: opportunityNameResidential,
        partnerId,
        priceBookName: priceBookNames[categories.RETAIL],
        recordType: recordTypes.STANDARD_OPPORTUNITY,
        residentialOrBusiness: resOrBussForRes,
        stageName: stageNames.PROGRESSING,
        contactId: getContactObj.Id,
        type,
        buildingId: propertyObj.buildingId,
        streetUnitId: propertyObj.streetUnitId,
        propertyType: propertyObj.propertyType,
        propertyId: propertyObj.propertyId,
        isWholesale: false,
      });
      sinon.assert.calledOnceWithExactly(stubGetPricebookEntry, priceBookNames[categories.RETAIL], productObj.id);
      sinon.assert.calledOnceWithExactly(stubCreateLineItem, pBbook2Obj[0], oppCreatedObj.id);
      sinon.assert.calledOnceWithExactly(stubGetAccountById, orderParams.partnerId);

      Schema.assert(order.id, Schema.string().guid());
      assert.strictEqual(order.serviceId, null);
    });
  });

  describe('Update Order', () => {
    it('should return updated order', async () => {
      const stubPropertyService = await sandbox.stub(services.propertyService, 'getProperty').resolves(propertyObj);
      const stubProductRegistryService = await sandbox.stub(services.productService, 'getById').resolves({
        data: {
          ...product,
          configuration: { ...product.configuration, productType: productTypes.RESIDENTIAL },
        },
      });

      const stubGetContact = sandbox
        .stub(services.contact, 'getByExternalId')
        .resolves({ ...getContactObj, RecordType: { Name: recordTypes.STANDARD_CONTACT } });
      const stubGetOrder = await sandbox.stub(models.OrderSalesforce, 'getOrderById').resolves(getOrderData[0]);
      const stubGetOpportunity = sandbox.stub(services.opportunity, 'getByExternalId').resolves(opportunityObj);
      const stubPBEntry = sandbox.stub(models.PricebookEntry, 'getPricebookEntry').resolves(pbEntryObj);
      const stubCreateLineItem = sandbox.stub(services.opportunityLineItem, 'create').resolves(createLineItemObj);
      const stubDeleteLineItem = sandbox.stub(services.opportunityLineItem, 'delete').resolves(deleteLineItemObj);
      const stubGetOrderItem = sandbox.stub(models.OrderItem, 'getByOrderId').resolves(orderItems);
      const stubCreateOrderItem = sandbox.stub(services.orderItem, 'create').resolves(createOrderItemObj);
      const stubDeleteOrderItem = sandbox.stub(services.orderItem, 'delete').resolves(deleteOrderItemObj);
      const stubgetAllByOpportunityId = sandbox
        .stub(models.OpportunityLineItem, 'getAllByOpportunityId')
        .resolves(lineItemObj);

      const order = await service.updateOrder({
        ...orderParams,
        contactId,
        products: [{ productId }],
      });

      sinon.assert.calledOnceWithExactly(
        stubGetContact,
        getOrderData[0].Related_Opportunity__r.End_User_Contact__r.External_ID__c,
      );
      sinon.assert.calledOnceWithExactly(stubPropertyService, orderParams.installationSite.uprn);
      sinon.assert.calledOnceWithExactly(
        stubProductRegistryService,
        categories.WHOLESALE,
        orderParams.products[0].productId,
      );
      sinon.assert.calledOnceWithExactly(stubGetOrder, {
        id,
        partnerId,
      });
      sinon.assert.calledOnceWithExactly(stubGetOpportunity, id);
      sinon.assert.calledOnceWithExactly(stubPBEntry, priceBookNames[categories.WHOLESALE], product.id);
      sinon.assert.calledOnceWithExactly(stubgetAllByOpportunityId, getOrderData[0].Related_Opportunity__c);
      sinon.assert.calledOnceWithExactly(stubCreateLineItem, pbEntryObj[0], getOrderData[0].Related_Opportunity__c);
      sinon.assert.calledOnceWithExactly(stubGetOrderItem, getOrderData[0].Id);
      sinon.assert.calledOnceWithExactly(stubCreateOrderItem, pbEntryObj[0], getOrderData[0].Id);
      sinon.assert.calledOnceWithExactly(stubDeleteLineItem, lineItemObj[0].Id);
      sinon.assert.calledOnceWithExactly(stubDeleteOrderItem, orderItems[0].Id);

      assert.deepStrictEqual(order, getOrderData[0].External_ID__c);
    });

    it('should update product of an order', async () => {
      const stubProductRegistryService = await sandbox.stub(services.productService, 'getById').resolves({
        data: {
          ...product,
          configuration: { ...product.configuration, productType: productTypes.RESIDENTIAL },
        },
      });
      const stubGetOrder = await sandbox.stub(models.OrderSalesforce, 'getOrderById').resolves(getOrderData[0]);
      const stubGetOpportunity = sandbox.stub(services.opportunity, 'getByExternalId').resolves(opportunityObj);
      const stubPBEntry = sandbox.stub(models.PricebookEntry, 'getPricebookEntry').resolves(pbEntryObj);
      const stubGetLineItem = sandbox.stub(models.OpportunityLineItem, 'getAllByOpportunityId').resolves(lineItemObj);
      const stubCreateLineItem = sandbox.stub(services.opportunityLineItem, 'create').resolves(createLineItemObj);
      const stubDeleteLineItem = sandbox.stub(services.opportunityLineItem, 'delete').resolves(deleteLineItemObj);
      const stubGetOrderItem = sandbox.stub(models.OrderItem, 'getByOrderId').resolves(orderItems);
      const stubCreateOrderItem = sandbox.stub(services.orderItem, 'create').resolves(createOrderItemObj);
      const stubDeleteOrderItem = sandbox.stub(services.orderItem, 'delete').resolves(deleteOrderItemObj);
      const stubGetContact = sandbox.stub(services.contact, 'getByExternalId').resolves(getContactObj);

      const testProductId = '5e6b7582d2c9190008bc625d';
      const body = {
        products: [
          {
            productId: testProductId,
          },
        ],
        contact: {
          firstName: 'asdf',
          email: 'asdf@gmail.com',
          lastName: 'asdf',
          telephone: '(0722) 5555555',
        },
        id: getOrderData[0].External_ID__c,
        partnerId,
      };
      const order = await service.updateOrder(body);

      sinon.assert.calledOnceWithExactly(
        stubGetContact,
        getOrderData[0].Related_Opportunity__r.End_User_Contact__r.External_ID__c,
      );
      sinon.assert.calledOnceWithExactly(stubGetOpportunity, id);
      sinon.assert.calledOnceWithExactly(stubGetLineItem, getOrderData[0].Related_Opportunity__c);
      sinon.assert.calledOnceWithExactly(stubCreateLineItem, pbEntryObj[0], getOrderData[0].Related_Opportunity__c);
      sinon.assert.calledOnceWithExactly(stubGetOrderItem, getOrderData[0].Id);
      sinon.assert.calledOnceWithExactly(stubCreateOrderItem, pbEntryObj[0], getOrderData[0].Id);
      sinon.assert.calledOnceWithExactly(stubDeleteLineItem, lineItemObj[0].Id);
      sinon.assert.calledOnceWithExactly(stubDeleteOrderItem, orderItems[0].Id);

      sinon.assert.calledOnceWithExactly(stubProductRegistryService, categories.WHOLESALE, testProductId);
      sinon.assert.calledOnceWithExactly(stubGetOrderItem, getOrderData[0].Id);
      sinon.assert.calledOnceWithExactly(stubGetOrder, {
        id: getOrderData[0].External_ID__c,
        partnerId,
      });

      sinon.assert.calledOnceWithExactly(stubPBEntry, priceBookNames[categories.WHOLESALE], product.id);

      assert.deepStrictEqual(order, getOrderData[0].External_ID__c);
    });

    it('should update installation site', async () => {
      const stubGetOrder = await sandbox.stub(models.OrderSalesforce, 'getOrderById').resolves(getOrderData[0]);
      const stubGetOpportunity = sandbox.stub(services.opportunity, 'getByExternalId').resolves(opportunityObj);
      const stubPropertyService = await sandbox.stub(services.propertyService, 'getProperty').resolves(propertyObj);
      const stubGetContact = sandbox.stub(services.contact, 'getByExternalId').resolves(getContactObj);

      const testId = '4ea3fe9e-97f8-493a-9b35-88b523b8937d';
      const testPartnerId = '0010C000009d64CQAQ';

      const body = {
        id: testId,
        partnerId: testPartnerId,
        installationSite: {
          uprn: '10,090,549,279',
        },
      };
      const order = await service.updateOrder(body);

      sinon.assert.calledOnceWithExactly(
        stubGetContact,
        getOrderData[0].Related_Opportunity__r.End_User_Contact__r.External_ID__c,
      );
      sinon.assert.calledOnceWithExactly(stubPropertyService, body.installationSite.uprn);

      sinon.assert.calledOnceWithExactly(stubGetOpportunity, id);

      sinon.assert.calledOnceWithExactly(stubGetOrder, {
        id: testId,
        partnerId: testPartnerId,
      });
      assert.deepStrictEqual(order, getOrderData[0].External_ID__c);
    });

    it('should update contact', async () => {
      const stubGetOrder = await sandbox.stub(models.OrderSalesforce, 'getOrderById').resolves(getOrderData[0]);
      const stubGetOpportunity = sandbox.stub(services.opportunity, 'getByExternalId').resolves(opportunityObj);
      const stubGetContact = sandbox.stub(services.contact, 'getByExternalId').resolves(getContactObj);

      const testId = '4ea3fe9e-97f8-493a-9b35-88b523b8937d';
      const testPartnerId = '0010C000009d64CQAQ';

      const body = {
        id: testId,
        partnerId: testPartnerId,
        contact: {
          firstName: 'asdf',
          lastName: 'asdf',
          email: 'asdf@gmail.com',
          telephone: '(0722) 5555555',
        },
      };
      const order = await service.updateOrder(body);

      sinon.assert.calledOnceWithExactly(
        stubGetContact,
        getOrderData[0].Related_Opportunity__r.End_User_Contact__r.External_ID__c,
      );
      sinon.assert.calledOnceWithExactly(stubGetOrder, {
        id: testId,
        partnerId: testPartnerId,
      });
      sinon.assert.calledOnceWithExactly(stubGetOpportunity, id);

      assert.deepStrictEqual(order, getOrderData[0].External_ID__c);
    });

    it('should fail to Update the Product', async () => {
      const stubProductRegistryService = await sandbox.stub(services.productService, 'getById').resolves({
        data: {
          ...product,
          configuration: { ...product.configuration, productType: productTypes.RESIDENTIAL },
        },
      });
      const stubGetOrder = await sandbox.stub(models.OrderSalesforce, 'getOrderById').resolves(getOrderData[0]);
      const stubPBEntry = sandbox
        .stub(models.PricebookEntry, 'getPricebookEntry')
        .resolves({ ...pbEntryObj, errors: [errorMessages.unableToGetPriceBookEntry] });
      const stubGetLineItem = sandbox.stub(models.OpportunityLineItem, 'getAllByOpportunityId').resolves([lineItemObj]);
      const stubCreateLineItem = sandbox.stub(services.opportunityLineItem, 'create').resolves(createLineItemObj);
      const stubGetOrderItem = sandbox.stub(models.OrderItem, 'getByOrderId').resolves(orderItems);
      const stubCreateOrderItem = sandbox.stub(services.orderItem, 'create').resolves(createOrderItemObj);
      const stubDeleteOrderItem = sandbox.stub(services.orderItem, 'delete').resolves(deleteOrderItemObj);
      const stubGetOpportunity = sandbox.stub(services.opportunity, 'getByExternalId').resolves(opportunityObj);
      const stubGetContact = sandbox.stub(services.contact, 'getByExternalId').resolves(getContactObj);

      await testService(
        'updateOrder',
        {
          partnerId: orderParams.partnerId,
          id: orderParams.id,
          contactId,
          products: [{ productId }],
        },
        'ValidationError',
        errorMessages.unableToGetPriceBookEntry,
      );

      sinon.assert.calledOnceWithExactly(
        stubGetContact,
        getOrderData[0].Related_Opportunity__r.End_User_Contact__r.External_ID__c,
      );
      sinon.assert.calledOnceWithExactly(
        stubProductRegistryService,
        categories.WHOLESALE,
        orderParams.products[0].productId,
      );
      sinon.assert.calledOnceWithExactly(stubGetOrder, {
        id,
        partnerId,
      });
      sinon.assert.calledOnceWithExactly(stubPBEntry, priceBookNames[categories.WHOLESALE], product.id);
      sinon.assert.calledOnceWithExactly(stubGetOpportunity, id);
      sinon.assert.calledOnceWithExactly(stubGetLineItem, getOrderData[0].Related_Opportunity__c);
      sinon.assert.calledOnceWithExactly(stubGetOrderItem, getOrderData[0].Id);
      sinon.assert.calledOnceWithExactly(stubDeleteOrderItem, orderItems[0].Id);

      sinon.assert.notCalled(stubCreateLineItem);
      sinon.assert.notCalled(stubCreateOrderItem);
    });

    it('should throw Validation Error `Order is not Draft`', async () => {
      const stubGetOrder = await sandbox
        .stub(models.OrderSalesforce, 'getOrderById')
        .resolves({ ...getOrderData[0], Status: 'Live', error: [errorMessages.orderNotDraft] });
      const stubPBEntry = sandbox.stub(models.PricebookEntry, 'getPricebookEntry').resolves(pbEntryObj);
      const stubGetLineItem = sandbox.stub(services.opportunityLineItem, 'getByOpportunityId').resolves(lineItemObj);
      const stubCreateLineItem = sandbox.stub(services.opportunityLineItem, 'create').resolves(createLineItemObj);
      const stubDeleteLineItem = sandbox.stub(services.opportunityLineItem, 'delete').resolves(deleteLineItemObj);
      const stubGetOrderItem = sandbox.stub(services.orderItem, 'getByOrderId').resolves(orderItems);
      const stubCreateOrderItem = sandbox.stub(services.orderItem, 'create').resolves(createOrderItemObj);
      const stubDeleteOrderItem = sandbox.stub(services.orderItem, 'delete').resolves(deleteOrderItemObj);
      const stubGetOpportunityByExternalId = sandbox
        .stub(services.opportunity, 'getByExternalId')
        .resolves(opportunityObj);

      await testService(
        'updateOrder',
        {
          id: orderParams.id,
          partnerId: orderParams.partnerId,
          products: [{ productId }],
        },
        'ValidationError',
        errorMessages.orderNotDraft,
      );

      sinon.assert.calledOnceWithExactly(stubGetOrder, {
        id,
        partnerId,
      });

      sinon.assert.notCalled(stubGetOpportunityByExternalId);
      sinon.assert.notCalled(stubPBEntry);
      sinon.assert.notCalled(stubGetLineItem);
      sinon.assert.notCalled(stubCreateLineItem);
      sinon.assert.notCalled(stubGetOrderItem);
      sinon.assert.notCalled(stubCreateOrderItem);
      sinon.assert.notCalled(stubDeleteLineItem);
      sinon.assert.notCalled(stubDeleteOrderItem);
    });

    it('should throw Validation Error `Survey Date Book`', async () => {
      const stubGetOrder = await sandbox.stub(models.OrderSalesforce, 'getOrderById').resolves({
        ...getOrderData[0],
        Date_Survey_Booked_for__c: '2019-11-24',
        error: [errorMessages.dateSurveyBooked],
      });
      const stubPBEntry = sandbox.stub(models.PricebookEntry, 'getPricebookEntry').resolves(pbEntryObj);
      const stubGetLineItem = sandbox.stub(services.opportunityLineItem, 'getByOpportunityId').resolves(lineItemObj);
      const stubCreateLineItem = sandbox.stub(services.opportunityLineItem, 'create').resolves(createLineItemObj);
      const stubDeleteLineItem = sandbox.stub(services.opportunityLineItem, 'delete').resolves(deleteLineItemObj);
      const stubGetOrderItem = sandbox.stub(services.orderItem, 'getByOrderId').resolves(orderItems);
      const stubCreateOrderItem = sandbox.stub(services.orderItem, 'create').resolves(createOrderItemObj);
      const stubDeleteOrderItem = sandbox.stub(services.orderItem, 'delete').resolves(deleteOrderItemObj);
      const stubGetOpportunityByExternalId = sandbox
        .stub(services.opportunity, 'getByExternalId')
        .resolves(opportunityObj);

      await testService(
        'updateOrder',
        {
          id: orderParams.id,
          partnerId: orderParams.partnerId,
          products: [{ productId }],
        },
        'ValidationError',
        errorMessages.dateSurveyBooked,
      );

      sinon.assert.calledOnceWithExactly(stubGetOrder, {
        id,
        partnerId,
      });

      sinon.assert.notCalled(stubGetOpportunityByExternalId);
      sinon.assert.notCalled(stubPBEntry);
      sinon.assert.notCalled(stubGetLineItem);
      sinon.assert.notCalled(stubCreateLineItem);
      sinon.assert.notCalled(stubGetOrderItem);
      sinon.assert.notCalled(stubCreateOrderItem);
      sinon.assert.notCalled(stubDeleteLineItem);
      sinon.assert.notCalled(stubDeleteOrderItem);
    });

    it('should update action date', async () => {
      const getOldOpportunityData = {
        attributes: {
          type: 'Opportunity',
          url: '/services/data/v42.0/sobjects/Opportunity/0060C000003aKA8QAM',
        },
        Id: '0060C000003aKA8QAM',
      };

      const stubGetOrder = await sandbox.stub(models.OrderSalesforce, 'getOrderById').resolves(getOrderData[0]);
      const stubGetOpportunity = await sandbox.stub(services.opportunity, 'getByExternalId').resolves(opportunityObj);
      const stubGetOldOpportunity = await sandbox
        .stub(services.opportunity, 'getByOrderStatus')
        .resolves(getOldOpportunityData);
      const stubUpdateOpportunityById = await sandbox.stub(services.opportunity, 'updateById').resolves();
      const stubGetContact = sandbox.stub(services.contact, 'getByExternalId').resolves(getContactObj);

      const actionDate = '2020-07-08';

      const result = await service.updateOrder({
        id: orderParams.id,
        partnerId: orderParams.partnerId,
        actionDate,
      });

      sinon.assert.calledOnceWithExactly(
        stubGetContact,
        getOrderData[0].Related_Opportunity__r.End_User_Contact__r.External_ID__c,
      );
      sinon.assert.calledOnceWithExactly(stubGetOpportunity, id);
      sinon.assert.calledOnceWithExactly(stubGetOrder, {
        id: orderParams.id,
        partnerId: orderParams.partnerId,
      });
      sinon.assert.calledOnceWithExactly(
        stubGetOldOpportunity,
        orderStatus.LIVE,
        orderParams.partnerId,
        opportunityObj.Service_ID__c,
      );

      assert.deepStrictEqual(stubUpdateOpportunityById.firstCall.args[0], opportunityObj.Id);
      assert.deepStrictEqual(stubUpdateOpportunityById.firstCall.args[1], {
        Action_Date__c: actionDate,
      });

      assert.deepStrictEqual(stubUpdateOpportunityById.secondCall.args[0], getOldOpportunityData.Id);
      assert.deepStrictEqual(stubUpdateOpportunityById.secondCall.args[1], {
        Action_Date__c: actionDate,
      });

      assert.strictEqual(result, orderParams.id);
    });

    it(`should throw ValidationError ${errorMessages.orderIsNotUpgradeDowngrade}`, async () => {
      const stubGetOrder = await sandbox
        .stub(models.OrderSalesforce, 'getOrderById')
        .resolves({ ...getOrderData[0], Order_category__c: 'some' });
      const stubGetOpportunity = sandbox.stub(services.opportunity, 'getByExternalId').resolves(opportunityObj);
      const stubGetContact = sandbox.stub(services.contact, 'getByExternalId').resolves(getContactObj);

      await testService(
        'updateOrder',
        {
          id: orderParams.id,
          partnerId: orderParams.partnerId,
          actionDate: '2020-07-08',
        },
        'ValidationError',
        errorMessages.orderIsNotUpgradeDowngrade,
      );

      sinon.assert.calledOnceWithExactly(
        stubGetContact,
        getOrderData[0].Related_Opportunity__r.End_User_Contact__r.External_ID__c,
      );
      sinon.assert.calledOnceWithExactly(stubGetOpportunity, id);
      sinon.assert.calledOnceWithExactly(stubGetOrder, {
        id: orderParams.id,
        partnerId: orderParams.partnerId,
      });
    });

    it('should update status', async () => {
      const stubGetOrder = await sandbox.stub(models.OrderSalesforce, 'getOrderById').resolves(getOrderData[0]);
      const stubGetOpportunity = await sandbox.stub(services.opportunity, 'getByExternalId').resolves(opportunityObj);
      const stubUpdateOpportunityById = await sandbox.stub(services.opportunity, 'updateById').resolves();
      const stubUpdateOrder = sandbox.stub(models.OrderSalesforce, 'updateOrder').resolves();
      const stubPublishCancelOrderNotification = sandbox.stub(service, 'publishCancelOrderNotification');
      const stubGetContact = sandbox.stub(services.contact, 'getByExternalId').resolves(getContactObj);

      const result = await service.updateOrder({
        id: orderParams.id,
        partnerId: orderParams.partnerId,
        status: orderStatus.CANCELLED,
      });

      sinon.assert.calledOnceWithExactly(
        stubGetContact,
        getOrderData[0].Related_Opportunity__r.End_User_Contact__r.External_ID__c,
      );
      sinon.assert.calledOnceWithExactly(stubGetOpportunity, id);
      sinon.assert.calledOnceWithExactly(stubGetOrder, {
        id: orderParams.id,
        partnerId: orderParams.partnerId,
      });
      sinon.assert.calledOnceWithExactly(stubUpdateOpportunityById, opportunityObj.Id, {
        StageName: stageNames.CLOSED_LOST,
        Loss_Reason__c: opportunityLossReasons.SERVICE_CANCELLED,
      });
      sinon.assert.calledOnceWithExactly(stubUpdateOrder, {
        Id: getOrderData[0].Id,
        Status: orderStatus.CANCELLED,
        Reason_for_cancellation__c: orderCancellationReasons.CUSTOMER_CHANGED_MIND,
      });

      sinon.assert.calledOnceWithExactly(
        stubPublishCancelOrderNotification,
        partnerId,
        orderParams.id,
        getOrderData[0].RecordType.Name,
        getOrderData[0].S_Tag__c,
        getOrderData[0].C_Tag__c,
      );

      assert.strictEqual(result, orderParams.id);
    });

    it('should update service delivery', async () => {
      const order = getOrderData[0];
      const serviceDelivery = { survey: {} };
      const getOrderByIdStub = sandbox.stub(models.OrderSalesforce, 'getOrderById').resolves(order);
      const stubGetContact = sandbox.stub(services.contact, 'getByExternalId').resolves(getContactObj);
      const getOpportunityByIdStub = await sandbox
        .stub(services.opportunity, 'getByExternalId')
        .resolves(opportunityObj);
      const updateServiceDeliveryStub = sandbox.stub(service, 'updateServiceDelivery');
      const validateUpdatePayloadStub = sandbox.stub(OrderService, 'validateUpdatePayload');

      await service.updateOrder({ id, partnerId, serviceDelivery });

      sinon.assert.calledOnceWithExactly(
        stubGetContact,
        getOrderData[0].Related_Opportunity__r.End_User_Contact__r.External_ID__c,
      );
      assert(getOrderByIdStub.calledWithExactly({ id, partnerId }));
      assert(validateUpdatePayloadStub.calledWithExactly(order));
      assert(getOpportunityByIdStub.calledWithExactly(id));
      assert(updateServiceDeliveryStub.calledWithExactly(order, serviceDelivery));
    });

    it(`should update opportunity stage to ${stageNames.CLOSED_WON} for pending retail orders on request with status ${orderStatus.DRAFT}`, async () => {
      const order = getOrderData[0];
      const getOpportunityByIdStub = await sandbox
        .stub(services.opportunity, 'getByExternalId')
        .resolves(opportunityObj);
      const getOrderByIdStub = sandbox.stub(models.OrderSalesforce, 'getOrderById').resolves(order);
      const updateOpportunityByIdStub = sandbox.stub(services.opportunity, 'updateById');
      const stubGetContact = sandbox.stub(services.contact, 'getByExternalId').resolves(getContactObj);

      const result = await service.updateOrder({
        id: orderParams.id,
        status: orderStatus.DRAFT,
        partnerId: null,
      });

      assert(stubGetContact.calledWithExactly(order.Related_Opportunity__r.End_User_Contact__r.External_ID__c));
      assert(getOpportunityByIdStub.calledWithExactly(id));
      assert(updateOpportunityByIdStub.calledWithExactly(opportunityObj.Id, { StageName: stageNames.CLOSED_WON }));
      assert(getOrderByIdStub.calledWithExactly({ id, partnerId: null }));
      assert.equal(result, orderParams.id);
    });
  });

  describe('Get Order', () => {
    it('should get the order successfully', async () => {
      const stubGetOrderById = sandbox.stub(models.OrderSalesforce, 'getOrderById').resolves(getOrderData[0]);
      const stubGetStreetUnit = sandbox.stub(models.Street, 'getStreetUnit').resolves(streetData);
      sandbox.stub(models.OrderSalesforce, 'mapOrderResponse').returns(mappedOrders);

      const stubGetProperty = sandbox.stub(services.propertyService, 'getProperty').resolves(propertyObj);
      const stubGetAppointment = sandbox
        .stub(services.appointmentService, 'getCollection')
        .resolves({ data: [appointmentObj] });
      const stubGetOrderItems = sandbox.stub(models.OrderItem, 'getByOrderId').resolves(orderItems);
      const result = await service.getOrderById(id);

      assert.deepStrictEqual(result.OrderNumber, getOrderData.OrderNumber);

      sandbox.assert.calledOnceWithExactly(stubGetOrderById, { id, partnerId: undefined });
      sandbox.assert.calledOnceWithExactly(stubGetStreetUnit, getOrderData[0].Street_Unit_Wholesale__c);

      sandbox.assert.calledOnceWithExactly(stubGetProperty, getOrderData[0].Related_Opportunity__r.UPRN__c);
      sandbox.assert.calledOnceWithExactly(stubGetAppointment, {
        orderId: getOrderData[0].External_ID__c,
      });
      sandbox.assert.calledOnceWithExactly(stubGetOrderItems, getOrderData[0].Id);
    });

    it('should throw order not found', async () => {
      const stubGetOrderById = await sandbox.stub(models.OrderSalesforce, 'getOrderById').resolves(undefined);
      const stubGetOpportunityById = await sandbox.stub(services.opportunity, 'getByExternalId').resolves(undefined);

      await assert.rejects(service.getOrderById(id), {
        name: 'NotFoundError',
      });

      sinon.assert.calledOnce(stubGetOrderById);
      sinon.assert.calledWithExactly(stubGetOrderById, { id, partnerId: undefined });
      sinon.assert.calledOnce(stubGetOpportunityById);
      sinon.assert.calledWithExactly(stubGetOpportunityById, id, undefined);
    });

    it('should check if uprn exists in order', async () => {
      const stubGetOrderById = sandbox
        .stub(models.OrderSalesforce, 'getOrderById')
        .resolves({ ...getOrderData[0], Related_Opportunity__r: { UPRN__c: null } });
      const stubGetStreetUnit = sandbox.stub(models.Street, 'getStreetUnit').resolves(streetData);
      sandbox.stub(models.OrderSalesforce, 'mapOrderResponse').returns(mappedOrders);

      const stubGetProperty = sandbox.stub(services.propertyService, 'getProperty').resolves(null);
      const stubGetAppointment = sandbox
        .stub(services.appointmentService, 'getCollection')
        .resolves({ data: [appointmentObj] });
      const stubGetOrderItems = sandbox.stub(models.OrderItem, 'getByOrderId').resolves(orderItems);
      const result = await service.getOrderById(id);

      assert.deepStrictEqual(result.OrderNumber, getOrderData.OrderNumber);

      sandbox.assert.calledOnceWithExactly(stubGetOrderById, { id, partnerId: undefined });
      sandbox.assert.calledOnceWithExactly(stubGetStreetUnit, getOrderData[0].Street_Unit_Wholesale__c);
      sandbox.assert.calledOnceWithExactly(stubGetAppointment, {
        orderId: getOrderData[0].External_ID__c,
      });
      sandbox.assert.notCalled(stubGetProperty);
      sandbox.assert.calledOnceWithExactly(stubGetOrderItems, getOrderData[0].Id);
    });

    it('should check if survey and installation date exists in order', async () => {
      const stubGetOrderById = sandbox.stub(models.OrderSalesforce, 'getOrderById').resolves({
        ...getOrderData[0],
        Date_Time_survey_booked__c: null,
        Installation_Date__c: null,
      });
      const stubGetStreetUnit = sandbox.stub(models.Street, 'getStreetUnit').resolves(streetData);
      sandbox.stub(models.OrderSalesforce, 'mapOrderResponse').returns(mappedOrders);

      const stubGetProperty = sandbox.stub(services.propertyService, 'getProperty').resolves(propertyObj);
      const stubGetAppointment = sandbox.stub(services.appointmentService, 'getCollection').resolves({ data: [] });
      const stubGetOrderItems = sandbox.stub(models.OrderItem, 'getByOrderId').resolves(orderItems);
      const result = await service.getOrderById(id);

      assert.deepStrictEqual(result.OrderNumber, getOrderData.OrderNumber);

      sandbox.assert.calledOnceWithExactly(stubGetOrderById, { id, partnerId: undefined });
      sandbox.assert.calledOnceWithExactly(stubGetStreetUnit, getOrderData[0].Street_Unit_Wholesale__c);
      sandbox.assert.calledOnceWithExactly(stubGetProperty, getOrderData[0].Related_Opportunity__r.UPRN__c);
      sandbox.assert.notCalled(stubGetAppointment);
      sandbox.assert.calledOnceWithExactly(stubGetOrderItems, getOrderData[0].Id);
    });

    it('should get standard opportunity if order does not exist yet', async () => {
      const opportunity = {
        UPRN__c: '777',
        External_ID: '123',
        Id: '111',
        Account: { Contact__r: { External_ID__c: 'fb1d8f86-eb76-11ea-adc1-0242ac120002' } },
      };

      const stubGetOrderById = await sandbox.stub(models.OrderSalesforce, 'getOrderById').resolves(undefined);
      const stubGetOpportunityById = await sandbox.stub(services.opportunity, 'getByExternalId').resolves(opportunity);
      const stubGetAllOpportunityLineItemsByOppId = await sandbox
        .stub(services.opportunityLineItem, 'getAllByOpportunityId')
        .resolves([{ Product2: { External_ID__c: '123', Name: 'product1' } }]);
      const stubGetProperty = sandbox.stub(services.propertyService, 'getProperty').resolves(propertyObj);
      const stubGetStreetName = await sandbox.stub(models.OrderSalesforce, 'getStreetName').returns('123');

      const result = await service.getOrderById(id);

      assert.deepStrictEqual(result, {
        id: opportunity.External_ID__c,
        orderNumber: null,
        orderDate: null,
        status: orderStatus.DRAFT,
        type: undefined,
        serviceId: null,
        actionDate: null,
        partnerId: null,
        contactId: get(opportunity, 'Account.Contact__r.External_ID__c'),
        installationSite: {
          uprn: opportunity.UPRN__c,
          streetNumber: propertyObj.streetNumber,
          street: '123',
          postcode: propertyObj.postcode,
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
        products: [
          {
            productId: '123',
            productName: 'product1',
          },
        ],
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
        createdAt: undefined,
        updatedBy: get(opportunity, 'Account.Name'),
        updatedAt: undefined,
      });

      sandbox.assert.calledOnceWithExactly(stubGetOrderById, { id, partnerId: undefined });
      sandbox.assert.calledOnceWithExactly(stubGetOpportunityById, id, undefined);
      sandbox.assert.calledOnceWithExactly(stubGetAllOpportunityLineItemsByOppId, opportunity.Id);
      sandbox.assert.calledOnceWithExactly(stubGetProperty, opportunity.UPRN__c);
      sandbox.assert.calledOnceWithExactly(stubGetStreetName, propertyObj.streetUnitName);
    });
  });

  describe('Get order by service id', () => {
    it('should get the order by service id', async () => {
      partnerId = '0010C000009d64CZAQ';
      const serviceId = '0f9caf7e-5c38-41bf-a6cc-9045ca576730';
      const order = getOrderData[0];

      const stub = sandbox.stub(models.OrderSalesforce, 'getOrderByServiceId').resolves(order);

      const result = await service.getOrderByServiceId(partnerId, serviceId);

      assert.deepStrictEqual(result.Id, order.Id);

      sandbox.assert.calledOnce(stub);
      sandbox.assert.calledWithExactly(stub, { partnerId, serviceId });
    });

    it('should throw order not found', async () => {
      partnerId = '0010C000009d64CZAQ';
      const serviceId = '0f9caf7e-5c38-41bf-a6cc-9045ca576730';
      const stub = await sandbox.stub(models.OrderSalesforce, 'getOrderByServiceId').resolves(undefined);

      await assert.rejects(service.getOrderByServiceId(partnerId, serviceId), {
        name: 'NotFoundError',
      });

      sinon.assert.calledOnce(stub);
      sinon.assert.calledWithExactly(stub, { partnerId, serviceId });
    });
  });

  describe('Get Order Collection', () => {
    it('should get the collection of orders successfully', async () => {
      partnerId = '0010C000009d64CZAQ';
      const status = 'Draft';
      const pageNum = 1;
      const pageSize = 3;
      const stubGetOrderCollection = await sandbox.stub(models.OrderSalesforce, 'getOrderCollection').resolves({
        data: getOrderCollectionData,
        pages: {
          totalRows: 3,
          pageNum,
          pageSize,
        },
      });
      const stubGetStreetUnit = sandbox.stub(models.Street, 'getStreetUnit').resolves(streetData);
      const stubGetProperty = sandbox.stub(services.propertyService, 'getProperty').resolves(propertyObj);
      const stubGetAppointment = sandbox
        .stub(services.appointmentService, 'getCollection')
        .resolves({ data: [appointmentObj] });
      const stubGetOrderItems = sandbox.stub(models.OrderItem, 'getByOrderId').resolves(orderItems);
      const stubMapOrderResponse = sandbox.stub(models.OrderSalesforce, 'mapOrderResponse').returns(mappedOrders);

      const result = await service.getOrderCollection(partnerId, status, pageNum, pageSize);

      assert.deepStrictEqual(result, { data: mappedOrders, pages: { totalRows: 3, pageSize, pageNum } });

      sandbox.assert.calledOnce(stubGetOrderCollection);
      sandbox.assert.calledOnce(stubMapOrderResponse);
      sandbox.assert.calledWithExactly(stubGetOrderCollection, { partnerId, status, pageNum, pageSize });
      sandbox.assert.calledWithExactly(stubGetStreetUnit, getOrderData[0].Street_Unit_Wholesale__c);
      sandbox.assert.calledWithExactly(stubGetAppointment, {
        orderId: getOrderCollectionData[0].External_ID__c,
      });
      sandbox.assert.calledWithExactly(stubGetOrderItems, getOrderData[0].Id);

      getOrderData.forEach((order) => {
        sandbox.assert.calledWithExactly(stubGetProperty, order.Related_Opportunity__r.UPRN__c);
      });
    });
  });

  describe('Upgrade/Downgrade Order', () => {
    it('should Upgrade/Downgrade order successfully', async () => {
      const actionDate = new Date();
      actionDate.setDate(actionDate.getDate() + 1);
      const accountId = '0010C000008kXAXQA2';
      const upgradeDowngradeOrderParams = {
        ...orderParams,
        products: [product],
        partnerId: accountId,
        actionDate,
        serviceId: 'S-00000001',
        type: orderTypes.UPGRADE,
        priceBookName: priceBookNames[categories.WHOLESALE],
      };

      const getOldOpportunityData = {
        attributes: {
          type: 'Opportunity',
          url: '/services/data/v42.0/sobjects/Opportunity/0060C000003aKA8QAM',
        },
        Id: '0060C000003aKA8QAM',
      };
      const getNewOpportunityData = {
        attributes: {
          type: 'Opportunity',
          url: '/services/data/v42.0/sobjects/Opportunity/0060C000003aKA8QAM',
        },
        Id: '0040C013503fKA9dVZ',
      };

      const getOpportunityStub = await sandbox
        .stub(services.opportunity, 'getByOrderStatus')
        .onFirstCall()
        .resolves(getOldOpportunityData)
        .onSecondCall()
        .resolves(getNewOpportunityData);

      const stubGetPricebookEntry = sandbox.stub(models.PricebookEntry, 'getPricebookEntry').resolves(pBbook2Obj);

      const stubUpdateOpportunity = sandbox.stub(services.opportunity, 'updateById').resolves(updateOpportunityObj);

      const stubGetPendingUpgradeDowngradeOrder = sandbox
        .stub(models.OrderSalesforce, 'getPendingUpgradeDowngradeOrder')
        .resolves(null);

      const result = await service.upgradeDowngradeOrder(upgradeDowngradeOrderParams);

      assert.deepStrictEqual(getOpportunityStub.firstCall.args[0], orderStatus.LIVE);
      assert.deepStrictEqual(getOpportunityStub.firstCall.args[1], accountId);
      assert.deepStrictEqual(getOpportunityStub.firstCall.args[2], upgradeDowngradeOrderParams.serviceId);

      assert.deepStrictEqual(getOpportunityStub.secondCall.args[0], orderStatus.DRAFT);
      assert.deepStrictEqual(getOpportunityStub.secondCall.args[1], accountId);
      assert.deepStrictEqual(getOpportunityStub.secondCall.args[2], upgradeDowngradeOrderParams.serviceId);

      sinon.assert.calledOnceWithExactly(stubGetPricebookEntry, priceBookNames[categories.WHOLESALE], product.id);

      sinon.assert.calledOnceWithExactly(
        stubGetPendingUpgradeDowngradeOrder,
        upgradeDowngradeOrderParams.partnerId,
        upgradeDowngradeOrderParams.serviceId,
      );

      sandbox.assert.calledOnceWithExactly(stubUpdateOpportunity, getOldOpportunityData.Id, {
        Sent_From_API__c: true,
        Product__c: pBbook2Obj[0].Product2Id,
        Action_Date__c: upgradeDowngradeOrderParams.actionDate,
        Reason_of_New_Opportunity__c: upgradeDowngradeOrderParams.type,
      });

      Schema.assert(result.id, Schema.string().guid());
      assert.strictEqual(result.serviceId, upgradeDowngradeOrderParams.serviceId);
    });

    it(`should throw validationError ${errorMessages.invalidActionDate}`, async () => {
      const accountId = '0010C000008kXAXQA2';
      const upgradeDowngradeOrderParams = {
        ...orderParams,
        products: [product],
        partnerId: accountId,
        actionDate: '2020-02-24',
        serviceId: 'S-00000001',
        type: orderTypes.UPGRADE,
      };

      await testService(
        'upgradeDowngradeOrder',
        upgradeDowngradeOrderParams,
        'ValidationError',
        errorMessages.invalidActionDate,
      );
    });
  });

  describe('getProducts', () => {
    const orderItemsModelResult = [
      {
        Product2: { External_ID__c: '123', Name: 'prod1' },
      },
    ];

    it('should get products from SF', async () => {
      const orderId = 'orderId';
      const getOrderItemStub = sandbox.stub(models.OrderItem, 'getByOrderId').resolves(orderItemsModelResult);

      const result = await service.getProducts(orderId);

      assert(getOrderItemStub.calledWithExactly(orderId));
      assert.deepStrictEqual(
        result,
        orderItemsModelResult.map((item) => ({ id: item.Product2.External_ID__c, name: item.Product2.Name })),
      );
    });
  });

  describe('updateCircuit', () => {
    it('should update orders by service id with circuit data', async () => {
      const payload = {
        partnerId: '41e0cd72-2d4b-4022-9f9e-4c3233f5c4d5',
        serviceId: 'f1e6c825-ac4f-4342-a48d-c1b47de087af',
        ontId: 4,
        ontSerialNo: 'freg',
        servicePort: 3258,
        sTag: 3395,
        cTag: 288,
        F: 'reg',
        S: 'reejg',
        P: 'sdf',
      };

      const order = { Id: 'as', ServiceId__c: 'some_id' };

      const getByServiceIdStub = sandbox.stub(service, 'getOrderByServiceId').resolves(order);
      const getByIdStub = sandbox.stub(service, 'getOrderById').resolves();
      const salesforceStub = sandbox.stub(models.OrderSalesforce, 'updateOrderCircuitData').resolves();

      await service.updateCircuit(payload);

      sinon.assert.calledOnce(getByServiceIdStub);
      sinon.assert.calledWithExactly(getByServiceIdStub, payload.partnerId, payload.serviceId);

      sinon.assert.calledOnce(salesforceStub);

      const { partnerId: pId, serviceId, ...circuitData } = payload;
      assert.deepStrictEqual(salesforceStub.firstCall.firstArg, {
        id: order.Id,
        ...circuitData,
      });

      sinon.assert.notCalled(getByIdStub);
      sinon.assert.notCalled(logger.error);
    });
  });
});
