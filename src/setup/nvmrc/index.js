const fs = require('fs');
const path = require('path');
const os = require('os');
const childProcess = require('child_process');
const semver = require('semver');
const { ask } = require('../utils');

const NVM_PATH = path.resolve(os.homedir(), '.nvm');
const NVM_CONFIG_PATH = path.resolve(process.env.PWD, '.nvmrc');

const isNvmInstalled = () => fs.existsSync(NVM_PATH);

const nvmrcExists = () => fs.existsSync(NVM_CONFIG_PATH);

const versionTransformer = (version, _answers, flags) =>
  flags.isFinal && version[0] !== 'v' ? `v${version}` : version;

const question = () => ({
  type: 'input',
  name: 'nvmrc',
  message: `Your package does not contain a .nvmrc file. \
What version of Node would you like your package to depend on?`,
  default: childProcess
    .execSync('node -v')
    .toString()
    .trim(),
  validate: version =>
    semver.valid(version)
      ? true
      : `The specified version is not a valid semver. \
Examples of valid semver: 1.2.3, 42.6.7.9.3-alpha, etc.`,
  transformer: versionTransformer
});

const generateNvmrcFile = version =>
  fs.writeFileSync(
    NVM_CONFIG_PATH,
    `${versionTransformer(version, {}, { isFinal: true })}\n`,
    'utf-8'
  );

async function nvmrcStep() {
  if (!isNvmInstalled()) {
    throw new Error(
      `Your system does not have NVM installed. \
Install NVM (https://github.com/creationix/nvm#installation) or eject \
by running \`npx node-publisher eject\` and customize the release process \
to skip checking the Node version before release.`
    );
  }

  if (nvmrcExists()) {
    return;
  }

  const nodeVersion = await ask(question());
  generateNvmrcFile(nodeVersion);
}

module.exports = {
  NVM_PATH,
  NVM_CONFIG_PATH,
  versionTransformer,
  nvmrcStep
};
