'use strict';
module.exports = {
  async health(ctx) {
    try {
      ctx.send({ "status": "UP", "groups": ["liveness", "readiness"] });
    } catch (e) {
      strapi.log.error(e);
      ctx.badRequest(null, e.message);
    }
  },
};