const { Service } = require('@g-network/service-chassis');
const { ValidationError } = require('@g-network/service-chassis/errors');
const { errorMessages } = require('../constants');

class ProductService extends Service {
  async getById(category, id) {
    try {
      return await this.external.productService.get(`/${category}/${id}`);
    } catch (e) {
      if (e.status === 404) {
        throw new ValidationError(`${errorMessages.productIsNotFound}: /${category}/${id}`);
      }

      throw e;
    }
  }
}

module.exports = ProductService;
