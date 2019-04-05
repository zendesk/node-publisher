const fs = require('fs');
const { packageJson } = require('../../utils/package');
const { PACKAGE_JSON_PATH, NVM_CONFIG_PATH } = require('../../utils/constants');
const {
  names: { DEFAULT_BRANCH, BUILD_MISSING, CI_MISSING }
} = require('../constants');
const { versionTransformer } = require('../../utils');

const buildScripts = answers => {
  const defaultBranch = answers[DEFAULT_BRANCH] || 'master';
  const releaseCommand =
    defaultBranch === 'master'
      ? 'node-publisher release'
      : `node-publisher release --default-branch=${defaultBranch}`;

  const scripts = { release: releaseCommand };
  if (answers[BUILD_MISSING]) {
    scripts.build = '';
  }
  if (answers[CI_MISSING]) {
    scripts.ci = '';
  }

  return scripts;
};

const format = obj => JSON.stringify(obj, null, 2) + '\n';

const updatePackageJson = answers => {
  const pkg = packageJson();
  const newScripts = Object.assign({}, pkg.scripts, buildScripts(answers));

  fs.writeFileSync(
    PACKAGE_JSON_PATH,
    format(Object.assign({}, pkg, { scripts: newScripts })),
    'utf-8'
  );
};

const generateNvmrcFile = version =>
  fs.writeFileSync(
    NVM_CONFIG_PATH,
    `${versionTransformer(version, {}, { isFinal: true })}\n`,
    'utf-8'
  );

const warn = message => console.log(`WARNING: ${message}`);

module.exports = {
  buildScripts,
  updatePackageJson,
  generateNvmrcFile,
  warn
};
