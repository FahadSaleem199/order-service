const sinon = require('sinon');
const assert = require('assert').strict;
const { validationRules, orderTypes } = require('../constants');
const [validator, handle] = require('./createOrder');

const sandbox = sinon.createSandbox();

const endpoint = (ctx) => validator(ctx, () => handle(ctx));

const services = {
  order: {
    createOrder: () => {},
  },
};

const productId = '3e6356d7-cdca-4ddd-8260-9da7e8821c84';
const partnerId = '41e0cd72-2d4b-4022-9f9e-4c3233f5c4d5';

function genBaseRequest() {
  return {
    contactId: '9e594c90-e388-11ea-87d0-0242ac130003',
    installationSite: {
      uprn: '777',
    },
    products: [
      {
        productId,
      },
    ],
    type: orderTypes.NEW_BUSINESS,
    serviceId: null,
    actionDate: null,
    partnerId,
  };
}

describe('Create Order endpoint', () => {
  afterEach(() => {
    sandbox.restore();
  });

  it('should create an order for residential product', async () => {
    const body = genBaseRequest();

    const request = {
      body,
    };
    const response = {};

    const newOrder = {};

    sandbox.stub(services.order, 'createOrder').resolves(newOrder);

    await endpoint({ request, response, services });

    assert.deepStrictEqual(response.body, newOrder);

    sinon.assert.calledOnceWithExactly(services.order.createOrder, {
      ...body,
      partnerId,
    });
  });

  it('should create an order for business product', async () => {
    const body = genBaseRequest();

    const request = {
      body,
    };
    const response = {};

    const newOrder = {};

    sandbox.stub(services.order, 'createOrder').resolves(newOrder);

    await endpoint({ request, response, services });

    assert.deepStrictEqual(response.body, newOrder);

    sinon.assert.calledOnceWithExactly(services.order.createOrder, {
      ...body,
      partnerId,
    });
  });

  describe('Validation', () => {
    async function testValidation(body, details) {
      const request = {
        body: {
          ...body,
          partnerId,
        },
      };
      const response = {};

      await assert.rejects(endpoint({ request, response, services }), (err) => {
        assert.strictEqual(err.name, 'ValidationError');
        assert.deepEqual(err.details, details);
        return true;
      });
    }

    it('should validate request contactId', async () => {
      const body = genBaseRequest();
      body.contactId = '123';
      await testValidation(body, { contactId: '"contactId" must be a valid GUID' });
    });

    it('should validate request installationSite', async () => {
      let body = genBaseRequest();
      body.installationSite = '';
      await testValidation(body, { installationSite: '"installationSite" must be of type object' });

      body = genBaseRequest();
      body.installationSite.uprn = '';
      await testValidation(body, {
        'installationSite,uprn': '"installationSite.uprn" is not allowed to be empty',
      });
      body.installationSite.uprn = undefined;
      await testValidation(body, {
        'installationSite,uprn': '"installationSite.uprn" is required',
      });
    });

    it('should validate request product', async () => {
      let body = genBaseRequest();
      body.products = '';
      await testValidation(body, { products: '"products" must be an array' });

      body = genBaseRequest();
      body.products[0].productId = '';
      await testValidation(body, {
        'products,0,productId': '"products[0].productId" is not allowed to be empty',
      });

      body = genBaseRequest();
      body.products[0].productId = 'asdf';
      await testValidation(body, {
        'products,0,productId': '"products[0].productId" must be a valid GUID',
      });

      body = genBaseRequest();
      body.products[0].productId = undefined;
      await testValidation(body, { 'products,0,productId': '"products[0].productId" is required' });
    });

    it('should validate request type', async () => {
      const body = genBaseRequest();
      body.type = 'someType';
      body.serviceId = null;
      body.actionDate = 'someActionDate';
      await testValidation(body, {
        type: `"type" must be one of [${validationRules.orderTypeValues.join(', ')}]`,
        serviceId: `"serviceId" must be a string`,
        actionDate: `"actionDate" must be in ISO 8601 date format`,
      });
    });

    it(`should validate request serviceId & actionDate with type ${orderTypes.NEW_BUSINESS}`, async () => {
      let body = genBaseRequest();
      body.serviceId = 'someServiceId';
      await testValidation(body, { serviceId: `"serviceId" must be [null]` });

      body = genBaseRequest();
      body.actionDate = '2020-08-19T08:02:30.554Z';
      await testValidation(body, { actionDate: `"actionDate" must be [null]` });
    });

    it(`should validate request serviceId & actionDate with type ${orderTypes.UPGRADE}/${orderTypes.DOWNGRADE}`, async () => {
      const body = genBaseRequest();
      body.type = orderTypes.UPGRADE;
      body.serviceId = null;
      body.actionDate = null;
      await testValidation(body, {
        serviceId: `"serviceId" must be a string`,
        actionDate: `"actionDate" must be a valid date`,
      });
    });
  });
});
