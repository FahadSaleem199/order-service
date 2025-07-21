const assert = require('assert').strict;
const sinon = require('sinon');

const sandbox = sinon.createSandbox();

const OrderItemService = require('./OrderItemService');

const models = {
  OrderItem: {
    create: async () => {},
    delete: async () => {},
    getByOrderId: async () => {},
  },
};

const service = new OrderItemService({ models });

describe('OrderItem service', () => {
  afterEach(() => {
    sandbox.restore();
  });

  describe('Create OrderItem', () => {
    const pricebookEntry = {
      Id: '01u4I00000p6CdFQAU',
      UnitPrice: 0,
      Pricebook2Id: '01u4I00000p6CdFQAU',
      Product2Id: '01t4I0000061ykyQAA',
    };
    const orderId = '02d2I00000p3CdSQDC';

    it('should create OrderItem', async () => {
      const createOrderItemResult = {
        id: '0060C0000036BiQQAU',
        success: true,
        errors: [],
      };

      const createOrderItemStub = await sandbox.stub(models.OrderItem, 'create').resolves(createOrderItemResult);

      const result = await service.create(pricebookEntry, orderId);

      sandbox.assert.calledOnceWithExactly(createOrderItemStub, {
        orderId,
        pricebookEntryId: pricebookEntry.Pricebook2Id,
        product2Id: pricebookEntry.Id,
        unitPrice: pricebookEntry.UnitPrice,
        quantity: 1,
      });
      assert.deepStrictEqual(result, createOrderItemResult);
    });

    it('should throw Internal error', async () => {
      const createOrderItemResult = { success: false, errors: ['some error'] };

      const createOrderItemStub = await sandbox.stub(models.OrderItem, 'create').resolves(createOrderItemResult);

      await assert.rejects(service.create(pricebookEntry, orderId), {
        name: 'InternalError',
      });

      sandbox.assert.calledOnceWithExactly(createOrderItemStub, {
        orderId,
        pricebookEntryId: pricebookEntry.Pricebook2Id,
        product2Id: pricebookEntry.Id,
        unitPrice: pricebookEntry.UnitPrice,
        quantity: 1,
      });
    });
  });

  describe('Delete OrderItem', () => {
    const orderItemId = '0060C0000036BiQQAU';

    it('should update OrderItem by ID', async () => {
      const deleteOrderItemResult = {
        success: true,
        errors: [],
      };

      const updateOrderItemStub = await sandbox.stub(models.OrderItem, 'delete').resolves(deleteOrderItemResult);

      const result = await service.delete(orderItemId);

      sandbox.assert.calledOnceWithExactly(updateOrderItemStub, orderItemId);
      assert.deepStrictEqual(result, deleteOrderItemResult);
    });

    it('should throw Internal error', async () => {
      const deleteOrderItemResult = { success: false, errors: ['some error'] };

      const deleteOrderItemStub = await sandbox.stub(models.OrderItem, 'delete').resolves(deleteOrderItemResult);

      await assert.rejects(service.delete(orderItemId), {
        name: 'InternalError',
      });

      sandbox.assert.calledOnceWithExactly(deleteOrderItemStub, orderItemId);
    });
  });

  describe('Get OrderItem', () => {
    const orderId = '0060C000003aLagQAE';

    it('should return OrderItem by opportunity id', async () => {
      const getByOrderIdData = {
        Id: '0070C000002fDqdDFR',
      };

      const getByOrderIdStub = await sandbox.stub(models.OrderItem, 'getByOrderId').resolves(getByOrderIdData);

      const result = await service.getByOrderId(orderId);

      sandbox.assert.calledOnceWithExactly(getByOrderIdStub, orderId);
      assert.deepStrictEqual(result, getByOrderIdData);
    });

    it('should throw Not found error', async () => {
      const getByOpportunityIdStub = await sandbox.stub(models.OrderItem, 'getByOrderId').resolves(null);

      await assert.rejects(service.getByOrderId(orderId), {
        name: 'NotFoundError',
      });

      sandbox.assert.calledOnceWithExactly(getByOpportunityIdStub, orderId);
    });
  });
});
