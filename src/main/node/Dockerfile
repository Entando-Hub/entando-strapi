FROM strapi/base:14

# Set up working directory that will be used to copy files/directories below :
WORKDIR entando/integrationEnv/strapi/entando-customized-strapi

# Copy package.json to root directory inside Docker container of Strapi app
COPY ./package*.json ./

RUN npm ci

COPY . .

ENV NODE_ENV production

# RUN npm run build
EXPOSE 1337

CMD ["npm", "run", "develop"]