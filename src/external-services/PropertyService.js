const { Service } = require('@g-network/service-chassis');
const { NotFoundError } = require('@g-network/service-chassis/errors');
const { errorMessages } = require('../constants');

class PropertyService extends Service {
  async getProperty(uprn) {
    const [property] = (
      await this.external.propertyService.get(`/property`, {
        query: { uprn },
      })
    ).data;

    if (!property) {
      throw new NotFoundError(errorMessages.propertyNotFound);
    }

    return property;
  }
}

module.exports = PropertyService;
