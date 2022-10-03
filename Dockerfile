FROM strapi/base:14

RUN apt-get update && apt-get install -y --no-install-recommends nginx jq curl

ARG SOURCE_ROOT="./src/main/node"
# Set up working directory that will be used to copy files/directories below :

WORKDIR /entando-code/strapi-code

ADD --chown=root:root $SOURCE_ROOT .

ADD build-strapi.sh ./
RUN chmod +x build-strapi.sh && ./build-strapi.sh

ADD strapi.sh ./

ADD strapi.conf ./

RUN chmod +x /entando-code/strapi-code/strapi.sh

ADD set-permissions.sh ./
RUN chmod +x set-permissions.sh && ./set-permissions.sh

# to avoid "unable to write 'random state'"
ENV RANDFILE=/entando-data/.rnd

RUN echo $(date +%s) > /build_id

ENV NODE_ENV=production

EXPOSE 8081
CMD ["/entando-code/strapi-code/strapi.sh"]
