#!/bin/sh

echo ""
echo "Building project and Docker image "
#todo export as global variable
#todo manage version
# export MY_IMAGE=CHANGE-IT/node-kc-microservice:0.0.1-SNAPSHOT
export MY_IMAGE=entando/entando-strapi:1.0.2

docker build -t ${MY_IMAGE}  .
echo "Built $MY_IMAGE"

echo ""
echo "Uploading $MY_IMAGE to dockerhub"
docker push $MY_IMAGE

