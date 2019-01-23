const { releaseBranchStep } = require('./release-branch');
const { nvmrcStep } = require('./nvmrc');
const { checkBuildStep } = require('./check-build');
const { checkCiStep } = require('./check-ci');

async function setup() {
  await releaseBranchStep();
  await nvmrcStep();
  checkBuildStep();
  checkCiStep();
}

module.exports = setup;
