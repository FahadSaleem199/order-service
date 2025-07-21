const sinon = require('sinon');
const assert = require('assert').strict;
const [validator, handle] = require('./getOrder');

const sandbox = sinon.createSandbox();

const endpoint = (ctx) => validator(ctx, () => handle(ctx));

let params = {};

const services = {
  order: {
    getOrderById: () => {},
  },
};

describe('Get Order Endpoint', () => {
  afterEach(() => {
    sandbox.restore();
  });

  it('Should get the order successfully.', async () => {
    const id = '0f9caf7e-5c38-41bf-a6cc-9045ca576630';
    params = {
      id,
    };

    const mappedOrders = {
      orderNumber: 'ac420442-1248-4409-bf3a-7ce77d9610f1',
      orderDate: '2019-11-24',
      orderStatus: 'Draft',
      type: 'New Business',
      serviceId: 'S-00000001',
      contact: {
        FirstName: 'Amir Alpha',
        LastName: 'Omega',
        Salutation: 'Mr.',
        Suffix: null,
        Phone: '07777 777777',
        Email: 'robmacgregor@g.network',
      },
      installationSite: {
        uprn: 777,
      },
      serviceDelivery: {
        survey: {
          booked: {
            date: '2020-07-01T06:24:00.000+0000',
            delayReason: null,
            appointments: [
              {
                appointmentId: 'b970b504-2867-499f-b38f-7cfcfef65667',
              },
              {
                appointmentId: 'f451bf69-9545-47cb-b4a6-49a32ef7c08c',
              },
            ],
          },
          completed: {
            date: null,
            delayReason: null,
          },
        },
        wayleave: {
          sent: {
            date: null,
            delayReason: null,
          },
          signed: {
            date: null,
            delayReason: null,
          },
        },
        installation: {
          booked: {
            date: '2020-07-01',
            delayReason: null,
            appointments: [
              {
                appointmentId: '489f29be-caf0-46e8-a5db-420ab03a627a',
              },
            ],
          },
          completed: {
            date: null,
          },
        },
      },
      products: [
        {
          productId: '00k0C000003D19LQAS',
        },
      ],
      streetUnit: {
        name: 'Grosvenor Street 1',
        cabName: 'GROS01',
        olt: 'olt.gros01',
        'pre-agg': 'pre-agg.gros01',
      },
      circuitConfiguration: {
        ontId: '123',
        ontSerialNo: 'SRG457-35SGFHR-45DF',
        servicePort: '302',
        sTag: '3001',
        cTag: '4',
        f: '8',
        s: '12',
        p: '3',
      },
      createdBy: 'GNetworks API User',
      createdAt: '2020-06-11T12:52:39.000+0000',
      updatedBy: 'GNetworks API User',
      updatedAt: '2020-06-18T11:27:58.000+0000',
    };

    sandbox.stub(services.order, 'getOrderById').resolves(mappedOrders);

    const response = {};
    await endpoint({ response, services, params });

    assert.deepStrictEqual(mappedOrders, response.body);

    sinon.assert.calledOnce(services.order.getOrderById);
    sinon.assert.calledWithExactly(services.order.getOrderById, id);
  });

  it('should return "required fields must not be empty"', async () => {
    params = {
      id: '',
    };
    const response = {};
    await assert.rejects(endpoint({ response, services, params }), {
      name: 'ValidationError',
    });
  });

  it('should return "invalid type parameter passed"', async () => {
    params = {
      id: '0f9caf7e-5c38-41bf-a6cc-9045ca576630',
      test: 'abc',
    };
    const response = {};
    await assert.rejects(endpoint({ response, services, params }), (err) => {
      assert.equal(err.name, 'ValidationError');
      assert.deepEqual(err.details, { test: '"test" is not allowed' });
      return true;
    });
  });

  it('is not given a "id" and should give a validation error', async () => {
    params = {};

    const response = {};
    await assert.rejects(endpoint({ response, services, params }), (err) => {
      assert.equal(err.name, 'ValidationError');
      assert.deepEqual(err.details, { id: '"id" is required' });
      return true;
    });
  });
});
