module.exports = {
  rest: {
    defaultLimit: 25,
    maxLimit: 100,
    withCount: true,
    prefix: process.env.SERVER_SERVLET_CONTEXT_PATH + "/api",
  },
};
