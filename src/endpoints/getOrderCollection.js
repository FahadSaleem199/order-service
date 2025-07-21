const { Schema, validateRequest } = require('@g-network/service-chassis/middleware');
const orderResponseSchema = require('./orderResponseSchema');

const schema = {
  query: {
    pageNum: Schema.number().positive().integer(),
    pageSize: Schema.number().positive().integer(),
    partnerId: Schema.string().guid(),
    status: Schema.string(),
  },
};

async function handle({ response, services, query }) {
  const { pageSize, pageNum, partnerId, status } = query;

  response.body = await services.order.getOrderCollection(
    partnerId,
    status,
    pageNum ? +pageNum : null,
    pageSize ? +pageSize : null,
  );
}

module.exports = [validateRequest(schema), handle];
module.exports.schema = schema;
module.exports.responses = {
  200: {
    description: 'Success response',
    schema: Schema.object({
      data: Schema.array().items(orderResponseSchema),
      pages: {
        totalRows: Schema.number().integer().positive(),
        pageNum: Schema.number().integer().positive(),
        pageSize: Schema.number().integer().positive(),
      },
    }),
  },
};
