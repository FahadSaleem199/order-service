const util = require('util');
const exec = util.promisify(require('child_process').exec);
/* eslint-disable no-console */
const application = require('./src');

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;

async function getServerlessConfig() {
  const { stdout, stderr } = await exec('serverless print --format json');

  if (stderr && stderr.toLowerCase().indexOf('debugger') < 0) {
    console.log(stderr);
    throw new Error('Serverless print error');
  }

  try {
    const jsonStart = stdout.indexOf('\n{');
    const json = jsonStart < 0 ? stdout : stdout.slice(jsonStart);
    return JSON.parse(json);
  } catch (err) {
    console.log(stdout);
    throw new Error(err);
  }
}

async function init() {
  const { functions } = await getServerlessConfig();

  // initialize application
  await Promise.all(application.initializers.map((f) => f()));

  application.app.listen(port, host);

  const events = Object.keys(functions).filter((name) => name !== 'api');
  const snsEvents = events.filter((name) => functions[name].events.some((e) => e.sns));

  snsEvents.forEach((eventName) => {
    application.endpoint('POST', `/events/sns/${eventName}`, [
      async function handler({ request, response }) {
        try {
          await application[eventName]({
            Records: [{ Sns: { Message: JSON.stringify(request.body) } }],
          });
          response.status = 200;
        } catch (err) {
          console.log(`Error in ${eventName}`, err);
          response.status = 500;
        }
      },
    ]);
  });

  // Needed to expose correct local URL to the developer
  console.log(`Application has started on http://${host}:${port}.`);
}

init().catch((err) => console.log(err));
