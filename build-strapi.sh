#!/bin/sh

npm install
npm install "keycloak-verify@^0.4.0"
npm install "jwt-decode@^3.1.2"

cp src/admin/server/strategies/admin.js "node_modules/@strapi/admin/server/strategies/admin.js"
cp src/admin/server/services/token.js "node_modules/@strapi/admin/server/services/token.js"

rm -Rf src/admin

cp jwt.js "node_modules/@strapi/plugin-users-permissions/server/services/jwt.js"

npm run build
