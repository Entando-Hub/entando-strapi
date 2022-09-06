#!/bin/bash
 
echo "Script started..."
service nginx start

podName=strapi-data
count=0
####################START_SERVICES#################################################
while [ $count -lt 3 ]
do
 
if [ ! -f "/entando-data/$podName/package.json" ]
then
echo "====> copying project to Persistance Volume"
mkdir -p /entando-data/$podName/
 
cp -r . /entando-data/$podName
chown -R root /entando-data/$podName
fi
 
if [ ! -d "/entando-data/$podName/node_modules" ]
then
 echo "===> installing node modules"
 npm ci --prefix /entando-data/$podName
fi
 
# end
# ls /entando-data/$podName
if [ ! -d "/entando-data/$podName/build" ]
then
echo "====> configuring custom admin pannel &\nBuilding strapi"
 
mv /entando-data/$podName/src/admin /entando-data/$podName/src/adminl

npm run build --prefix /entando-data/$podName
 
sed -i 's~@strapi/admin/strapi-server~../../../../../../src/admin/strapi-server~g' /entando-data/$podName/node_modules/@strapi/strapi/lib/core/loaders/admin.js
 
mv /entando-data/$podName/src/adminl /entando-data/$podName/src/admin
 
npm install --prefix /entando-data/$podName/src/admin
fi

npm run develop --prefix /entando-data/$podName
count = `expr $count+1`
done