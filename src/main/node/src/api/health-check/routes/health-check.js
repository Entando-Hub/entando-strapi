'use strict';
module.exports = {
  routes: [
    {
      method: "GET",
      path: "/actuator/health",
      handler: "health-check.health",
      config: {
        auth: false,
        // middlewares: [restrictAccess]
      }
    },
  ]
};