'use strict';

/**
 * Jwt.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const _ = require('lodash');
const jwt = require('jsonwebtoken');

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

      if ((parts[0].toLowerCase() !== 'bearer' && parts[0].toLowerCase() !== 'entkctoken') || parts.length !== 2) {
        return null;
      }

      token = parts[1];
    } else {
      return null;
    }

    if (parts[0].toLowerCase() === 'entkctoken') {
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

  const kcConfigObj = {
    realm: '',
    authServerUrl: ''
  }

  var decoded = jwt_decode(token);
  if (decoded) {
    const iss = decoded.iss;
    if (iss) {
      const splitUrl = iss.split('/');
      const realm = splitUrl[splitUrl.length - 1];

      let index = findNthOccur(iss, '/', 3);
      let url = iss.substr(0, index);

      kcConfigObj.realm = realm;
      kcConfigObj.authServerUrl = url;
    }
  }
  const config = { realm: kcConfigObj.realm, authServerUrl: kcConfigObj.authServerUrl };
  const keycloak = Keycloak(config);
  return keycloak.verifyOnline(token);
};

const findNthOccur = (str, ch, N) => {
  var occur = 0;
  // Loop to find the Nth occurrence of the character
  for (var i = 0; i < str.length; i++) {
    if (str[i] == ch) {
      occur += 1;
    }
    if (occur == N)
      return i;
  }
  return -1;
}
