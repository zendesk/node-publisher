const path = require('path');
const fs = require('fs');
const command = require('./command');
const { PACKAGE_JSON_PATH } = require('./constants');
const { npmClient, publishClient } = require('./client');
const { readReleaseConfig, buildReleaseConfig } = require('./config');
const {
  validatePkgRoot,
  validateLerna,
  isBuildDefined
} = require('./validations');

const buildReleaseEnvironment = () => {
  validatePkgRoot();

  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));

  const client = publishClient();
  if (client === 'lerna') {
    validateLerna();
  }

  return {
    publishClient: publishClient(),
    npmClient: npmClient(),
    withBuildStep: isBuildDefined(pkg)
  };
};

const loadReleaseConfig = env => {
  const configPath = path.resolve(process.env.PWD, '.release.yml');

  return fs.existsSync(configPath)
    ? readReleaseConfig(fs.readFileSync(configPath, 'utf8'))
    : buildReleaseConfig(env);
};

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
  buildReleaseEnvironment,
  loadReleaseConfig,
  execCommands,
  currentCommitId,
  rollbackCommit
};
