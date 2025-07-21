const { Schema } = require('@g-network/service-chassis/middleware');

module.exports = {
  id: Schema.string().uuid(),
  orderNumber: Schema.string(),
  orderDate: Schema.date(),
  status: Schema.string(),
  type: Schema.string(),
  serviceId: Schema.string().uuid(),
  partnerId: Schema.string().uuid(),
  contact: {
    firstName: Schema.string(),
    lastName: Schema.string(),
    telephone: Schema.string(),
    email: Schema.string().email(),
  },
  installationSite: {
    uprn: Schema.number(),
    streetNumber: Schema.string(),
    street: Schema.string(),
    postcode: Schema.number(),
  },
  serviceDelivery: {
    survey: {
      booked: {
        date: Schema.date(),
        delayReason: Schema.string(),
        appointmentId: Schema.string().uuid(),
      },
      completed: {
        date: Schema.date(),
        delayReason: Schema.string(),
      },
    },
    wayleave: {
      sent: {
        date: Schema.date(),
        delayReason: Schema.string(),
      },
      signed: {
        date: Schema.date(),
        delayReason: Schema.string(),
      },
    },
    installation: {
      booked: {
        date: Schema.date(),
        delayReason: Schema.string(),
        appointmentId: Schema.string().uuid(),
      },
      completed: {
        date: Schema.date(),
      },
    },
  },
  products: Schema.array().items({
    productId: Schema.string().uuid(),
    productName: Schema.string(),
  }),
  streetUnit: {
    name: Schema.string(),
    cabName: Schema.number(),
  },
  circuitConfiguration: {
    ontId: Schema.string(),
    ontSerialNo: Schema.string(),
    servicePort: Schema.number(),
    sTag: Schema.number(),
    cTag: Schema.number(),
    f: Schema.string(),
    s: Schema.string(),
    p: Schema.string(),
  },
  createdBy: Schema.string(),
  createdAt: Schema.date(),
  updatedBy: Schema.string(),
  updatedAt: Schema.date(),
};
