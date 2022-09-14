#!/bin/bash
echo "SCRIPT STARTED"


# Reading Token which is required to access Kubernates APi (this token is already present when pod is up)
KUBE_TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)
if [ ! -z "$KUBE_TOKEN" ]
then
 echo "TOKEN FETCHED"
fi

# Reading ingress host and set it as ENV
export PUBLIC_BASE_URL=$(curl -sSk -H "Authorization: Bearer $KUBE_TOKEN" https://$KUBERNETES_SERVICE_HOST:$KUBERNETES_PORT_443_TCP_PORT/apis/networking.k8s.io/v1/namespaces/entando/ingresses/quickstart-ingress | jq .spec.rules[0].host | tr -d '"')
echo $PUBLIC_BASE_URL

# Adding Context path to nginx configuration
sed -i 's|SERVER_CONTEXT_PATH|'$SERVER_SERVLET_CONTEXT_PATH'|g' /etc/nginx/sites-available/default
echo "CONTEX UPDATED NGINX"
service nginx start
pvstrapiDirPath=/entando-data/strapi-data

####################START_SERVICES#################################################
count=0
while [ $count -lt 3 ]
do
 if [ ! -f "$pvstrapiDirPath/package.json" ] && [ ${count}==0 ]
 then
   echo "====> copying project to Persistance Volume"
   mkdir -p $pvstrapiDirPath
   cp -r . $pvstrapiDirPath
   chown -R root $pvstrapiDirPath
 fi

 if grep -q "APP_KEYS" $pvstrapiDirPath/.env && grep -q "API_TOKEN_SALT" $pvstrapiDirPath/.env && grep -q "ADMIN_JWT_SECRET" $pvstrapiDirPath/.env && grep -wq "JWT_SECRET" $pvstrapiDirPath/.env
 then
  echo "Token Already Present"
 else
  sed -i.bak '$s|$|'"\nAPP_KEYS="$(openssl rand -base64 21)'|' $pvstrapiDirPath/.env
  sed -i.bak '$s|$|'"\nAPI_TOKEN_SALT="$(openssl rand -base64 21)'|' $pvstrapiDirPath/.env
  sed -i.bak '$s|$|'"\nADMIN_JWT_SECRET="$(openssl rand -base64 21)'|' $pvstrapiDirPath/.env
  sed -i.bak '$s|$|'"\nJWT_SECRET="$(openssl rand -base64 21)'|' $pvstrapiDirPath/.env
 fi

 if [ ! -d "$pvstrapiDirPath/src/admin" ] && [ ${count}==0 ]
 then
  echo "====> copying Custom Admin to Persistance Volume"
  cp -r ./src/admin $pvstrapiDirPath/src/
 fi

 if [ ! -d "$pvstrapiDirPath/node_modules" ] || [ ${count}==0 ]
 then
  echo "===> installing node modules"
  npm ci --prefix $pvstrapiDirPath
 fi

 if [ ! -d "$pvstrapiDirPath/build" ] || [ ${count}==0 ]
 then
  echo "====> configuring custom admin pannel & Building strapi"
  mv $pvstrapiDirPath/src/admin $pvstrapiDirPath/src/adminl
  npm run build --prefix $pvstrapiDirPath
  sed -i 's~@strapi/admin/strapi-server~../../../../../../src/admin/strapi-server~g' $pvstrapiDirPath/node_modules/@strapi/strapi/lib/core/loaders/admin.js
  mv $pvstrapiDirPath/src/adminl $pvstrapiDirPath/src/admin
  npm install --prefix $pvstrapiDirPath/src/admin
 fi

 npm run develop --prefix $pvstrapiDirPath
 count=$((count+1))
 echo "Try => "$count
done