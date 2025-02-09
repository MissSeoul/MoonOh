const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'puppy-yejin',
  location: 'asia-northeast3'
};
exports.connectorConfig = connectorConfig;

