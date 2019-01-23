const { hasCiScript } = require('../../utils/validations');
const { warn } = require('../utils');

const checkCiStep = () => {
  if (!hasCiScript()) {
    warn(
      `Your package.json does not contain a CI script. \
Make sure to define your CI script under a \`ci\` or \`travis\` key. \
Also, make sure the script you define exits with a status \
that can be read from the terminal with $?`
    );
  }
};

module.exports = {
  checkCiStep
};
