FROM strapi/base:14

RUN apt-get update && apt-get install -y --no-install-recommends nginx

ARG SOURCE_ROOT="./src/main/node"
# Set up working directory that will be used to copy files/directories below :
 
WORKDIR /entando-code/strapi-code
 
ADD --chown=root:root $SOURCE_ROOT .
 
ADD strapi.sh ./

ADD default /etc/nginx/sites-available/default

RUN chmod +x /entando-code/strapi-code/strapi.sh
 
ENV NODE_ENV=production

EXPOSE 8081
CMD ["/entando-code/strapi-code/strapi.sh"]

 