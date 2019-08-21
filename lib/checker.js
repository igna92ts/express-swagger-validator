const { supportedHTTPMethods } = require('./constants');
const { throwError, noRouteWithoutSchema } = require('./errors');

const getHandler = (routeSchemas, method, middlewareFunction) => ({
  apply: (target, thisArg, argList) => {
    if (argList.length === 1) return target.call(thisArg, ...argList);
    const [route] = argList;
    const routes = Object.keys(routeSchemas);
    if (!routes.some(r => r === route) || !routeSchemas[route][method])
      throwError(noRouteWithoutSchema(route, method));

    const [hd, ...tl] = argList;
    return target.call(thisArg, hd, middlewareFunction, ...tl);
  }
});

const setupRouteChecks = (app, middlewareFunction, routeSchemas) => {
  supportedHTTPMethods.forEach(method => {
    const m = method.toLowerCase();
    app[m] = new Proxy(app[m], getHandler(routeSchemas, method, middlewareFunction));
  });
};

module.exports = setupRouteChecks;
