const sinon = require('sinon');
const assert = require('assert').strict;
const event = require('./updateOrderCircuit.js');
const { errorMessages } = require('../constants');

const sandbox = sinon.createSandbox();

const services = {
  order: {
    updateCircuit: () => {},
  },
};

const logger = {
  error: () => {},
};

describe('UpdateOrderCircuitEvent', () => {
  beforeEach(() => {
    sandbox.stub(logger, 'error').resolves();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should validate message payload', async () => {
    const updateCircuitStub = sandbox.stub(services.order, 'updateCircuit').resolves();

    const msg = { messageId: 'as', body: JSON.stringify({}) };
    const request = {
      event: { Records: [msg] },
    };

    await event({ request, services, logger });

    sinon.assert.calledOnce(logger.error);
    assert.strictEqual(logger.error.firstCall.firstArg, `Error for message ${msg.messageId}: `);
    assert.strictEqual(logger.error.firstCall.args[1].name, 'ValidationError');
    assert.deepEqual(logger.error.firstCall.args[1].details, {
      'id|serviceId': errorMessages.circuitMessageOrderServiceId,
    });

    logger.error.reset();
    msg.body = 'asdfds';
    request.event.Records = [msg];

    await event({ request, services, logger });

    sinon.assert.calledOnce(logger.error);
    assert.strictEqual(logger.error.firstCall.firstArg, `Error for message ${msg.messageId}: `);
    assert.strictEqual(logger.error.firstCall.args[1].name, 'SyntaxError');
    assert.strictEqual(logger.error.firstCall.args[1].message, 'Unexpected token a in JSON at position 0');

    logger.error.reset();
    msg.body = JSON.stringify({
      partnerId: '41e0cd72-2d4b-4022-9f9e-4c3233f5c4d5',
      id: 'f1e6c825-ac2f-4339-a49d-c9b47de087af',
    });
    request.event.Records = [msg];

    await event({ request, services, logger });

    sinon.assert.calledOnce(logger.error);
    assert.strictEqual(logger.error.firstCall.firstArg, `Error for message ${msg.messageId}: `);
    assert.strictEqual(logger.error.firstCall.args[1].name, 'ValidationError');
    assert.deepEqual(logger.error.firstCall.args[1].details, {
      ontId: '"ontId" is required',
    });

    logger.error.reset();
    msg.body = JSON.stringify({
      partnerId: '41e0cd72-2d4b-4022-9f9e-4c3233f5c4d5',
      id: 'f1e6c825-ac2f-4339-a49d-c9b47de087af',
      ontId: '3',
    });
    request.event.Records = [msg];

    await event({ request, services, logger });

    sinon.assert.calledOnce(logger.error);
    assert.strictEqual(logger.error.firstCall.firstArg, `Error for message ${msg.messageId}: `);
    assert.strictEqual(logger.error.firstCall.args[1].name, 'ValidationError');
    assert.deepEqual(logger.error.firstCall.args[1].details, {
      ontId: '"ontId" must be a number',
    });

    sinon.assert.notCalled(updateCircuitStub);
  });
});
