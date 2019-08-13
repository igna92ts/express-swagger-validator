const Ajv = require('ajv'),
  ajv = new Ajv({ allErrors: true, coerceTypes: 'number', v5: true }),
  setDocGenerator = require('./doc_generator'),
  routeChecks = require('./checker'),
  { supportedSchemaKeys, supportedHTTPMethods } = require('./constants');

const routeSchemas = {};

const baseSchema = schema => {
  Object.keys(schema).forEach(k => {
    if (!supportedSchemaKeys.some(sk => sk === k)) {
      throw new Error(`use of unsupported key ${k} in schema`);
    }
  });
  return {
    type: 'object',
    required: Object.keys(schema),
    properties: {
      ...schema
    }
  };
};

const addSchema = (method, route, schema) => {
  if (!supportedHTTPMethods.some(s => s === method)) {
    throw new Error(`Unsupported method ${method}`);
  }
  if (schema === {}) {
    throw new Error('Schema cant be empty');
  }
  if (!routeSchemas[route]) routeSchemas[route] = {};
  if (routeSchemas[route][method]) {
    throw new Error(`There is already an schema set for path ${route} and method ${method}`);
  }
  routeSchemas[route][method] = {
    schema: ajv.compile(baseSchema(schema)),
    params: schema
  };
};

const middlewareFunction = (req, res, next) => {
  if (!routeSchemas[req.path] || !routeSchemas[req.path][req.method]) {
    throw new Error(`No schema for path ${req.path} on method ${req.method}`);
  }
  const { schema } = routeSchemas[req.path][req.method];
  const valid = schema(req);
  if (valid) next();
  else {
    res.status(400).send(ajv.errorsText(schema.errors));
  }
};

const middleware = app => {
  if (app._router) {
    app._router.stack.forEach(r => {
      if (r.route && r.route.path) {
        throw new Error('This middleware needs to be added before setting any routes');
      }
    });
  }
  routeChecks(app, routeSchemas);
  setDocGenerator(app, routeSchemas);
  return middlewareFunction;
};

module.exports = { addSchema, middleware };
