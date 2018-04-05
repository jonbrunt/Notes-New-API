/* eslint prefer-const: [0] */

const secrets = require('../secrets/mongo');

let config = {
  connectionString: 'mongodb://localhost/notesdb',
};

const env = process.env.NODE_ENV;

if (env === 'production') {
  config.connectionString = process.env.MONGO;
}

module.exports = config;
