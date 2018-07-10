const { execSync } = require('child_process');

const exec = (command, opts = { stdio: [0, 1, 2] }) => {
  try {
    return execSync(command, opts);
  } catch (e) {
    throw new Error(`Execution of command \`${command}\` failed.`);
  }
};

module.exports = {
  exec
};
