const SalesforceModel = require('@g-network/salesforce-models');
const { propertyTypes } = require('../constants');

class Opportunity extends SalesforceModel {
  static create({
    recordType,
    opportunityName,
    partnerId,
    closeDate,
    residentialOrBusiness,
    stageName,
    streetUnitId,
    buildingId,
    type,
    contactId,
    priceBookName,
    propertyType,
    propertyId,
    isWholesale,
  }) {
    const query = {
      RecordType: { Name: recordType },
      Name: opportunityName,
      CloseDate: closeDate,
      Res_or_Bus__c: residentialOrBusiness,
      StageName: stageName,
      Type: type,
      Pricebook2: { Name: priceBookName },
      Street_Unit__c: streetUnitId,
      Building__c: buildingId,
    };

    // eslint-disable-next-line default-case
    switch (propertyType) {
      case propertyTypes.BUSINESS:
        query.Organisation_Name__c = propertyId;
        break;
      case propertyTypes.RESIDENTIAL:
        query.Flat_Lookup__c = propertyId;
        break;
    }

    if (isWholesale) {
      query.End_User_Contact__c = contactId;
    }

    query.Account = { External_ID__c: partnerId };

    return this.query().create(query);
  }

  static updateById(updateData) {
    return this.query().update(updateData);
  }

  static async getById(id) {
    return (
      await this.query()
        .find(
          { Id: id },
          {
            Id: 1,
            Loss_Reason__c: 1,
            Type: 1,
            End_User_Contact__c: 1,
            'End_User_Contact__r.FirstName': 1,
            'End_User_Contact__r.LastName': 1,
            'End_User_Contact__r.Phone': 1,
            'End_User_Contact__r.Email': 1,
            UPRN__c: 1,
            Service_ID__c: 1,
            External_ID__c: 1,
          },
        )
        .limit(1)
    )[0];
  }

  static async getByExternalId(id, partnerId) {
    const filter = { External_ID__c: id };

    if (partnerId) {
      filter['Account.External_ID__c'] = partnerId;
    }

    return (
      await this.query()
        .find(filter, {
          Id: 1,
          External_ID__c: 1,
          Loss_Reason__c: 1,
          Type: 1,
          End_User_Contact__c: 1,
          'End_User_Contact__r.External_ID__c': 1,
          'Account.Contact__r.External_ID__c': 1,
          'Account.Contact__r.FirstName': 1,
          'Account.Contact__r.LastName': 1,
          'Account.Contact__r.Phone': 1,
          'Account.Contact__r.Email': 1,
          'Street_Unit__r.Name': 1,
          'Street_Unit__r.Cabinet_Name__c': 1,
          'Account.Name': 1,
          CreatedDate: 1,
          LastModifiedDate: 1,
          UPRN__c: 1,
          Service_ID__c: 1,
          StageName: 1,
        })
        .limit(1)
    )[0];
  }

  static async getByOrderStatus(relatedOrderStatus, partnerId, serviceId) {
    return (
      await this.query()
        .find(
          {
            Service_ID__c: serviceId,
            'Account.External_ID__c': partnerId,
            Related_Order_Status__c: relatedOrderStatus,
          },
          { Id: 1, External_ID__c: 1, Name: 1 },
        )
        .sort({ CreatedDate: 1 })
    ).pop();
  }
}

Opportunity.sobjectType = 'Opportunity';

module.exports = Opportunity;
