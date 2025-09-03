const fs = require('fs');
const { PACKAGE_JSON_PATH } = require('../constants');

const packageJson = () => {
  try {
    return JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
  } catch (e) {
    throw new Error(
      'Your package.json could not be parsed. Make sure the manifest is valid.'
    );
  }
};

module.exports = {
  packageJson
};
