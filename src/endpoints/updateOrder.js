const { validateRequest, Schema } = require('@g-network/service-chassis/middleware');
const {
  orderStatus,
  errorMessages,
  surveyBookedDelayReasons,
  surveyCompletedDelayReasons,
  wayleaveSentDelayReasons,
  wayleaveSignedDelayReasons,
  installBookedDelayReasons,
} = require('../constants');

const pastDate = Schema.date()
  .format('iso')
  .min(new Date().setFullYear(new Date().getFullYear() - 1))
  .max(new Date())
  .messages({
    'date.min': errorMessages.dateShouldNotBeOlderThan('1 year'),
    'date.max': errorMessages.futureDateIsNotAllowed,
  });

const futureDate = Schema.date()
  .format('iso')
  .min(new Date())
  .max(new Date().setDate(new Date().getDate() + 3))
  .messages({
    'date.min': errorMessages.pastDateIsNotAllowed,
    'date.max': errorMessages.dateShouldNotBeNewerThan('3 days'),
  });

const schema = {
  params: {
    id: Schema.string().guid().required(),
  },
  body: {
    partnerId: Schema.string().guid().allow(null).required(),
    actionDate: Schema.date().format('iso'),
    status: Schema.string().when('partnerId', {
      is: null,
      then: Schema.string().valid(orderStatus.DRAFT),
      otherwise: Schema.string().valid(orderStatus.CANCELLED),
    }),
    installationSite: Schema.object().keys({
      uprn: Schema.string().required(),
    }),
    products: Schema.array().items({
      productId: Schema.string().guid().required(),
    }),
    serviceDelivery: Schema.object()
      .keys({
        survey: Schema.object()
          .keys({
            booked: Schema.object()
              .keys({
                date: futureDate,
                delayReason: Schema.string().valid(...Object.values(surveyBookedDelayReasons)),
              })
              .min(1),
            completed: Schema.object()
              .keys({
                date: pastDate,
                delayReason: Schema.string().valid(...Object.values(surveyCompletedDelayReasons)),
              })
              .min(1),
          })
          .min(1),
        wayleave: Schema.object()
          .keys({
            sent: Schema.object()
              .keys({
                date: pastDate,
                delayReason: Schema.string().valid(...Object.values(wayleaveSentDelayReasons)),
              })
              .min(1),
            signed: Schema.object()
              .keys({
                date: pastDate,
                delayReason: Schema.string().valid(...Object.values(wayleaveSignedDelayReasons)),
              })
              .min(1),
          })
          .min(1),
        installation: Schema.object()
          .keys({
            booked: Schema.object()
              .keys({
                date: futureDate,
                delayReason: Schema.string().valid(...Object.values(installBookedDelayReasons)),
              })
              .min(1),
            completed: Schema.object().keys({
              date: pastDate,
            }),
          })
          .min(1),
      })
      .min(1),
  },
};

async function handle({ request, response, services, params }) {
  await services.order.updateOrder({
    ...request.body,
    id: params.id,
  });

  response.status = 204;
}

module.exports = [validateRequest(schema), handle];
module.exports.schema = schema;
module.exports.responses = {
  204: {
    description: 'Success response',
    schema: Schema.object({}),
  },
};
