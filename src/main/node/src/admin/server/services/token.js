'use strict';

const crypto = require('crypto');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

// For Keycloak token
const Keycloak = require("keycloak-verify").default;
require("regenerator-runtime");
const jwt_decode = require('jwt-decode');

const defaultJwtOptions = { expiresIn: '30d' };

const getTokenOptions = () => {
  const { options, secret } = strapi.config.get('admin.auth', {});

  return {
    secret,
    options: _.merge(defaultJwtOptions, options),
  };
};

/**
 * Create a random token
 * @returns {string}
 */
const createToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

/**
 * Creates a JWT token for an administration user
 * @param {object} user - admin user
 */
const createJwtToken = user => {
  const { options, secret } = getTokenOptions();

  return jwt.sign({ id: user.id }, secret, options);
};

/**
 * Tries to decode a token an return its payload and if it is valid
 * @param {string} token - a token to decode
 * @return {Object} decodeInfo - the decoded info
 */
const decodeJwtToken = token => {
  const { secret } = getTokenOptions();

  try {
    const payload = jwt.verify(token, secret);
    return { payload, isValid: true };
  } catch (err) {
    return { payload: null, isValid: false };
  }
};

/**
 * For keycloak token
 * @param {*} token 
 * @returns 
 */
// const decodeJwtKCToken_ = token => {
//   const kcConfigObj = { realm: 'entando', authServerUrl: 'http://20.79.198.96.nip.io' };
//   const keycloak = Keycloak(kcConfigObj);
//   return keycloak.verifyOnline(token);
// };

// Decode token and verify it
const decodeJwtKCToken = token => {

  const kcConfigObj = {
    realm: '',
    authServerUrl: ''
  }

  var decoded = jwt_decode(token);
  console.log('decoded: ', decoded);
  if (decoded) {
    const iss = decoded.iss;
    console.log('iss: ', iss);
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

/**
 * @returns {void}
 */
const checkSecretIsDefined = () => {
  if (strapi.config.serveAdminPanel && !strapi.config.get('admin.auth.secret')) {
    throw new Error(
      `Missing auth.secret. Please set auth.secret in config/admin.js (ex: you can generate one using Node with \`crypto.randomBytes(16).toString('base64')\`).
For security reasons, prefer storing the secret in an environment variable and read it in config/admin.js. See https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.html#configuration-using-environment-variables.`
    );
  }
};

module.exports = {
  createToken,
  createJwtToken,
  getTokenOptions,
  decodeJwtToken,
  decodeJwtKCToken,
  findNthOccur,
  checkSecretIsDefined,
};
