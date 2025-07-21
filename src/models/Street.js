const SalesforceModel = require('@g-network/salesforce-models');

class Street extends SalesforceModel {
  static getStreetUnit(id) {
    return this.query()
      .find({ Id: id }, { Id: 1, Name: 1, 'New_Backhauled_To_Cab__r.Name': 1, 'Backhauled_To_Cab__r.Name': 1 })
      .limit(1);
  }
}

Street.sobjectType = 'Street_Unit__c';

module.exports = Street;
