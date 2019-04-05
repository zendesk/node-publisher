const names = {
  WITHOUT_GIT: 'without_git',
  DEFAULT_BRANCH: 'default_branch',
  GENERATE_NVMRC: 'generate_nvmrc',
  NVM_VERSION: 'nvm_version',
  BUILD_MISSING: 'build_missing',
  CI_MISSING: 'ci_missing'
};

const messages = {
  DEFAULT_BRANCH: 'Which of the following branches is your default one?',
  GENERATE_NVMRC:
    'Your system does not have NVM installed. Would you like me to generate a .nvmrc file anyway?',
  NVM_VERSION: 'What version of Node would you like your package to depend on?',
  BUILD_MISSING:
    'Your package does not have a `build` script defined.\nWould you like me to generate an empty `build` script for you?',
  CI_MISSING:
    'Your package does not have a `ci` nor a `travis` script defined.\nWould you like me to generate an empty `ci` script for you?'
};

const warnings = {
  NVM_NOT_INSTALLED: `Your system does not have NVM installed. Install NVM (https://github.com/creationix/nvm#installation) or eject by running \`npx node-publisher eject\` and \
customize the release process to skip checking the Node version before release.`,
  CI_MISSING: `An empty CI script under the key \`ci\` has been generated for you in your package.json. It is strongly recommended to define your testing procedure there. \
Make sure your procedure exits with a status that can be read from the terminal with $?`,
  CUSTOM_CONFIG: `Your project setup most probably requires a customized release process. No changes have been made to your project setup.\n\
To customize your release, run \`npx node-publisher eject\`.\n\
For more info, check out the documentation: https://github.com/zendesk/node-publisher#customize-the-release-process.`
};

const errors = {
  WITHOUT_GIT:
    'This is not a Git repository. Run `git init` before running this setup.',
  NVM_VERSION:
    'The specified version is not a valid semver. Examples of valid semver: 1.2.3, 42.6.7.9.3-alpha, etc.'
};

module.exports = {
  names,
  messages,
  warnings,
  errors
};
