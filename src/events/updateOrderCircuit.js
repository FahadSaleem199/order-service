const { Schema } = require('@g-network/service-chassis/middleware');
const { ValidationError } = require('@g-network/service-chassis/errors');
const { errorMessages } = require('../constants');

const circuitDataSchema = Schema.object()
  .keys({
    partnerId: Schema.string().guid().required(),
    id: Schema.string().guid(),
    serviceId: Schema.string().guid(),
    ontId: Schema.number().strict().integer().required(),
    ontSerialNo: Schema.string().required(),
    servicePort: Schema.number().strict().integer().required(),
    sTag: Schema.number().strict().integer().required(),
    cTag: Schema.number().strict().integer().required(),
    F: Schema.string().required(),
    S: Schema.string().required(),
    P: Schema.string().required(),
  })
  .required()
  .label('circuitData');

function parseAndValidateMessage(jsonPayload) {
  const payload = JSON.parse(jsonPayload);

  if ((!payload.id && !payload.serviceId) || (payload.id && payload.serviceId))
    throw new ValidationError([
      {
        message: errorMessages.circuitMessageOrderServiceId,
        path: 'id|serviceId',
      },
    ]);

  const { error } = circuitDataSchema.validate(payload);
  if (error) throw new ValidationError(error.details);
  else return payload;
}

function handle({ request, services, logger }) {
  async function handleSqsMessage(message) {
    try {
      await services.order.updateCircuit(parseAndValidateMessage(message.body));

      logger.info(`Message ${message.messageId} was successfully parsed`);
    } catch (err) {
      logger.error(`Error for message ${message.messageId}: `, err);
    }
  }

  return Promise.all(request.event.Records.map(handleSqsMessage));
}

module.exports = handle;
