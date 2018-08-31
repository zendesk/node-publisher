const fs = require('fs');
const path = require('path');
const { LERNA_JSON_PATH } = require('../constants');

const npmClient = () => {
  const clientMap = {
    'package-lock.json': 'npm',
    'yarn.lock': 'yarn'
  };

  let client;
  for (const file in clientMap) {
    if (fs.existsSync(path.resolve(process.env.PWD, file))) {
      client = clientMap[file];
    }
  }

  if (!client) {
    throw new Error(
      'Client could not be detected, make sure you use one of the supported clients.'
    );
  }

  return client;
};

const publishClient = () => {
  const lernaConfigExists = fs.existsSync(LERNA_JSON_PATH);

  return lernaConfigExists ? 'lerna' : npmClient();
};

module.exports = {
  npmClient,
  publishClient
};
