const fs = require('fs');
const { PACKAGE_JSON_PATH } = require('../constants');

let pkg;
const packageJson = () => {
  if (pkg) return pkg;

  try {
    pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
  } catch (e) {
    throw new Error(
      'Your package.json could not be parsed. Make sure the manifest is valid.'
    );
  }

  return pkg;
};

module.exports = {
  packageJson
};
