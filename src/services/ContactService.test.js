const assert = require('assert').strict;
const sinon = require('sinon');

const sandbox = sinon.createSandbox();

const ContactService = require('./ContactService');

const models = {
  ContactSalesforce: {
    updateById: async () => {},
    getByExternalId: async () => {},
  },
};

const service = new ContactService({ models });

describe('Contact service', () => {
  afterEach(() => {
    sandbox.restore();
  });

  describe('Update contact', () => {
    const contactId = '0060C0000036BiQQAU';
    const dataToUpdate = {
      firstName: 'new asdf',
      lastName: 'new asdf',
      email: 'new_asdf@gmail.com',
    };

    it('should update contact by ID', async () => {
      const updateContactResult = { id: contactId, success: true, errors: [] };

      const updateContactStub = await sandbox
        .stub(models.ContactSalesforce, 'updateById')
        .resolves(updateContactResult);

      const result = await service.updateById(contactId, dataToUpdate);

      sandbox.assert.calledOnceWithExactly(updateContactStub, {
        id: contactId,
        ...dataToUpdate,
      });
      assert.deepStrictEqual(result, updateContactResult);
    });

    it('should throw Internal error', async () => {
      const updateContactResult = { success: false, errors: ['some error'] };

      const updateContactStub = await sandbox
        .stub(models.ContactSalesforce, 'updateById')
        .resolves(updateContactResult);

      await assert.rejects(service.updateById(contactId, dataToUpdate), {
        name: 'InternalError',
      });

      sandbox.assert.calledOnceWithExactly(updateContactStub, {
        id: contactId,
        ...dataToUpdate,
      });
    });
  });

  describe('Get contact by external ID', () => {
    const contactId = '0060C000003aLagQAE';

    it('should return contact by id', async () => {
      const getByIdData = {
        attributes: {
          type: 'Contact',
          url: '/services/data/v42.0/sobjects/Contact/0030C000008vWvrQAE',
        },
        Id: contactId,
        Company_Name__c: null,
        FirstName: 'Dark',
        LastName: 'knight',
        Phone: '07777 777777',
        Email: 'robmacgregor@g.network',
        Street__c: null,
        Building__c: null,
        Flat__c: 'a1Z0C0000062OjSUAU',
        Organisation_Name__c: null,
      };

      const getByIdStub = await sandbox.stub(models.ContactSalesforce, 'getByExternalId').resolves(getByIdData);

      const result = await service.getByExternalId(contactId);

      sandbox.assert.calledOnce(getByIdStub);
      sandbox.assert.calledOnceWithExactly(getByIdStub, contactId);
      assert.deepStrictEqual(result, getByIdData);
    });

    it('should throw Not found error', async () => {
      const getByIdStub = await sandbox.stub(models.ContactSalesforce, 'getByExternalId').resolves(null);

      await assert.rejects(service.getByExternalId(contactId), {
        name: 'NotFoundError',
      });

      sandbox.assert.calledOnceWithExactly(getByIdStub, contactId);
    });
  });
});
