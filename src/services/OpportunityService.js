const { Service } = require('@g-network/service-chassis');
const { NotFoundError, InternalError } = require('@g-network/service-chassis/errors');
const { errorMessages } = require('../constants');

class OpportunityService extends Service {
  async create(data) {
    const opportunity = await this.models.Opportunity.create({
      ...data,
      closeDate: new Date().toISOString().split('T')[0],
    });

    if (opportunity.errors && opportunity.errors.length) {
      throw new InternalError(opportunity.errors);
    }

    const { External_ID__c: externalOpportunityUUID } = await this.getById(opportunity.id);

    return { ...opportunity, externalOpportunityUUID };
  }

  async updateById(id, data) {
    const opportunity = await this.models.Opportunity.updateById({ Id: id, ...data });

    if (opportunity.errors && opportunity.errors.length) {
      throw new InternalError(opportunity.errors);
    }

    return opportunity;
  }

  async getById(id) {
    const opportunity = await this.models.Opportunity.getById(id);

    if (!opportunity) {
      throw new NotFoundError(errorMessages.relatedOpportunityNotFound);
    }

    return opportunity;
  }

  async getByExternalId(id) {
    const opportunity = await this.models.Opportunity.getByExternalId(id);

    if (!opportunity) {
      throw new NotFoundError(errorMessages.relatedOpportunityNotFound);
    }

    return opportunity;
  }

  async getByOrderStatus(relatedOrderStatus, partnerId, serviceId) {
    const opportunity = await this.models.Opportunity.getByOrderStatus(relatedOrderStatus, partnerId, serviceId);

    if (!opportunity) {
      throw new NotFoundError(errorMessages.relatedOpportunityNotFound);
    }

    return opportunity;
  }
}

module.exports = OpportunityService;
