const { Service } = require('@g-network/service-chassis');
const { NotFoundError, InternalError } = require('@g-network/service-chassis/errors');
const { errorMessages } = require('../constants');

class OpportunityLineItemService extends Service {
  async create(pricebookEntry, opportunityId) {
    const opportunityLineItem = await this.models.OpportunityLineItem.create({
      opportunityId,
      pricebookEntryId: pricebookEntry.Pricebook2Id,
      product2Id: pricebookEntry.Id,
      totalPrice: pricebookEntry.UnitPrice,
      quantity: 1,
    });

    if (opportunityLineItem.errors && opportunityLineItem.errors.length) {
      throw new InternalError(opportunityLineItem.errors);
    }

    return opportunityLineItem;
  }

  async delete(id) {
    const result = await this.models.OpportunityLineItem.delete(id);

    if (result.errors && result.errors.length) {
      throw new InternalError(result.errors);
    }

    return result;
  }

  async getByOpportunityId(opportunityId) {
    const opportunityLineItem = await this.models.OpportunityLineItem.getByOpportunityId(opportunityId);

    if (!opportunityLineItem) {
      throw new NotFoundError(errorMessages.contactNotFound);
    }

    return opportunityLineItem;
  }

  getAllByOpportunityId(opportunityId) {
    return this.models.OpportunityLineItem.getAllByOpportunityId(opportunityId);
  }
}

module.exports = OpportunityLineItemService;
