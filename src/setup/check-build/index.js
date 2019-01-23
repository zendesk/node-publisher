const { hasBuildScript } = require('../../utils/validations');
const { warn } = require('../utils');

const checkBuildStep = () => {
  if (!hasBuildScript()) {
    warn(
      `Your package.json does not contain a \`build\` script. \
Make sure to set up your build process if you need one.`
    );
  }
};

module.exports = {
  checkBuildStep
};
