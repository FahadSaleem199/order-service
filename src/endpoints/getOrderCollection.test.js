const sinon = require('sinon');
const assert = require('assert').strict;
const [validator, handle] = require('./getOrderCollection');

const sandbox = sinon.createSandbox();

const endpoint = (ctx) => validator(ctx, () => handle(ctx));

const services = {
  order: {
    getOrderCollection: () => {},
  },
};

describe('Get Order Collection Endpoint', () => {
  const testEndpoint = async (params, errorType, details) => {
    await assert.rejects(endpoint(params), (err) => {
      assert.equal(err.name, errorType);
      assert.deepEqual(err.details, details);
      return true;
    });
  };

  afterEach(() => {
    sandbox.restore();
  });
  it('Should get the list of orders successfully.', async () => {
    const query = {
      pageNum: 1,
      pageSize: 3,
    };

    const records = [
      {
        attributes: {
          type: 'Order',
          url: '/services/data/v42.0/sobjects/Order/8010C000000SqjSQAS',
        },
        AccountId: '0010C000009d64CQAQ',
        External_ID__c: 'ac420442-1248-4409-bf3a-7ce77d9610f1',
        EffectiveDate: '2019-11-24',
        Status: 'Draft',
        Related_Opportunity__c: '0060C000003aLceQAE',
        Id: '8010C000000SqjSQAS',
        ServiceId__c: 'S-00000001',
        Date_Time_survey_booked__c: null,
        Survey_Booked_Delay_Reason__c: null,
        Date_Survey_Completed__c: null,
        Survey_Completed_Delay_Reason__c: null,
        Date_Wayleave_Agreement_Sent__c: null,
        Wayleave_sent_to_Lawyer_Delay_Reason__c: null,
        Date_Lawyer_Signed_off_Wayleave__c: null,
        Lawyer_signed_off_wayleave_Delay_Reason__c: null,
        Date_Pack_Generated__c: null,
        Date_Pack_Sent_to_Lawyer__c: null,
        Install_Booked_Delay_Reason__c: null,
        Installation_Date__c: '2020-04-20',
        ActivatedDate: '2020-04-20',
        Related_Opportunity__r: {
          attributes: {
            type: 'Opportunity',
            url: '/services/data/v42.0/sobjects/Opportunity/0060C000003aLceQAE',
          },
          Type: 'New Business',
          End_User_Contact__r: {
            attributes: {
              type: 'Contact',
              url: '/services/data/v42.0/sobjects/Contact/0030C000008uKYbQAM',
            },
            FirstName: 'Amir Alpha',
            LastName: 'Omega',
            Salutation: 'Mr.',
            Suffix: null,
            Phone: '07777 777777',
            Email: 'robmacgregor@g.network',
          },
          UPRN__c: 777,
          F__c: null,
          S__c: null,
          P__c: null,
          S_Tag__c: null,
          C_Tag__c: null,
          Service_Port__c: null,
          ONT_ID__c: null,
          ONT_Serial_No__c: null,
          Street_Unit_Wholesale__c: null,
          Cabinet_Name__c: null,
          OLT_Port__c: null,
        },
        CreatedBy: {
          attributes: {
            type: 'User',
            url: '/services/data/v42.0/sobjects/User/0052600000541qGAAQ',
          },
          Name: 'GNetworks API User',
        },
        CreatedDate: '2020-06-11T12:52:39.000+0000',
        LastModifiedBy: {
          attributes: {
            type: 'User',
            url: '/services/data/v42.0/sobjects/User/0052600000541qGAAQ',
          },
          Name: 'GNetworks API User',
        },
        LastModifiedDate: '2020-06-18T11:27:58.000+0000',
      },
      {
        attributes: {
          type: 'Order',
          url: '/services/data/v42.0/sobjects/Order/8010C000000SqjSQAS',
        },
        AccountId: '0010C000009d64CQAQ',
        External_ID__c: 'ac420442-1248-4409-bf3a-7ce77d9610f1',
        EffectiveDate: '2019-11-24',
        Status: 'Draft',
        Related_Opportunity__c: '0060C000003aLceQAE',
        Id: '8010C000000SqjSQAS',
        ServiceId__c: 'S-00000001',
        Date_Time_survey_booked__c: null,
        Survey_Booked_Delay_Reason__c: null,
        Date_Survey_Completed__c: null,
        Survey_Completed_Delay_Reason__c: null,
        Date_Wayleave_Agreement_Sent__c: null,
        Wayleave_sent_to_Lawyer_Delay_Reason__c: null,
        Date_Lawyer_Signed_off_Wayleave__c: null,
        Lawyer_signed_off_wayleave_Delay_Reason__c: null,
        Date_Pack_Generated__c: null,
        Date_Pack_Sent_to_Lawyer__c: null,
        Install_Booked_Delay_Reason__c: null,
        Installation_Date__c: '2020-04-20',
        ActivatedDate: '2020-04-20',
        Related_Opportunity__r: {
          attributes: {
            type: 'Opportunity',
            url: '/services/data/v42.0/sobjects/Opportunity/0060C000003aLceQAE',
          },
          Type: 'New Business',
          End_User_Contact__r: {
            attributes: {
              type: 'Contact',
              url: '/services/data/v42.0/sobjects/Contact/0030C000008uKYbQAM',
            },
            FirstName: 'Amir Alpha',
            LastName: 'Omega',
            Salutation: 'Mr.',
            Suffix: null,
            Phone: '07777 777777',
            Email: 'robmacgregor@g.network',
          },
          UPRN__c: 777,
          F__c: 8,
          S__c: 12,
          P__c: 3,
          S_Tag__c: 3001,
          C_Tag__c: 4,
          Service_Port__c: 302,
          ONT_ID__c: 123,
          ONT_Serial_No__c: 'SRG457-35SGFHR-45DF',
          Street_Unit_Wholesale__c: 'TestStreet 1',
        },
        CreatedBy: {
          attributes: {
            type: 'User',
            url: '/services/data/v42.0/sobjects/User/0052600000541qGAAQ',
          },
          Name: 'GNetworks API User',
        },
        CreatedDate: '2020-06-11T12:52:39.000+0000',
        LastModifiedBy: {
          attributes: {
            type: 'User',
            url: '/services/data/v42.0/sobjects/User/0052600000541qGAAQ',
          },
          Name: 'GNetworks API User',
        },
        LastModifiedDate: '2020-06-18T11:27:58.000+0000',
      },
    ];

    const response = [
      {
        orderNumber: 'fe28aa3b-0b15-46d2-8a74-ce9e52d69397',
        orderDate: '2020-03-10',
        orderStatus: 'Draft',
        property: {
          address_line_1: 'dummy add 1',
          address_line_2: 'dummy add 2',
          address_line_3: 'dummy add 3',
        },
        products: [
          {
            product: 'dummy_id',
            product_name: 'dummy_name',
            product_type: 'dummy_type',
          },
        ],
        createdBy: 'GNetworks API User',
        createdAt: '2020-06-11T12:52:39.000+0000',
        updatedBy: 'GNetworks API User',
        updatedAt: '2020-06-18T11:27:58.000+0000',
      },
      {
        orderNumber: 'ce1b83a3-6804-43ac-9656-677fb48e2f8a',
        orderDate: '2020-03-06',
        orderStatus: 'Draft',
        property: {
          address_line_1: 'dummy add 1',
          address_line_2: 'dummy add 2',
          address_line_3: 'dummy add 3',
        },
        products: [
          {
            product: 'dummy_id',
            product_name: 'dummy_name',
            product_type: 'dummy_type',
          },
        ],
        createdBy: 'GNetworks API User',
        createdAt: '2020-06-11T12:52:39.000+0000',
        updatedBy: 'GNetworks API User',
        updatedAt: '2020-06-18T11:27:58.000+0000',
      },
    ];
    sandbox.stub(services.order, 'getOrderCollection').resolves(records);

    await endpoint({ response, services, query });

    assert.deepStrictEqual(records.External_ID__c, response.orderNumber);
  });

  it('Should filter list of orders successfully.', async () => {
    const query = {
      pageNum: 1,
      pageSize: 3,
      partnerId: '41e0cd72-2d4b-4022-9f9e-4c3233f5c4d5',
      status: 'Draft',
    };
    const records = [
      {
        attributes: {
          type: 'Order',
          url: '/services/data/v42.0/sobjects/Order/8010C000000SqjSQAS',
        },
        AccountId: 'd3e1c2a3a5a6fafa8a9a76a3',
        External_ID__c: 'ac420442-1248-4409-bf3a-7ce77d9610f1',
        EffectiveDate: '2019-11-24',
        Status: 'Draft',
        Related_Opportunity__c: '0060C000003aLceQAE',
        Id: '8010C000000SqjSQAS',
        ServiceId__c: 'S-00000001',
        Date_Time_survey_booked__c: null,
        Survey_Booked_Delay_Reason__c: null,
        Date_Survey_Completed__c: null,
        Survey_Completed_Delay_Reason__c: null,
        Date_Wayleave_Agreement_Sent__c: null,
        Wayleave_sent_to_Lawyer_Delay_Reason__c: null,
        Date_Lawyer_Signed_off_Wayleave__c: null,
        Lawyer_signed_off_wayleave_Delay_Reason__c: null,
        Date_Pack_Generated__c: null,
        Date_Pack_Sent_to_Lawyer__c: null,
        Install_Booked_Delay_Reason__c: null,
        Installation_Date__c: '2020-04-20',
        ActivatedDate: '2020-04-20',
        Related_Opportunity__r: {
          attributes: {
            type: 'Opportunity',
            url: '/services/data/v42.0/sobjects/Opportunity/0060C000003aLceQAE',
          },
          Type: 'New Business',
          End_User_Contact__r: {
            attributes: {
              type: 'Contact',
              url: '/services/data/v42.0/sobjects/Contact/0030C000008uKYbQAM',
            },
            FirstName: 'Amir Alpha',
            LastName: 'Omega',
            Salutation: 'Mr.',
            Suffix: null,
            Phone: '07777 777777',
            Email: 'robmacgregor@g.network',
          },
          UPRN__c: 777,
          F__c: null,
          S__c: null,
          P__c: null,
          S_Tag__c: null,
          C_Tag__c: null,
          Service_Port__c: null,
          ONT_ID__c: null,
          ONT_Serial_No__c: null,
          Street_Unit_Wholesale__c: null,
          Cabinet_Name__c: null,
          OLT_Port__c: null,
        },
      },
      {
        attributes: {
          type: 'Order',
          url: '/services/data/v42.0/sobjects/Order/8010C000000SqjSQAS',
        },
        AccountId: 'd3e1c2a3a5a6fafa8a9a76a4',
        External_ID__c: 'ac420442-1248-4409-bf3a-7ce77d9610f1',
        EffectiveDate: '2019-11-24',
        Status: 'Draft',
        Related_Opportunity__c: '0060C000003aLceQAE',
        Id: '8010C000000SqjSQAS',
        ServiceId__c: 'S-00000001',
        Date_Time_survey_booked__c: null,
        Survey_Booked_Delay_Reason__c: null,
        Date_Survey_Completed__c: null,
        Survey_Completed_Delay_Reason__c: null,
        Date_Wayleave_Agreement_Sent__c: null,
        Wayleave_sent_to_Lawyer_Delay_Reason__c: null,
        Date_Lawyer_Signed_off_Wayleave__c: null,
        Lawyer_signed_off_wayleave_Delay_Reason__c: null,
        Date_Pack_Generated__c: null,
        Date_Pack_Sent_to_Lawyer__c: null,
        Install_Booked_Delay_Reason__c: null,
        Installation_Date__c: '2020-04-20',
        ActivatedDate: '2020-04-20',
        Related_Opportunity__r: {
          attributes: {
            type: 'Opportunity',
            url: '/services/data/v42.0/sobjects/Opportunity/0060C000003aLceQAE',
          },
          Type: 'New Business',
          End_User_Contact__r: {
            attributes: {
              type: 'Contact',
              url: '/services/data/v42.0/sobjects/Contact/0030C000008uKYbQAM',
            },
            FirstName: 'Amir Alpha',
            LastName: 'Omega',
            Salutation: 'Mr.',
            Suffix: null,
            Phone: '07777 777777',
            Email: 'robmacgregor@g.network',
          },
          UPRN__c: 777,
          F__c: 8,
          S__c: 12,
          P__c: 3,
          S_Tag__c: 3001,
          C_Tag__c: 4,
          Service_Port__c: 302,
          ONT_ID__c: 123,
          ONT_Serial_No__c: 'SRG457-35SGFHR-45DF',
          Street_Unit_Wholesale__c: 'TestStreet 1',
        },
      },
    ];

    const response = [
      {
        orderNumber: 'fe28aa3b-0b15-46d2-8a74-ce9e52d69397',
        orderDate: '2020-03-10',
        orderStatus: 'Draft',
        property: {
          address_line_1: 'dummy add 1',
          address_line_2: 'dummy add 2',
          address_line_3: 'dummy add 3',
        },
        products: [
          {
            product: 'dummy_id',
            product_name: 'dummy_name',
            product_type: 'dummy_type',
          },
        ],
      },
    ];
    sandbox.stub(services.order, 'getOrderCollection').resolves(records);

    await endpoint({ response, services, query });

    assert.deepStrictEqual(records.External_ID__c, response.orderNumber);
  });

  it('should return "required fields must not be empty"', async () => {
    const query = {
      pageSize: '',
      pageNum: '',
    };

    const response = {};
    await assert.rejects(endpoint({ response, services, query }), {
      name: 'ValidationError',
    });
  });

  it('is not given a "pageSize" and should give a validation error', async () => {
    const query = {
      pageSize: '2',
      pageNum: '0',
    };

    const response = {};
    await testEndpoint({ response, services, query }, 'ValidationError', {
      pageNum: '"pageNum" must be a positive number',
    });
  });
});
