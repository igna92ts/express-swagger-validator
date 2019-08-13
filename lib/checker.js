const { supportedHTTPMethods } = require('./constants');

const throwError = (method, route) => {
  const str = `Cant set route ${route} for method ${method} without creating a schema first`;
  throw new Error(str);
};

const getHandler = (routeSchemas, method) => {
  return {
    apply: (target, thisArg, argList) => {
      if (argList.length === 1) return target.call(thisArg, ...argList);
      const [route] = argList;
      const routes = Object.keys(routeSchemas);
      if (!routes.some(r => r === route) || !routeSchemas[route][method]) {
        return throwError(method, route);
      } else {
        return target.call(thisArg, ...argList);
      }
    }
  };
};

const setupRouteChecks = (app, routeSchemas) => {
  supportedHTTPMethods.forEach(method => {
    app[method.toLowerCase()] = new Proxy(app.get, getHandler(routeSchemas, method));
  });
};

module.exports = setupRouteChecks;
