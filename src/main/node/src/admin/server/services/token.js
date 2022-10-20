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
// Decode token and verify it
const decodeJwtKCToken = token => {

  let authServerUrl = process.env.KEYCLOAK_AUTH_URL;
  if (!authServerUrl) {
    throw new Error('Keycloak URL not configured');
  }
  // Removing the context path from the URL
  authServerUrl = authServerUrl.substring(0, authServerUrl.lastIndexOf('/'));

  const kcConfig = {
    realm: '',
    authServerUrl
  }

  var decoded = jwt_decode(token);
  if (decoded) {
    const iss = decoded.iss;
    if (iss) {
      const splitUrl = iss.split('/');
      const realm = splitUrl[splitUrl.length - 1];
      kcConfig.realm = realm;
    }
  }
  const keycloak = Keycloak(kcConfig);
  return keycloak.verifyOnline(token);
};

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
  checkSecretIsDefined,
};
