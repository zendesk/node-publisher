const { execSync } = require('child_process');

const getYarnVersion = () => {
  try {
    const output = execSync('yarn --version', { encoding: 'utf8' });
    return output.trim();
  } catch (error) {
    // Default to yarn v1 if version detection fails
    return '1.0.0';
  }
};

const isYarnV2OrHigher = () => {
  const version = getYarnVersion();
  const majorVersion = parseInt(version.split('.')[0], 10);
  return majorVersion >= 2;
};

const publish = ({ nextVersion, execCommand }) => {
  if (isYarnV2OrHigher()) {
    execCommand(`yarn version ${nextVersion}`);
    execCommand(`yarn npm publish`);
  } else {
    execCommand(`yarn publish --new-version ${nextVersion}`);
  }
};

module.exports = {
  publish
};
