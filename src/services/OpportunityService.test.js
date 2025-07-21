const assert = require('assert').strict;
const sinon = require('sinon');
const { orderStatus, recordTypes, stageNames, residentialOrBusinessFields, orderTypes } = require('../constants');

const sandbox = sinon.createSandbox();

const OpportunityService = require('./OpportunityService');

const models = {
  Opportunity: {
    create: async () => {},
    updateById: async () => {},
    getById: async () => {},
    getByOrderStatus: async () => {},
  },
};

const service = new OpportunityService({ models });

describe('Opportunity service', () => {
  afterEach(() => {
    sandbox.restore();
  });

  describe('Create opportunity', () => {
    const opportunityData = {
      opportunityName: 'some opp name',
      partnerId: 'D3E1C2A3a5a6FaFa8a9a76a3',
      recordType: recordTypes.WHOLESALE_OPPORTUNITY,
      closeDate: new Date().toISOString().split('T')[0],
      residentialOrBusiness: residentialOrBusinessFields.RESIDENTIAL,
      stageName: stageNames.PROGRESSING,
      contactId: 'adf786adf5a78df5aQ',
      type: orderTypes.NEW_BUSINESS,
    };

    it('should create opportunity', async () => {
      const createOpportunityResult = { id: '0060C0000036BiQQAU', success: true, errors: [] };

      const createOpportunityStub = await sandbox.stub(models.Opportunity, 'create').resolves(createOpportunityResult);
      const getByIdStub = await sandbox.stub(models.Opportunity, 'getById').resolves({ External_ID__c: '123' });

      const result = await service.create(opportunityData);

      sandbox.assert.calledWith(createOpportunityStub, opportunityData);
      sandbox.assert.calledWith(getByIdStub, createOpportunityResult.id);
      assert.deepStrictEqual(result, {
        ...createOpportunityResult,
        externalOpportunityUUID: '123',
      });
    });

    it('should throw Internal error', async () => {
      const createOpportunityResult = { success: false, errors: ['some error'] };

      const createOpportunityStub = await sandbox.stub(models.Opportunity, 'create').resolves(createOpportunityResult);
      await assert.rejects(service.create(opportunityData), {
        name: 'InternalError',
      });

      sandbox.assert.calledOnceWithExactly(createOpportunityStub, opportunityData);
    });
  });

  describe('Update opportunity', () => {
    const opportunityId = '0060C0000036BiQQAU';
    const dataToUpdate = {
      StageName: stageNames.CLOSED_WON,
    };

    it('should update opportunity by ID', async () => {
      const updateOpportunityResult = { id: '0060C0000036BiQQAU', success: true, errors: [] };

      const updateOpportunityStub = await sandbox
        .stub(models.Opportunity, 'updateById')
        .resolves(updateOpportunityResult);

      const result = await service.updateById(opportunityId, dataToUpdate);

      sandbox.assert.calledOnceWithExactly(updateOpportunityStub, {
        Id: opportunityId,
        ...dataToUpdate,
      });
      assert.deepStrictEqual(result, updateOpportunityResult);
    });

    it('should throw Internal error', async () => {
      const updateOpportunityResult = { success: false, errors: ['some error'] };

      const updateOpportunityStub = await sandbox
        .stub(models.Opportunity, 'updateById')
        .resolves(updateOpportunityResult);

      await assert.rejects(service.updateById(opportunityId, dataToUpdate), {
        name: 'InternalError',
      });

      sandbox.assert.calledOnceWithExactly(updateOpportunityStub, {
        Id: opportunityId,
        ...dataToUpdate,
      });
    });
  });

  describe('Get opportunity by order status', () => {
    const relatedOrderStatus = orderStatus.LIVE;
    const partnerId = 'D3E1C2A3a5a6FaFa8a9a76a3';
    const serviceId = 'S-00000009';

    it('should return opportunity by related order status, serviceId & partnerId', async () => {
      const getByOrderStatusData = {
        attributes: {
          type: 'Opportunity',
          url: '/services/data/v42.0/sobjects/Opportunity/0060C000003aKA8QAM',
        },
        Id: '0060C000003aKA8QAM',
      };

      const getByOrderStatusStub = await sandbox
        .stub(models.Opportunity, 'getByOrderStatus')
        .resolves(getByOrderStatusData);

      const result = await service.getByOrderStatus(relatedOrderStatus, partnerId, serviceId);

      sandbox.assert.calledOnceWithExactly(getByOrderStatusStub, relatedOrderStatus, partnerId, serviceId);
      assert.deepStrictEqual(result, getByOrderStatusData);
    });

    it('should throw Not found error', async () => {
      const getByOrderStatusStub = await sandbox.stub(models.Opportunity, 'getByOrderStatus').resolves(null);

      await assert.rejects(service.getByOrderStatus(relatedOrderStatus, partnerId, serviceId), {
        name: 'NotFoundError',
      });

      sandbox.assert.calledOnceWithExactly(getByOrderStatusStub, relatedOrderStatus, partnerId, serviceId);
    });
  });

  describe('Get opportunity by ID', () => {
    const opportunityId = '0060C000003aLagQAE';

    it('should return opportunity by id', async () => {
      const getByIdData = {
        attributes: {
          type: 'Opportunity',
          url: '/services/data/v42.0/sobjects/Opportunity/0060C000003aLagQAE',
        },
        Loss_Reason__c: null,
        Type: 'New Business',
        End_User_Contact__c: '0030C0000070J7DQAU',
        End_User_Contact__r: {
          attributes: {
            type: 'Contact',
            url: '/services/data/v42.0/sobjects/Contact/0030C0000070J7DQAU',
          },
          FirstName: 'Third',
          LastName: 'Test',
          Phone: '+923130000444',
          Email: 'thirdtest@gmail.com',
        },
        UPRN__c: 787,
      };

      const getByIdStub = await sandbox.stub(models.Opportunity, 'getById').resolves(getByIdData);

      const result = await service.getById(opportunityId);

      sandbox.assert.calledOnce(getByIdStub);
      sandbox.assert.calledOnceWithExactly(getByIdStub, opportunityId);
      assert.deepStrictEqual(result, getByIdData);
    });

    it('should throw Not found error', async () => {
      const getByIdStub = await sandbox.stub(models.Opportunity, 'getById').resolves(null);

      await assert.rejects(service.getById(opportunityId), {
        name: 'NotFoundError',
      });

      sandbox.assert.calledOnceWithExactly(getByIdStub, opportunityId);
    });
  });
});
