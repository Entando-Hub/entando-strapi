'use strict';
module.exports = {
  routes: [
    {
      method: "GET",
      path: "/health",
      handler: "health-check.health",
      config: {
        auth: false,
        // middlewares: [restrictAccess]
      }
    },
  ]
};