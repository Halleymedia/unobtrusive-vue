const path = require('path');
module.exports = {
  testEnvironment: 'node',
  transform: {
    '\\.js$': ['babel-jest', { configFile: path.join(__dirname, './babel.config.js') }]
  }
};
