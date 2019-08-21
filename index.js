const superPackage = require('./lib');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// DEPENDENCIES
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
superPackage.setupMiddlewares(app);
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

superPackage.addSchema('GET', '/users/algo/:id', {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'number' }
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

app.get('/users/algo', (req, res) => res.send('bla'));
app.get('/users/algo/:id', (req, res) => res.send(req.params));
app.post('/users/algo', (req, res) => res.send('bla'));
app.listen(3000, () => console.log('listening at port 3000'));
