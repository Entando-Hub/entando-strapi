#!/bin/bash

echo "SCRIPT STARTED"

# Reading Token which is required to access Kubernates API (this token is already present when pod is up)
KUBE_TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)
if [ ! -z "$KUBE_TOKEN" ]
then
 echo "TOKEN FETCHED"
fi

KUBE_NAMESPACE=$(cat /var/run/secrets/kubernetes.io/serviceaccount/namespace)

# Reading ingress host and set it as ENV
export PUBLIC_BASE_URL=$(curl -sSk -H "Authorization: Bearer $KUBE_TOKEN" https://$KUBERNETES_SERVICE_HOST:$KUBERNETES_PORT_443_TCP_PORT/apis/networking.k8s.io/v1/namespaces/$KUBE_NAMESPACE/ingresses?labelSelector=EntandoApp | jq .items[0].spec.rules[0].host | tr -d '"')
echo $PUBLIC_BASE_URL

pvstrapiDirPath=/entando-data/strapi-data

# setting HOME to a writable location
export HOME=$pvstrapiDirPath
npm config --global set prefix $pvstrapiDirPath
npm config --global set cache $pvstrapiDirPath/.npm

if [ ! -f "$pvstrapiDirPath/build_id" ] || [ "$(cat /build_id)" -gt "$(cat $pvstrapiDirPath/build_id)" ]
then
  echo "====> copying project to Persistent Volume"
  mkdir -p $pvstrapiDirPath
  cp -r . $pvstrapiDirPath

  if grep -q "APP_KEYS" $pvstrapiDirPath/.env && grep -q "API_TOKEN_SALT" $pvstrapiDirPath/.env && grep -q "ADMIN_JWT_SECRET" $pvstrapiDirPath/.env && grep -wq "JWT_SECRET" $pvstrapiDirPath/.env
  then
    echo "Token Already Present"
  else
    sed -i.bak '$s|$|'"\nAPP_KEYS="$(openssl rand -base64 21)'|' $pvstrapiDirPath/.env
    sed -i.bak '$s|$|'"\nAPI_TOKEN_SALT="$(openssl rand -base64 21)'|' $pvstrapiDirPath/.env
    sed -i.bak '$s|$|'"\nADMIN_JWT_SECRET="$(openssl rand -base64 21)'|' $pvstrapiDirPath/.env
    sed -i.bak '$s|$|'"\nJWT_SECRET="$(openssl rand -base64 21)'|' $pvstrapiDirPath/.env
  fi

  cp /build_id $pvstrapiDirPath
fi

####################START_SERVICES#################################################

cp strapi.conf $pvstrapiDirPath/strapi.conf

cd $pvstrapiDirPath

# Adding Context path to nginx configuration
sed -i 's|SERVER_CONTEXT_PATH|'$SERVER_SERVLET_CONTEXT_PATH'|g' $PWD/strapi.conf
echo "CONTEX UPDATED NGINX"
/usr/sbin/nginx -c $PWD/strapi.conf -p $pvstrapiDirPath &

npm run build
npm run develop
