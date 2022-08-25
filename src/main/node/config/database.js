
let dbUrl =  process.env.SPRING_DATASOURCE_URL && process.env.SPRING_DATASOURCE_URL.split('/');
let hostUrl = (dbUrl != null && dbUrl.length > 1) ? dbUrl[2].split(':') : '';
let dbHost = (hostUrl != null && hostUrl.length > 1) ? hostUrl[0] : '';
let dbPort = (hostUrl != null && hostUrl.length > 1) ? hostUrl[1] : '';
let dbName = (dbUrl != null && dbUrl.length > 0) ? dbUrl[dbUrl.length-1] : '';
console.log('dbHost in database.js: ', dbHost);
console.log('dbPort in database.js: ', dbPort);
console.log('dbName in database.js: ', dbName);

module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', dbHost),
      port: env.int('DATABASE_PORT', dbPort),
      database: env('DATABASE_NAME', dbName),
      user: env('DATABASE_USERNAME', process.env.SPRING_DATASOURCE_USERNAME),
      password: env('DATABASE_PASSWORD', process.env.SPRING_DATASOURCE_PASSWORD),
      ssl: env.bool('DATABASE_SSL', false),
    },
  },
});
