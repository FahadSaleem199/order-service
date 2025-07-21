const { Service } = require('@g-network/service-chassis');
const { NotFoundError, InternalError } = require('@g-network/service-chassis/errors');
const { errorMessages } = require('../constants');

class ContactService extends Service {
  async updateById(id, data) {
    const contact = await this.models.ContactSalesforce.updateById({ id, ...data });

    if (contact.errors && contact.errors.length) {
      throw new InternalError(contact.errors);
    }

    return contact;
  }

  async getByExternalId(id) {
    const contact = await this.models.ContactSalesforce.getByExternalId(id);

    if (!contact) {
      throw new NotFoundError(errorMessages.contactNotFound);
    }

    return contact;
  }
}

module.exports = ContactService;
