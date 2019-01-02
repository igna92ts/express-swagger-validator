const express = require('express'),
  cors = require('cors'),
  app = express();

const bodyParser = require('body-parser');

const superPackage = require('./lib');

const DEFAULT_BODY_SIZE_LIMIT = 1024 * 1024 * 10,
  DEFAULT_PARAMETER_LIMIT = 10000;

const bodyParserJsonConfig = () => ({
  parameterLimit: DEFAULT_PARAMETER_LIMIT,
  limit: DEFAULT_BODY_SIZE_LIMIT
});
const bodyParserUrlencodedConfig = () => ({
  extended: true,
  parameterLimit: DEFAULT_PARAMETER_LIMIT,
  limit: DEFAULT_BODY_SIZE_LIMIT
});
const controllerFoo = (req, res, next) => {
  res.send('ok');
};

// DEPENDENCIES
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(superPackage.middleware(app));
// DEPENDENCIES

superPackage.addSchema('GET', '/users/algo', {
  query: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string' }
    }
  }
});

superPackage.addSchema('POST', '/users/algo', {
  body: {
    type: 'object',
    required: ['age'],
    properties: {
      age: { type: 'number' }
    }
  },
  headers: {
    type: 'object',
    required: ['myheader'],
    properties: {
      myheader: { type: 'string' }
    }
  }
});

app.get('/users/algo', (req, res, next) => res.send('bla'));
app.post('/users/algo', (req, res, next) => res.send('bla'));
app.listen(3000, () => console.log('listening at port 3000'));
