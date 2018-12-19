const publish = ({ nextVersion, execCommand }) => {
  execCommand(`npm version ${nextVersion}`);
  execCommand('npm publish');
};

module.exports = {
  publish
};
