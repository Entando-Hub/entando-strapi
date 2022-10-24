'use strict';

const initApiAdminUser = require('./init-api-admin-user');

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    let authServerUrl = process.env.KEYCLOAK_AUTH_URL;
    if (!authServerUrl) {
      throw new Error('Keycloak URL not configured');
    }
    // Removing the context path from the URL
    authServerUrl = authServerUrl.substring(0, authServerUrl.lastIndexOf('/'));
    strapi.config.set('entando.auth.server.url', authServerUrl);

    const authRealm = process.env.KEYCLOAK_REALM;
    if (!authRealm) {
      throw new Error('Keycloak realm not configured');
    }
    strapi.config.set('entando.auth.realm', authRealm);
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    await initApiAdminUser(strapi);
  },
};
