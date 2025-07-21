const supertest = require('supertest');
const sinon = require('sinon');
const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');
const { Logger } = require('@g-network/service-chassis/src/lib/Logger');
const homedir = require('os').homedir();

const sandbox = sinon.createSandbox();

AWS.config.update({ region: 'eu-west-2' });
const ssm = new AWS.SSM();

const host = 'localhost';
const port = 3000;
const serviceURI = `http://${host}:${port}`;
let server = null;

process.env.SERVICE_NAME = 'integration-test';
function isAWSConfigured() {
  const joined = path.join(homedir, '.aws/credentials');
  return fs.existsSync(joined) || (process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_SECRET_ACCESS_KEY);
}

function getParameterFromSystemManager(param) {
  return new Promise((succ, fail) => {
    const params = {
      Name: param,
      /* required */
      WithDecryption: true,
    };
    ssm.getParameter(params, (err, data) => {
      if (err) {
        // an error occurred
        fail(err);
      } else {
        // successful response
        succ(data.Parameter.Value);
      }
    });
  });
}

async function readParameters() {
  process.env.PROPERTY_SERVICE_URL = await getParameterFromSystemManager('/kraken/dev/property_service_uri');
  process.env.PRODUCT_SERVICE_URL = await getParameterFromSystemManager('/develop/common/product_service_uri');
  process.env.APPOINTMENT_SERVICE_URL = await getParameterFromSystemManager('/kraken/dev/appointment_service_uri');
  process.env.SALESFORCE_URL = await getParameterFromSystemManager('/dev/loginUrl');
  process.env.SALESFORCE_USERNAME = await getParameterFromSystemManager('/dev/new_username');
  process.env.SALESFORCE_PASSWORD = await getParameterFromSystemManager('/dev/new_password');
}

if (isAWSConfigured()) {
  describe('Orders Service', () => {
    before(async function before() {
      // not always working, this is why parameter was added in package.json
      this.timeout(40000);

      await readParameters();

      // eslint-disable-next-line global-require
      const application = require('../src');

      sandbox.stub(Logger.prototype, 'info');

      server = application.app.listen(port, host);
      await Promise.all(application.initializers.map((f) => f()));
    });

    after(async function after() {
      server.close();
    });

    it('should get orders', async () => {
      await supertest(serviceURI).get('/order?pageSize=1&pageNum=1').send({}).expect(200);
    });

    it('should get one order', async () => {
      await supertest(serviceURI).get('/order/74a01c72-7718-4c53-a24a-35c19cb675e3').send({}).expect(200);
      await new Promise((succ) => {
        setTimeout(succ, 3000);
      });
    });
  });
}
