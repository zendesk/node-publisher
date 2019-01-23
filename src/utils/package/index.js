const fs = require('fs');
const { PACKAGE_JSON_PATH } = require('../constants');

let pkg;
const packageJson = () => {
  if (pkg) return pkg;

  pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));

  return pkg;
};

module.exports = {
  packageJson
};
