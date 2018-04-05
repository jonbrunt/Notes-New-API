/* eslint prefer-const: [0] */

const mongo = require('../secrets/mongo');
const auth = require('../secrets/auth');

let config = {
  connectionString: 'mongodb://localhost/notesdb',
};

const env = process.env.NODE_ENV || 'development';

if (env === 'production') {
  config.connectionString = process.env.MONGO;
  config.mySecret = process.env.SALT;
}
if (env === 'development') {
  config.connectionString = mongo.connectionString;
  config.mySecret = auth.mySecret;
}
module.exports = config;
