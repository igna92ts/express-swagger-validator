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
  app.get = new Proxy(app.get, getHandler(routeSchemas, 'GET'));
  app.post = new Proxy(app.post, getHandler(routeSchemas, 'POST'));
  app.put = new Proxy(app.put, getHandler(routeSchemas, 'PUT'));
  app.patch = new Proxy(app.patch, getHandler(routeSchemas, 'PATCH'));
  app.delete = new Proxy(app.delete, getHandler(routeSchemas, 'DELETE'));
};

module.exports = setupRouteChecks;
