const SalesforceModel = require('@g-network/salesforce-models');
const get = require('lodash.get');
const {
  inProgressStatusMapping,
  orderStatus,
  orderTypes,
  appointmentWorkTypes,
  appointmentStatuses,
  RESOURCES_LIMIT,
} = require('../constants');

class OrderSalesforce extends SalesforceModel {
  static getStreetName(streetUnitName) {
    if (!streetUnitName) return null;

    const splitStreetUnitName = streetUnitName.split(' ');
    const lastToken = splitStreetUnitName[splitStreetUnitName.length - 1];

    return +lastToken ? splitStreetUnitName.slice(0, -1).join(' ') : streetUnitName;
  }

  static getLastUncancelledAppointmentUUID(appointments, appointmentTypes) {
    let appointmentsByType = appointments.filter(
      (data) => appointmentTypes.indexOf(data.appointmentType) >= 0 && data.Status !== appointmentStatuses.CANCELLED,
    );
    if (!appointmentsByType.length) {
      return null;
    }

    appointmentsByType = appointmentsByType.sort((first, second) => {
      return new Date(second.createdAt) - new Date(first.createdAt);
    });

    return appointmentsByType[0].id;
  }

  static mapOrderResponse(orders) {
    return orders.map((item) => ({
      id: get(item, 'Related_Opportunity__r.External_ID__c'),
      orderNumber: item.OrderNumber,
      orderDate: item.EffectiveDate,
      status: Object.values(inProgressStatusMapping).includes(item.Status) ? orderStatus.IN_PROGRESS : item.Status,
      type: item.Order_category__c || item.Related_Opportunity__r.Type,
      serviceId: item.ServiceId__c,
      partnerId: item.Account.External_ID__c,
      contactId:
        item.Related_Opportunity__r.End_User_Contact__r &&
        item.Related_Opportunity__r.End_User_Contact__r.External_ID__c,
      installationSite: {
        uprn: item.Related_Opportunity__r.UPRN__c,
        streetNumber: item.propertyDetails.streetNumber || null,
        street: this.getStreetName(item.propertyDetails.streetUnitName),
        postcode: item.propertyDetails.postcode || null,
      },
      serviceDelivery: {
        survey: {
          booked: {
            date: item.Date_Time_survey_booked__c,
            delayReason: item.Survey_Booked_Delay_Reason__c,
            appointmentId: item.Date_Time_survey_booked__c
              ? this.getLastUncancelledAppointmentUUID(item.appointments, [appointmentWorkTypes.SURVEY])
              : null,
          },
          completed: {
            date: item.Date_Survey_Completed__c,
            delayReason: item.Survey_Completed_Delay_Reason__c,
          },
        },
        wayleave: {
          sent: {
            date: item.Date_Wayleave_Agreement_Sent__c,
            delayReason: item.Wayleave_sent_to_Lawyer_Delay_Reason__c,
          },
          signed: {
            date: item.Date_Lawyer_Signed_off_Wayleave__c,
            delayReason: item.Lawyer_signed_off_wayleave_Delay_Reason__c,
          },
        },
        installation: {
          booked: {
            date: item.Installation_Date__c,
            delayReason: item.Install_Booked_Delay_Reason__c,
            appointmentId: item.Installation_Date__c
              ? this.getLastUncancelledAppointmentUUID(item.appointments, [
                  appointmentWorkTypes.STANDARD_INSTALL,
                  appointmentWorkTypes.HALF_DAY_INSTALL,
                ])
              : null,
          },
          completed: {
            date: item.ActivatedDate || null,
          },
        },
      },
      products: item.products.map((product) => ({
        productId: product.id,
        productName: product.name,
      })),
      streetUnit: {
        name: item.streetUnit.Name,
        cabName: item.streetUnit.cabName,
        olt: item.streetUnit.olt,
        'pre-agg': item.streetUnit.preAgg,
      },
      circuitConfiguration: {
        ontId: item.ONT_ID__c,
        ontSerialNo: item.ONT_Serial_No__c,
        servicePort: item.Service_Port__c,
        sTag: item.S_Tag__c,
        cTag: item.C_Tag__c,
        f: item.F__c,
        s: item.S__c,
        p: item.P__c,
      },
      createdBy: item.Account.Name,
      createdAt: item.CreatedDate,
      updatedBy: item.Account.Name,
      updatedAt: item.LastModifiedDate,
    }));
  }

  static updateOrder(updateOrderObj) {
    return this.query().update(updateOrderObj);
  }

  static async updateOrderCircuitData({ id, ontId, ontSerialNo, servicePort, sTag, cTag, F, S, P }) {
    return this.query().update({
      Id: id,
      ONT_ID__c: ontId,
      ONT_Serial_No__c: ontSerialNo,
      Service_Port__c: servicePort,
      S_Tag__c: sTag,
      C_Tag__c: cTag,
      F__c: F,
      S__c: S,
      P__c: P,
    });
  }

  static async getOrderById({ id, partnerId }) {
    const filter = { 'Related_Opportunity__r.External_ID__c': id };
    if (partnerId) {
      filter['Account.External_ID__c'] = partnerId;
    }
    const orders = await this.query()
      .find(filter, {
        AccountId: 1,
        External_ID__c: 1,
        EffectiveDate: 1,
        Status: 1,
        Related_Opportunity__c: 1,
        Id: 1,
        ServiceId__c: 1,
        Date_Survey_Booked_for__c: 1,
        Date_Time_survey_booked__c: 1,
        Survey_Booked_Delay_Reason__c: 1,
        Date_Survey_Completed__c: 1,
        Survey_Completed_Delay_Reason__c: 1,
        Date_Wayleave_Agreement_Sent__c: 1,
        Wayleave_sent_to_Lawyer_Delay_Reason__c: 1,
        Date_Lawyer_Signed_off_Wayleave__c: 1,
        Lawyer_signed_off_wayleave_Delay_Reason__c: 1,
        Date_Pack_Generated__c: 1,
        Date_Pack_Sent_to_Lawyer__c: 1,
        Install_Booked_Delay_Reason__c: 1,
        Installation_Date__c: 1,
        ActivatedDate: 1,
        'Related_Opportunity__r.Type': 1,
        'Related_Opportunity__r.Primary_contact_ID__c': 1,
        'Related_Opportunity__r.End_User_Contact__r.External_ID__c': 1,
        'Related_Opportunity__r.UPRN__c': 1,
        'Related_Opportunity__r.External_ID__c': 1,
        F__c: 1,
        S__c: 1,
        P__c: 1,
        S_Tag__c: 1,
        C_Tag__c: 1,
        Service_Port__c: 1,
        ONT_ID__c: 1,
        ONT_Serial_No__c: 1,
        Street_Unit_Wholesale__c: 1,
        OLT_Port__c: 1,
        'Account.External_ID__c': 1,
        Order_category__c: 1,
        Pricebook2Id: 1,
        OrderNumber: 1,
        CreatedDate: 1,
        LastModifiedDate: 1,
        'Account.Name': 1,
        'RecordType.Name': 1,
        SLD_completed__c: 1,
      })
      .limit(1);
    return orders[0];
  }

  static async getOrderByServiceId({ partnerId, serviceId }) {
    const orders = await this.query()
      .find(
        { ServiceId__c: serviceId, 'Account.External_ID__c': partnerId },
        {
          AccountId: 1,
          External_ID__c: 1,
          EffectiveDate: 1,
          Status: 1,
          Related_Opportunity__c: 1,
          Id: 1,
          ServiceId__c: 1,
        },
      )
      .limit(1);
    return orders[0];
  }

  static async getPendingUpgradeDowngradeOrder(partnerId, serviceId) {
    return (
      await this.query()
        .find(
          {
            ServiceId__c: serviceId,
            'Account.External_ID__c': partnerId,
            Order_category__c: [orderTypes.UPGRADE, orderTypes.DOWNGRADE],
            status: orderStatus.DRAFT,
          },
          {
            Id: 1,
          },
        )
        .limit(1)
    )[0];
  }

  static getOrderCollection({ partnerId, status, pageNum, pageSize }) {
    const projection = {
      AccountId: 1,
      External_ID__c: 1,
      EffectiveDate: 1,
      Status: 1,
      Related_Opportunity__c: 1,
      Id: 1,
      ServiceId__c: 1,
      Date_Time_survey_booked__c: 1,
      Survey_Booked_Delay_Reason__c: 1,
      Date_Survey_Completed__c: 1,
      Survey_Completed_Delay_Reason__c: 1,
      Date_Wayleave_Agreement_Sent__c: 1,
      Wayleave_sent_to_Lawyer_Delay_Reason__c: 1,
      Date_Lawyer_Signed_off_Wayleave__c: 1,
      Lawyer_signed_off_wayleave_Delay_Reason__c: 1,
      Date_Pack_Generated__c: 1,
      Date_Pack_Sent_to_Lawyer__c: 1,
      Install_Booked_Delay_Reason__c: 1,
      Installation_Date__c: 1,
      'Related_Opportunity__r.Type': 1,
      'Related_Opportunity__r.Primary_contact_ID__c': 1,
      'Related_Opportunity__r.End_User_Contact__r.External_ID__c': 1,
      'Related_Opportunity__r.UPRN__c': 1,
      'Related_Opportunity__r.External_ID__c': 1,
      F__c: 1,
      S__c: 1,
      P__c: 1,
      S_Tag__c: 1,
      C_Tag__c: 1,
      Service_Port__c: 1,
      ONT_ID__c: 1,
      ONT_Serial_No__c: 1,
      Street_Unit_Wholesale__c: 1,
      OLT_Port__c: 1,
      'Account.External_ID__c': 1,
      Pricebook2Id: 1,
      OrderNumber: 1,
      CreatedDate: 1,
      LastModifiedDate: 1,
      'Account.Name': 1,
    };
    const filter = {};
    const sortCondition = { EffectiveDate: -1 };

    if (partnerId) {
      filter['Account.External_ID__c'] = partnerId;
    }
    if (status) {
      filter.Status = status;
    }
    return pageNum && pageSize
      ? this.findPaginated(filter, projection, pageNum, pageSize, sortCondition)
      : this.query().find(filter, projection).sort(sortCondition).limit(RESOURCES_LIMIT);
  }
}

OrderSalesforce.sobjectType = 'Order';

module.exports = OrderSalesforce;
