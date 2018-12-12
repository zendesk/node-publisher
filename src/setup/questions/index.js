const { names, messages } = require('../constants');

const generateQuestions = issues =>
  [
    {
      type: 'list',
      name: names.DEFAULT_BRANCH,
      message: messages.DEFAULT_BRANCH,
      choices: issues[names.DEFAULT_BRANCH].choices
    },
    !issues.nvmInstalled() &&
      !issues.nvmrcExists() && {
        type: 'confirm',
        name: names.GENERATE_NVMRC,
        message: messages.GENERATE_NVMRC
      },
    issues[names.BUILD_MISSING] && {
      type: 'confirm',
      name: names.BUILD_MISSING,
      message: messages.BUILD_MISSING
    },
    issues[names.CI_MISSING] && {
      type: 'confirm',
      name: names.CI_MISSING,
      message: messages.CI_MISSING
    }
  ].filter(opt => opt);

const askNvmVersion = version => ({
  type: 'input',
  name: names.NVM_VERSION,
  message: messages.NVM_VERSION,
  default: version.default,
  validate: version.validate,
  transformer: version.transformer
});

module.exports = {
  generateQuestions,
  askNvmVersion
};
