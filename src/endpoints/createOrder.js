const { Schema, validateRequest } = require('@g-network/service-chassis/middleware');
const { orderTypes, validationRules } = require('../constants');

const schema = {
  body: {
    products: Schema.array()
      .items({
        productId: Schema.string().guid().required(),
      })
      .required(),
    contactId: Schema.string().guid().required(),
    partnerId: Schema.string().guid().required(),
    installationSite: Schema.object()
      .keys({
        uprn: Schema.string().required(),
      })
      .required(),
    type: Schema.string()
      .valid(...validationRules.orderTypeValues)
      .required(),
    serviceId: Schema.string()
      .when('type', {
        is: orderTypes.NEW_BUSINESS,
        then: Schema.valid(null),
      })
      .required(),
    actionDate: Schema.date()
      .format('iso')
      .when('type', {
        is: orderTypes.NEW_BUSINESS,
        then: Schema.valid(null),
      })
      .required(),
  },
};

async function handle({ request, response, services }) {
  response.body = await services.order.createOrder(request.body);
  response.status = 201;
}

module.exports = [validateRequest(schema), handle];
module.exports.schema = schema;
module.exports.responses = {
  201: {
    description: 'Success response',
    schema: Schema.object({
      id: Schema.string().uuid(),
      serviceId: Schema.string().uuid(),
    }),
  },
};
