# Deployment and installation
With this configuration, you can use the ent cli (https://dev.entando.org/next/docs/reference/entando-cli.html) to perform the full deployment sequence:

# Development notes
## Tips
* Check for the "CHANGE-IT" placeholders, replace it with your chosen docker image key

### Setup the project directory.
1. Prepare the bundle directory: `cp -r bundle_src bundle`
2. Initialize the project: `ent prj init`
3. Initialize publication: `ent prj pbs-init` (requires the git bundle repo url)
4. Attach to kubernetes for an Entando application via ent attach-kubeconfig config-file or similar

### Publish the bundle.
1. Build FE: ent prj fe-build -a
2. Build and publish BE: ./prepareDockerImage.sh
3. Publish FE: `ent prj fe-push` , no need to use this command
    `ent prj pbs-publish` need to use this command
4. Deploy (after connecting to k8s above): `ent prj deploy`
5. Install the bundle via 1) App Builder, 2) `ent prj install`, or 3) `ent prj install --conflict-strategy=OVERRIDE` on subsequent installs.
6. Iterate steps 1-4 to publish new versions.

## Local testing of the project
You can use the following commands from the application folder to run the local stack
* `ent prj xk start` - or stop to shutdown keycloak again.
* `cd src/main/node/` and `npm i && npm start` - to run the microservice
* `ent prj fe-test-run` - to run the React frontend

## Local setup
* Access Keycloak at http://localhost:9080/auth/
* Access Springboot at http://localhost:8081/swagger-ui.html
* Use client web_app when authorizing the microservices

## Notes
* Two users are included in the keycloak realm config
    * test-user/test-user - regular user with no role provided (receive 403 on api call)
    * et-first-role/et-first-role - can access the api (role internal/mf-widget-admin)
