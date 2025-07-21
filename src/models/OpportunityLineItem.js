const SalesforceModel = require('@g-network/salesforce-models');

class OpportunityLineItem extends SalesforceModel {
  static create(data) {
    return this.query().create(data);
  }

  static delete(id) {
    return this.query().destroy(id);
  }

  static async getByOpportunityId(opportunityId) {
    return (
      await this.query()
        .find(
          { opportunityId },
          {
            Id: 1,
          },
        )
        .limit(1)
    )[0];
  }

  static getAllByOpportunityId(opportunityId) {
    return this.query().find(
      { opportunityId },
      {
        'Product2.External_ID__c': 1,
        'Product2.Name': 1,
        Id: 1,
      },
    );
  }
}

OpportunityLineItem.sobjectType = 'OpportunityLineItem';

module.exports = OpportunityLineItem;
