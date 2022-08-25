FROM strapi/base:14
ARG SOURCE_ROOT="./src/main/node"
# Set up working directory that will be used to copy files/directories below :
WORKDIR entando/integrationEnv/strapi/entando-customized-strapi

# Copy package.json to root directory inside Docker container of Strapi app
COPY $SOURCE_ROOT/package*.json ./

RUN npm ci

COPY $SOURCE_ROOT .

ENV NODE_ENV production

# RUN npm run build
EXPOSE 1337

CMD ["npm", "run", "develop"]