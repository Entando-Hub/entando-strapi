## 📚 Setup and run this customized strapi project on local
- Clone this project
```
git clone https://github.com/Entando-Hub/entando-strapi.git
```
- Install the dependencies
```
~/entando-strapi/src/main/node$ npm install
```
- Go to ~/entando-strapi/src/main/node/src and rename admin folder to admin_

- Build the project
```
~/entando-strapi/src/main/node$ npm run build
```
- Go to ~/entando-strapi/src/main/node/src and rename admin_ folder to admin
- Go to ~/entando-strapi/src/main/node/src/admin and install the dependencies
```
~/entando-strapi/src/main/node/src/admin$ npm install
```
- Go to ~/entando-strapi/src/main/node/node_modules/@strapi/strapi/lib/core/loaders/admin.js and comment this line: node_modules/@strapi/strapi/lib/core/loaders/admin.js
```
 // strapi.admin = require('@strapi/admin/strapi-server'); //Comment this line
  strapi.admin = require('../../../../../../src/admin/strapi-server'); //Add this line
```
- Run the project
```
~/entando-strapi/src/main/node$ npm run develop
```

# Development notes
## Tips
* Check for the "CHANGE-IT" placeholders, replace it with your chosen docker image key

### Setup the project directory, prepare for bundle, build and publish:
1. Prepare the bundle directory: `cp -r bundle_src bundle`
2. Initialize the project: `ent prj init`
3. Initialize publication: `ent prj pbs-init` (requires the git bundle repo url)
4. Build and publish BE: `./prepareDockerImage.sh`
5. Publish the bundle `ent prj pbs-publish`
6. Deploy (after connecting to k8s above): `ent prj deploy`
7. Install the bundle via 1) App Builder, 2) `ent prj install`, or 3) `ent prj install --conflict-strategy=OVERRIDE` on subsequent installs.
8. Iterate the steps.

## Local testing of the project
You can use the following commands from the application folder to run the local stack
* `cd src/main/node/` and `npm run develop`  - to run the strapi project

## Notes
* Access Strapi APIs(The APIs accessbile to Admin) through Entando Keycloak token:
    `Authorization: EntKcToken <entando-keycloak-token>`
* Need to add the same username on strapi(with Super Admin role) which is present on AppBuilder.
