const { validateRequest, Schema } = require('@g-network/service-chassis/middleware');
const orderResponseSchema = require('./orderResponseSchema');

const schema = {
  params: {
    id: Schema.string().guid().required(),
  },
};

async function handle({ response, services, params }) {
  const { id } = params;

  response.body = await services.order.getOrderById(id);
}

module.exports = [validateRequest(schema), handle];
module.exports.schema = schema;
module.exports.responses = {
  200: {
    description: 'Success response',
    schema: Schema.object(orderResponseSchema),
  },
};
