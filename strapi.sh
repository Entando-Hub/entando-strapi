#!/bin/bash

echo "SCRIPT STARTED..."

# Reading Token which is required to access Kubernates API (this token is already present when pod is up)
KUBE_TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)
if [ ! -z "$KUBE_TOKEN" ]
then
  echo "Kubernetes TOKEN FETCHED"
fi

# Reading ingress host and set it as ENV 
export PUBLIC_BASE_URL=$(curl -sSk -H "Authorization: Bearer $KUBE_TOKEN"  https://$KUBERNETES_SERVICE_HOST:$KUBERNETES_PORT_443_TCP_PORT/apis/networking.k8s.io/v1/namespaces/entando/ingresses/quickstart-ingress | jq .spec.rules[0].host | tr -d '"')
echo "Public base url: "$PUBLIC_BASE_URL
echo "Server servlet context path: "$SERVER_SERVLET_CONTEXT_PATH

# Adding Context path to nginx configuration
sed -i 's|SERVER_CONTEXT_PATH|'$SERVER_SERVLET_CONTEXT_PATH'|g' /etc/nginx/sites-available/default
echo "CONTEXT UPDATED in NGINX"

service nginx start

strapiDataDirName=strapi-data
count=0
####################START_SERVICES#################################################
while [ $count -lt 3 ]
do
if [ ! -f "/entando-data/$strapiDataDirName/package.json" ] && [ ${count}==0  ]
then
echo "====> Copying project to Persistance Volume"
mkdir -p /entando-data/$strapiDataDirName/
cp -r . /entando-data/$strapiDataDirName
chown -R root /entando-data/$strapiDataDirName
fi

if [ ! -d "/entando-data/$strapiDataDirName/src/admin" ] && [ ${count}==0  ]
then
echo "====> Copying Custom Admin to Persistance Volume"
cp -r ./src/admin /entando-data/$strapiDataDirName/src/
fi

if [ ! -d "/entando-data/$strapiDataDirName/node_modules" ] || [ ${count}==0 ]
then
  echo "===> Installing node modules"
  npm ci --prefix /entando-data/$strapiDataDirName
fi

if [ ! -d "/entando-data/$strapiDataDirName/build" ] || [ ${count}==0 ]
then
echo "====> configuring custom admin pannel & Building strapi"
mv /entando-data/$strapiDataDirName/src/admin /entando-data/$strapiDataDirName/src/adminl
npm run build --prefix /entando-data/$strapiDataDirName
sed -i 's~@strapi/admin/strapi-server~../../../../../../src/admin/strapi-server~g' /entando-data/$strapiDataDirName/node_modules/@strapi/strapi/lib/core/loaders/admin.js
mv /entando-data/$strapiDataDirName/src/adminl /entando-data/$strapiDataDirName/src/admin
npm install --prefix /entando-data/$strapiDataDirName/src/admin
fi

npm run develop --prefix /entando-data/$strapiDataDirName
count=$((count+1))
echo "Try => "$count
done