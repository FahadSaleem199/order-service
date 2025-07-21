const SalesforceModel = require('@g-network/salesforce-models');

class PricebookEntry extends SalesforceModel {
  static getPricebookEntry(priceBookName, productId) {
    return this.query()
      .find(
        { 'Product2.External_ID__c': productId, 'Pricebook2.Name': priceBookName },
        { Id: 1, 'Product2.Name': 1, UnitPrice: 1, Pricebook2Id: 1, Product2Id: 1 },
      )
      .limit(1);
  }
}

PricebookEntry.sobjectType = 'PricebookEntry';

module.exports = PricebookEntry;
