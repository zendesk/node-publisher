const path = require('path');
const fs = require('fs');
const command = require('./command');
const { readReleaseConfig, buildReleaseConfig } = require('./config');

const VERSIONS = ['major', 'minor', 'patch'];

const validateEnvironment = () => {
  const packageJson = path.resolve(process.env.PWD, 'package.json');

  if (!fs.existsSync(packageJson)) {
    throw new Error('Run this script from the root of your package.');
  }
};

const loadReleaseConfig = () => {
  const configPath = path.resolve(process.env.PWD, '.release.yml');

  return fs.existsSync(configPath)
    ? readReleaseConfig(fs.readFileSync(configPath, 'utf8'))
    : buildReleaseConfig();
};

const validVersion = version => VERSIONS.includes(version);

const execCommands = configCommands => {
  if (configCommands) {
    const commands = [].concat(configCommands);

    for (let cmd of commands) {
      command.exec(cmd);
    }
  }
};

const currentCommitId = () =>
  command
    .exec('git rev-parse HEAD', {})
    .toString()
    .trim();

const rollbackCommit = commitId => command.exec(`git reset --hard ${commitId}`);

module.exports = {
  validateEnvironment,
  loadReleaseConfig,
  validVersion,
  execCommands,
  currentCommitId,
  rollbackCommit
};
