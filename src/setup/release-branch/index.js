const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const { ask, addScript } = require('../utils');

const GIT_PATH = path.resolve(process.env.PWD, '.git');
const DEFAULT_BRANCHES = ['main', 'master'];

const isGitRepo = () => fs.existsSync(GIT_PATH);

const gitBranches = () => {
  const rawBranches = childProcess.execSync('git branch').toString();
  const branchesRegex = /^\s*(?:\* )?(.+)/gm;
  const branches = [];

  let match = branchesRegex.exec(rawBranches);
  while (match !== null) {
    branches.push(match[1].trim());
    match = branchesRegex.exec(rawBranches);
  }

  return prioritizeDefaultBranch(branches);
};

const prioritizeDefaultBranch = branches => {
  const defaultBranch = DEFAULT_BRANCHES.find(branch =>
    branches.includes(branch)
  );

  if (!defaultBranch) {
    return branches;
  }

  return [defaultBranch].concat(
    branches.filter(branch => branch !== defaultBranch)
  );
};

const question = () => ({
  type: 'list',
  name: 'release branch',
  message:
    'Which of the following branches would you like to use as your release branch?',
  choices: gitBranches()
});

async function releaseBranchStep() {
  if (!isGitRepo()) {
    throw new Error(
      'This is not a Git repository. Run `git init` before running this setup.'
    );
  }

  const releaseBranch = await ask(question());
  const releaseCommand = `node-publisher release --branch=${releaseBranch}`;

  addScript('release', releaseCommand);
}

module.exports = {
  isGitRepo,
  gitBranches,
  releaseBranchStep
};
