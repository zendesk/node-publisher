const fs = require('fs');
const path = require('path');

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

const detectClient = () => {
  const lernaConfigExists = fs.existsSync(
    path.resolve(process.env.PWD, 'lerna.json')
  );

  return lernaConfigExists ? 'lerna' : npmClient();
};

module.exports = {
  npmClient,
  detectClient
};
