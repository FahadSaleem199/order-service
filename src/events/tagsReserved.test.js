const sinon = require('sinon');
const assert = require('assert').strict;

const event = require('./tagsReserved');

const sandbox = sinon.createSandbox();

const services = {
  order: {
    updateCircuit: () => {},
  },
};

const logger = {
  error: () => {},
};

describe('TagsReservedEvent', () => {
  beforeEach(() => {
    sandbox.stub(logger, 'error').resolves();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should validate message payload', async () => {
    const updateCircuitStub = sandbox.stub(services.order, 'updateCircuit').resolves();

    const msg = { MessageId: 'as', Message: JSON.stringify({}) };
    const request = {
      event: { Records: [{ Sns: msg }] },
    };

    await event({ request, services, logger });

    sinon.assert.calledOnce(logger.error);
    assert.strictEqual(logger.error.firstCall.firstArg, `Error for message ${msg.MessageId}: `);
    assert.strictEqual(logger.error.firstCall.args[1].name, 'ValidationError');
    assert.deepEqual(logger.error.firstCall.args[1].details, {
      payload: '"payload" is required',
    });

    logger.error.reset();
    msg.Message = 'asdfds';
    request.event.Records = [{ Sns: msg }];

    await event({ request, services, logger });

    sinon.assert.calledOnce(logger.error);
    assert.strictEqual(logger.error.firstCall.firstArg, `Error for message ${msg.MessageId}: `);
    assert.strictEqual(logger.error.firstCall.args[1].name, 'SyntaxError');
    assert.strictEqual(logger.error.firstCall.args[1].message, 'Unexpected token a in JSON at position 0');

    logger.error.reset();
    msg.Message = JSON.stringify({
      payload: {
        partnerId: '41e0cd72-2d4b-4022-9f9e-4c3233f5c4d5',
      },
    });
    request.event.Records = [{ Sns: msg }];

    await event({ request, services, logger });

    sinon.assert.calledOnce(logger.error);
    assert.strictEqual(logger.error.firstCall.firstArg, `Error for message ${msg.MessageId}: `);
    assert.strictEqual(logger.error.firstCall.args[1].name, 'ValidationError');
    assert.deepEqual(logger.error.firstCall.args[1].details, {
      'payload,orderId': '"payload.orderId" is required',
    });

    logger.error.reset();
    msg.Message = JSON.stringify({
      payload: {
        partnerId: '41e0cd72-2d4b-4022-9f9e-4c3233f5c4d5',
        orderId: 'f1e6c825-ac2f-4339-a49d-c9b47de087af',
      },
    });
    request.event.Records = [{ Sns: msg }];

    await event({ request, services, logger });

    sinon.assert.calledOnce(logger.error);
    assert.strictEqual(logger.error.firstCall.firstArg, `Error for message ${msg.MessageId}: `);
    assert.strictEqual(logger.error.firstCall.args[1].name, 'ValidationError');
    assert.deepEqual(logger.error.firstCall.args[1].details, {
      'payload,sTag': '"payload.sTag" is required',
    });

    logger.error.reset();
    msg.Message = JSON.stringify({
      payload: {
        partnerId: '41e0cd72-2d4b-4022-9f9e-4c3233f5c4d5',
        orderId: 'f1e6c825-ac2f-4339-a49d-c9b47de087af',
        sTag: 111,
      },
    });
    request.event.Records = [{ Sns: msg }];

    await event({ request, services, logger });

    sinon.assert.calledOnce(logger.error);
    assert.strictEqual(logger.error.firstCall.firstArg, `Error for message ${msg.MessageId}: `);
    assert.strictEqual(logger.error.firstCall.args[1].name, 'ValidationError');
    assert.deepEqual(logger.error.firstCall.args[1].details, {
      'payload,cTag': '"payload.cTag" is required',
    });

    logger.error.reset();
    msg.Message = JSON.stringify({
      payload: {
        partnerId: '41e0cd72-2d4b-4022-9f9e-4c3233f5c4d5',
        orderId: 'f1e6c825-ac2f-4339-a49d-c9b47de087af',
        sTag: 111,
        cTag: 222,
      },
    });
    request.event.Records = [{ Sns: msg }];

    await event({ request, services, logger });

    sinon.assert.calledOnce(logger.error);
    assert.strictEqual(logger.error.firstCall.firstArg, `Error for message ${msg.MessageId}: `);
    assert.strictEqual(logger.error.firstCall.args[1].name, 'ValidationError');
    assert.deepEqual(logger.error.firstCall.args[1].details, {
      'payload,eventType': '"payload.eventType" is required',
    });

    sinon.assert.notCalled(updateCircuitStub);
  });

  it('should call updateCircuit service method', async () => {
    const orderId = 'f1e6c825-ac2f-4339-a49d-c9b47de087af';
    const partnerId = '41e0cd72-2d4b-4022-9f9e-4c3233f5c4d5';
    const sTag = 111;
    const cTag = 222;
    const updateCircuitStub = sandbox.stub(services.order, 'updateCircuit').resolves(null);
    const request = {
      event: {
        Records: [
          {
            Sns: {
              MessageId: 'as',
              Message: JSON.stringify({
                payload: {
                  partnerId,
                  orderId,
                  sTag,
                  cTag,
                  eventType: 'TAGS_RESERVED',
                },
              }),
            },
          },
        ],
      },
    };

    await event({ request, services, logger });

    assert(updateCircuitStub.calledWithExactly({ id: orderId, partnerId, sTag, cTag }));
  });
});
