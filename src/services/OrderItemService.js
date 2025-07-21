const { Service } = require('@g-network/service-chassis');
const { NotFoundError, InternalError } = require('@g-network/service-chassis/errors');
const { errorMessages } = require('../constants');

class OpportunityLineItemService extends Service {
  async create(pricebookEntry, orderId) {
    const orderItem = await this.models.OrderItem.create({
      orderId,
      pricebookEntryId: pricebookEntry.Pricebook2Id,
      product2Id: pricebookEntry.Id,
      unitPrice: pricebookEntry.UnitPrice,
      quantity: 1,
    });

    if (orderItem.errors && orderItem.errors.length) {
      throw new InternalError(orderItem.errors);
    }

    return orderItem;
  }

  async delete(id) {
    const result = await this.models.OrderItem.delete(id);

    if (result.errors && result.errors.length) {
      throw new InternalError(result.errors);
    }

    return result;
  }

  async getByOrderId(orderId) {
    const orderItem = await this.models.OrderItem.getByOrderId(orderId);

    if (!orderItem) {
      throw new NotFoundError(errorMessages.orderItemNotFound);
    }

    return orderItem;
  }
}

module.exports = OpportunityLineItemService;
