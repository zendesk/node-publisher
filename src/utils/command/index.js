const { execSync } = require('child_process');

const exec = command => {
  try {
    execSync(command, { stdio: [0, 1, 2] });
  } catch (e) {
    throw new Error(`Execution of command \`${command}\` failed.`);
  }
};

module.exports = {
  exec
};
