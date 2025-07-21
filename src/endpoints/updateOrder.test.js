const sinon = require('sinon');
const assert = require('assert').strict;
const [validator, handle] = require('./updateOrder');

const { orderStatus } = require('../constants');

const sandbox = sinon.createSandbox();

const endpoint = (ctx) => validator(ctx, () => handle(ctx));

const services = {
  order: {
    updateOrder: () => {},
  },
};

const partnerId = '41e0cd72-2d4b-4022-9f9e-4c3233f5c4d5';
function genBaseParams() {
  return {
    id: 'd26cbb38-3542-4390-bf5a-e79f14868d61',
  };
}

function genBaseRequest() {
  return {
    installationSite: {
      uprn: '10,090,549,279',
    },
    products: [
      {
        productId: '3e6356d7-cdca-4ddd-8260-9da7e8821c84',
      },
    ],
    partnerId,
  };
}

describe('Update Order endpoint', () => {
  afterEach(() => {
    sandbox.restore();
  });

  it('should update an order', async () => {
    const params = genBaseParams();
    const body = genBaseRequest();
    const request = {
      body,
    };
    const response = {};

    const id = 'd26cbb38-3542-4390-bf5a-e79f14868d61';
    const updateOrder = {
      id,
    };

    sandbox.stub(services.order, 'updateOrder').resolves(updateOrder);

    await endpoint({ request, response, services, params });

    assert.equal(response.status, 204);

    sinon.assert.calledOnce(services.order.updateOrder);
    sinon.assert.calledWithExactly(services.order.updateOrder, {
      partnerId,
      id: params.id,
      installationSite: body.installationSite,
      products: body.products,
    });
  });

  it('should update the productType business product', async () => {
    const params = genBaseParams();
    const body = genBaseRequest();

    const request = {
      body,
    };

    const response = {};

    const id = 'd26cbb38-3542-4390-bf5a-e79f14868d61';
    const updateOrder = {
      id,
    };

    sandbox.stub(services.order, 'updateOrder').resolves(updateOrder);

    await endpoint({ request, response, services, params });

    assert.equal(response.status, 204);

    sinon.assert.calledOnce(services.order.updateOrder);
    sinon.assert.calledWithExactly(services.order.updateOrder, {
      partnerId,
      id: params.id,
      installationSite: body.installationSite,
      products: body.products,
    });
  });

  describe('Validation', () => {
    async function testValidation(params, body, errorMessage) {
      const request = {
        body,
      };
      const response = {};

      await assert.rejects(endpoint({ request, response, services, params }), (err) => {
        assert.strictEqual(err.name, 'ValidationError');
        assert.deepEqual(err.details, errorMessage);
        return true;
      });
    }

    it('Should give Validation error for `partnerId`', async () => {
      const body = genBaseRequest();
      const params = genBaseParams();

      body.partnerId = '';
      await testValidation(params, body, {
        partnerId: '"partnerId" is not allowed to be empty',
      });
    });

    it('Should give Validation error for `id`', async () => {
      const params = genBaseParams();
      const body = genBaseRequest();

      params.id = '';
      await testValidation(params, body, {
        id: '"id" is not allowed to be empty',
      });
    });

    it('should validate request installationSite', async () => {
      const params = genBaseParams();
      let body = genBaseRequest();

      body.installationSite = '';
      await testValidation(params, body, {
        installationSite: '"installationSite" must be of type object',
      });

      body = genBaseRequest();
      body.installationSite.uprn = '';
      await testValidation(params, body, {
        'installationSite,uprn': '"installationSite.uprn" is not allowed to be empty',
      });
    });

    it('should validate request product', async () => {
      const params = genBaseParams();
      let body = genBaseRequest();
      body.products = '';
      await testValidation(params, body, {
        products: '"products" must be an array',
      });

      body = genBaseRequest();
      body.products[0].productId = '';
      await testValidation(params, body, {
        'products,0,productId': '"products[0].productId" is not allowed to be empty',
      });

      body = genBaseRequest();
      body.products[0].productId = 'asdf';
      await testValidation(params, body, {
        'products,0,productId': '"products[0].productId" must be a valid GUID',
      });
    });

    it('Only retail orders should be available for status change to DRAFT', async () => {
      const params = genBaseParams();
      const body = genBaseRequest();

      body.status = orderStatus.DRAFT;

      await testValidation(params, body, {
        status: '"status" must be [Cancelled]',
      });
    });
  });
});
