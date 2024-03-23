let config 
if (process.env.NODE_ENV === "development") {
    config = require('./local_config.json')
} else if (process.env.NODE_ENV === "production") {
    config = require('./prod_config.json')
}

module.exports = config