module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: 1337,
  app: {
    keys: env.array('APP_KEYS'),
  },
  url: process.env.BASE_URL + process.env.SERVER_SERVLET_CONTEXT_PATH
});


// For kubernetes cluster
// module.exports = ({ env }) => ({
//   host: env('HOST', 'custom-node-service'),
//   port: env.int('PORT', 1337),
//   app: {
//    keys: env.array("APP_KEYS",['keys','keys']),
//   },
// });
