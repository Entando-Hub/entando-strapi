console.log("Generated Public Url in server.js => " + "http://" + process.env.PUBLIC_BASE_URL + process.env.SERVER_SERVLET_CONTEXT_PATH);
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: 1337,
  app: {
    keys: env.array('APP_KEYS'),
  },
  url: "http://" + process.env.PUBLIC_BASE_URL + process.env.SERVER_SERVLET_CONTEXT_PATH
});