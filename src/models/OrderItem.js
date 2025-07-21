const SalesforceModel = require('@g-network/salesforce-models');

class OrderItem extends SalesforceModel {
  static create(data) {
    return this.query().create(data);
  }

  static getByOrderId(orderId) {
    return this.query().find(
      { OrderId: orderId },
      {
        'Product2.External_ID__c': 1,
        'Product2.Name': 1,
        Id: 1,
      },
    );
  }

  static delete(id) {
    return this.query().destroy(id);
  }
}

OrderItem.sobjectType = 'OrderItem';

module.exports = OrderItem;
