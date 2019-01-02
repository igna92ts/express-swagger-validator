const fs = require('fs'),
  spec = require('./swagger_schema');

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
    apply: (target, thisArg, argList) => {
      const paths = Object.keys(routeSchemas);
      const swaggerPaths = paths.reduce((res, p) => {
        return {
          ...res,
          ...parseSwaggerRoute(p, routeSchemas[p])
        };
      }, {});
      writeSchema({ ...spec, paths: swaggerPaths });
      return target.call(thisArg, ...argList);
    }
  };
};

const setDocGenerator = (app, routeSchemas) => {
  app.listen = new Proxy(app.listen, getHandler(routeSchemas));
};

module.exports = setDocGenerator;
