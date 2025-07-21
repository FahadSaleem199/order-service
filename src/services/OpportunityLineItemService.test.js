const assert = require('assert').strict;
const sinon = require('sinon');

const sandbox = sinon.createSandbox();

const OpportunityLineItemService = require('./OpportunityLineItemService');

const models = {
  OpportunityLineItem: {
    create: async () => {},
    delete: async () => {},
    getByOpportunityId: async () => {},
    getAllByOpportunityId: async () => {},
  },
};

const service = new OpportunityLineItemService({ models });

describe('OpportunityLineItem service', () => {
  afterEach(() => {
    sandbox.restore();
  });

  describe('Create OpportunityLineItem', () => {
    const pricebookEntry = {
      Id: '01u4I00000p6CdFQAU',
      UnitPrice: 0,
      Pricebook2Id: '01u4I00000p6CdFQAU',
      Product2Id: '01t4I0000061ykyQAA',
    };
    const opportunityId = '02d2I00000p3CdSQDC';

    it('should create OpportunityLineItem', async () => {
      const createOpportunityLineItemResult = {
        id: '0060C0000036BiQQAU',
        success: true,
        errors: [],
      };

      const createOpportunityLineItemStub = await sandbox
        .stub(models.OpportunityLineItem, 'create')
        .resolves(createOpportunityLineItemResult);

      const result = await service.create(pricebookEntry, opportunityId);

      sandbox.assert.calledOnceWithExactly(createOpportunityLineItemStub, {
        opportunityId,
        pricebookEntryId: pricebookEntry.Pricebook2Id,
        product2Id: pricebookEntry.Id,
        totalPrice: pricebookEntry.UnitPrice,
        quantity: 1,
      });
      assert.deepStrictEqual(result, createOpportunityLineItemResult);
    });

    it('should throw Internal error', async () => {
      const createOpportunityLineItemResult = { success: false, errors: ['some error'] };

      const createOpportunityLineItemStub = await sandbox
        .stub(models.OpportunityLineItem, 'create')
        .resolves(createOpportunityLineItemResult);

      await assert.rejects(service.create(pricebookEntry, opportunityId), {
        name: 'InternalError',
      });

      sandbox.assert.calledOnceWithExactly(createOpportunityLineItemStub, {
        opportunityId,
        pricebookEntryId: pricebookEntry.Pricebook2Id,
        product2Id: pricebookEntry.Id,
        totalPrice: pricebookEntry.UnitPrice,
        quantity: 1,
      });
    });
  });

  describe('Delete OpportunityLineItem', () => {
    const opportunityLineItemId = '0060C0000036BiQQAU';

    it('should update OpportunityLineItem by ID', async () => {
      const deleteOpportunityLineItemResult = {
        success: true,
        errors: [],
      };

      const updateOpportunityLineItemStub = await sandbox
        .stub(models.OpportunityLineItem, 'delete')
        .resolves(deleteOpportunityLineItemResult);

      const result = await service.delete(opportunityLineItemId);

      sandbox.assert.calledOnceWithExactly(updateOpportunityLineItemStub, opportunityLineItemId);
      assert.deepStrictEqual(result, deleteOpportunityLineItemResult);
    });

    it('should throw Internal error', async () => {
      const deleteOpportunityLineItemResult = { success: false, errors: ['some error'] };

      const deleteOpportunityLineItemStub = await sandbox
        .stub(models.OpportunityLineItem, 'delete')
        .resolves(deleteOpportunityLineItemResult);

      await assert.rejects(service.delete(opportunityLineItemId), {
        name: 'InternalError',
      });

      sandbox.assert.calledOnceWithExactly(deleteOpportunityLineItemStub, opportunityLineItemId);
    });
  });

  describe('Get OpportunityLineItem', () => {
    const opportunityId = '0060C000003aLagQAE';

    it('should return OpportunityLineItem by opportunity id', async () => {
      const getByOpportunityIdData = {
        Id: '0070C000002fDqdDFR',
      };

      const getByOpportunityIdStub = await sandbox
        .stub(models.OpportunityLineItem, 'getByOpportunityId')
        .resolves(getByOpportunityIdData);

      const result = await service.getByOpportunityId(opportunityId);

      sandbox.assert.calledOnceWithExactly(getByOpportunityIdStub, opportunityId);
      assert.deepStrictEqual(result, getByOpportunityIdData);
    });

    it('should throw Not found error', async () => {
      const getByOpportunityIdStub = await sandbox
        .stub(models.OpportunityLineItem, 'getByOpportunityId')
        .resolves(null);

      await assert.rejects(service.getByOpportunityId(opportunityId), {
        name: 'NotFoundError',
      });

      sandbox.assert.calledOnceWithExactly(getByOpportunityIdStub, opportunityId);
    });
  });

  describe('Get All OpportunityLineItems by opportunity ID', () => {
    const opportunityId = '0060C000003aLagQAE';

    it('should return OpportunityLineItem by opportunity id', async () => {
      const getByOpportunityIdData = {
        Id: '0070C000002fDqdDFR',
      };

      const getByOpportunityIdStub = await sandbox
        .stub(models.OpportunityLineItem, 'getAllByOpportunityId')
        .resolves(getByOpportunityIdData);

      const result = await service.getAllByOpportunityId(opportunityId);

      sandbox.assert.calledOnceWithExactly(getByOpportunityIdStub, opportunityId);
      assert.deepStrictEqual(result, getByOpportunityIdData);
    });
  });
});
