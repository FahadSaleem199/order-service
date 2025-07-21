const SalesforceModel = require('@g-network/salesforce-models');

class Account extends SalesforceModel {
  static async getById(id) {
    return (await this.query().find({ External_ID__c: id }, { Id: 1, 'RecordType.Name': 1 }))[0];
  }
}

Account.sobjectType = 'Account';

module.exports = Account;
