'use strict';

/**
 * Jwt.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const _ = require('lodash');
const jwt = require('jsonwebtoken');

const ENT_KC_TOKEN = 'entkctoken'

// For Keycloak token
const Keycloak = require("keycloak-verify").default;
require("regenerator-runtime");
const jwt_decode = require('jwt-decode');

module.exports = ({ strapi }) => ({
  getToken(ctx) {
    let token;

    let parts;
    if (ctx.request && ctx.request.header && ctx.request.header.authorization) {
      parts = ctx.request.header.authorization.split(/\s+/);

      if ((parts[0].toLowerCase() !== 'bearer' && parts[0].toLowerCase() !== ENT_KC_TOKEN) || parts.length !== 2) {
        return null;
      }

      token = parts[1];
    } else {
      return null;
    }

    if (parts[0].toLowerCase() === ENT_KC_TOKEN) {
      return this.verifyKcToken(token);
    } else {
      return this.verify(token);
    }
  },

  issue(payload, jwtOptions = {}) {
    _.defaults(jwtOptions, strapi.config.get('plugin.users-permissions.jwt'));
    return jwt.sign(
      _.clone(payload.toJSON ? payload.toJSON() : payload),
      strapi.config.get('plugin.users-permissions.jwtSecret'),
      jwtOptions
    );
  },

  verify(token) {
    return new Promise(function(resolve, reject) {
      jwt.verify(token, strapi.config.get('plugin.users-permissions.jwtSecret'), {}, function(
        err,
        tokenPayload = {}
      ) {
        if (err) {
          return reject(new Error('Invalid token.'));
        }
        resolve(tokenPayload);
      });
    });
  },

  async verifyKcToken(token) {
    try {
      const res = await decodeJwtKCToken(token);
      const user = await strapi
        .query('plugin::users-permissions.user')
        .findOne({ where: { username: res.userName }, populate: ['roles'] });
      return user;
    } catch(err) {
      return { id: null };
    }
  }
});

const decodeJwtKCToken = token => {
  const authServerUrl = strapi.config.get('entando.auth.server.url');
  const realm = strapi.config.get('entando.auth.realm');

  const kcConfig = {
    realm,
    authServerUrl
  }

  const keycloak = Keycloak(kcConfig);
  return keycloak.verifyOnline(token);
};
