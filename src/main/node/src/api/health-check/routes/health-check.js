'use strict';
module.exports = {
  routes: [
    {
      method: "GET",
      path: process.env.SERVER_SERVLET_CONTEXT_PATH + "/actuator/health",
      handler: "health-check.health",
      config: {
        auth: false,
        // middlewares: [restrictAccess]
      }
    },
  ]
};