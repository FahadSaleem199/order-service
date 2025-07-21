const { Schema } = require('@g-network/service-chassis/middleware');
const { ValidationError } = require('@g-network/service-chassis/errors');

const circuitDataSchema = Schema.object()
  .keys({
    payload: Schema.object()
      .keys({
        partnerId: Schema.string().guid().required(),
        orderId: Schema.string().guid().required(),
        sTag: Schema.number().strict().integer().required(),
        cTag: Schema.number().strict().integer().required(),
        eventType: Schema.valid('TAGS_RESERVED').required(),
      })
      .required(),
  })
  .required()
  .label('circuitData');

function parseAndValidateMessage(jsonPayload) {
  const payload = JSON.parse(jsonPayload);
  const { error } = circuitDataSchema.validate(payload);

  if (error) throw new ValidationError(error.details);

  return payload;
}

function handle({ request, services, logger }) {
  async function handleSnsMessage({ Sns: { Message: message, MessageId: messageId } }) {
    try {
      const {
        payload: { orderId, eventType, ...payload },
      } = parseAndValidateMessage(message);

      await services.order.updateCircuit({ id: orderId, ...payload });

      logger.info(`Message ${messageId} was successfully parsed`);
    } catch (err) {
      logger.error(`Error for message ${messageId}: `, err);
    }
  }

  return Promise.all(request.event.Records.map(handleSnsMessage));
}

module.exports = handle;
