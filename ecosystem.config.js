module.exports = {
  apps : [{
    name   : "server",
    script : "server/index.js"
  }, {
    name   : "bot_handler",
    script : "index.js",
    env: {
      NODE_ENV: "development"
    },
    env_production: {
        NODE_ENV: "production"
    }
  }]
}
