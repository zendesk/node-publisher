const fs = require('fs');
const inquirer = require('inquirer');
const { packageJson } = require('../utils/package');
const { PACKAGE_JSON_PATH } = require('../utils/constants');

async function ask(question) {
  const { name } = question;
  const answer = await inquirer.prompt([question]);

  return answer[name];
}

const format = obj => JSON.stringify(obj, null, 2) + '\n';

const addScript = (key, value) => {
  const pkg = packageJson();
  const newScripts = Object.assign({}, pkg.scripts, { [key]: value });
  const newPkg = Object.assign({}, pkg, { scripts: newScripts });

  fs.writeFileSync(PACKAGE_JSON_PATH, format(newPkg), 'utf-8');
};

const warn = message => console.log(`WARNING: ${message}`);

module.exports = {
  ask,
  addScript,
  warn
};
