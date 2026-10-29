const path = require('path');
const fs = require('fs');
const command = require('./command');
const {
  DEFAULT_CONFIG_PATH,
  DEFAULT_BRANCH,
  VALID_TEST_RUNNERS,
  DEFAULT_TEST_RUNNER
} = require('./constants');
const { npmClient, publishClient } = require('./client');
const { readReleaseConfig, buildReleaseConfig } = require('./config');
const { packageJson } = require('./package');
const {
  validateNodeVersion,
  validatePkgRoot,
  validateTestRunner,
  validateLerna,
  hasBuildScript
} = require('./validations');

const buildReleaseEnvironment = ({
  branch,
  configPath = DEFAULT_CONFIG_PATH,
  quiet = false
}) => {
  validateNodeVersion();
  validatePkgRoot();

  const pkg = packageJson();
  const testRunner =
    VALID_TEST_RUNNERS.find(script => script in pkg.scripts) ||
    DEFAULT_TEST_RUNNER;

  try {
    validateTestRunner(testRunner);
  } catch (e) {
    if (!quiet) {
      throw e;
    }
  }

  const client = publishClient();
  if (client === 'lerna') {
    validateLerna();
  }

  return {
    publishClient: publishClient(),
    npmClient: npmClient(),
    branch: branch || getDefaultBranch(),
    configPath: configPath,
    testRunner: testRunner,
    withBuildStep: hasBuildScript()
  };
};

const loadReleaseConfig = env => {
  const configPath = path.isAbsolute(env.configPath)
    ? env.configPath
    : path.resolve(process.env.PWD, env.configPath);

  if (fs.existsSync(configPath)) {
    return readReleaseConfig(fs.readFileSync(configPath, 'utf8'));
  } else if (env.configPath !== DEFAULT_CONFIG_PATH) {
    throw new Error(
      `The configuration file \`${env.configPath}\` does not exist.`
    );
  }

  return buildReleaseConfig(env);
};

const execCommands = configCommands => {
  if (configCommands) {
    const commands = [].concat(configCommands);

    for (const cmd of commands) {
      command.exec(cmd);
    }
  }
};

const currentCommitId = () =>
  command
    .exec('git rev-parse HEAD', {})
    .toString()
    .trim();

const getDefaultBranch = () => {
  try {
    return command
      .exec('git symbolic-ref --short refs/remotes/origin/HEAD', {
        stdio: ['ignore', 'pipe', 'ignore']
      })
      .toString()
      .replace(/^origin\//, '')
      .trim();
  } catch (e) {
    // origin/HEAD is not always set (e.g. repos cloned before the remote
    // existed or with an old git version), so fall through to local branches.
  }

  try {
    const branches = command
      .exec('git branch', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .split('\n')
      .map(line => line.replace(/^\*?\s*/, '').trim())
      .filter(Boolean);

    const detected = ['main', 'master'].find(branch =>
      branches.includes(branch)
    );

    if (detected) {
      return detected;
    }
  } catch (e) {
    // No local branches to inspect either; fall through to the default.
  }

  return DEFAULT_BRANCH;
};

const rollbackCommit = commitId => command.exec(`git reset --hard ${commitId}`);

const versionTransformer = (version, _answers, flags) =>
  flags.isFinal && version[0] !== 'v' ? `v${version}` : version;

module.exports = {
  buildReleaseEnvironment,
  loadReleaseConfig,
  execCommands,
  currentCommitId,
  getDefaultBranch,
  rollbackCommit,
  versionTransformer
};
