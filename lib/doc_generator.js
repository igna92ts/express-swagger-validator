const fs = require('fs');
let spec = require('./swagger_schema');

const writeSchema = mySpec => {
  fs.writeFile('./generated_spec.json', JSON.stringify(mySpec, 0, 2), err => {
    if (err) {
      return console.log(err);
    } else return console.log('The file was saved!');
  });
};

const parseParam = (key, subParamsObj) => {
  const required = subParamsObj.required || [];
  const subParams = subParamsObj.properties;
  const paramNames = Object.keys(subParams);
  return paramNames.map(name => {
    return {
      name,
      in: key,
      required: required.some(e => e === name),
      schema: subParams[name]
    };
  });
};

const parseSwaggerRoute = (path, routeObj) => {
  const methods = Object.keys(routeObj);
  const swaggerPath = methods.reduce((res, method) => {
    const { params } = routeObj[method];
    return {
      ...res,
      [method.toLowerCase()]: {
        parameters: Object.keys(params).reduce((r, key) => [...r, ...parseParam(key, params[key])], [])
      }
    };
  }, {});
  return { [path]: swaggerPath };
};

const getHandler = routeSchemas => {
  return {
    apply: (target, thisArg, args) => {
      const paths = Object.keys(routeSchemas);
      const swaggerPaths = paths.reduce((res, p) => {
        return {
          ...res,
          ...parseSwaggerRoute(p, routeSchemas[p])
        };
      }, {});
      spec = { ...spec, paths: { ...spec.paths, swaggerPaths } };
      writeSchema(spec);
      return target.call(thisArg, ...args);
    }
  };
};

const setDocGenerator = (app, routeSchemas) => {
  app.listen = new Proxy(app.listen, getHandler(routeSchemas));
  app.use('/swagger-docs', (req, res) => res.send(JSON.stringify(spec, 0, 2)));
};

module.exports = setDocGenerator;