const publish = ({ nextVersion, execCommand }) => {
  execCommand(`yarn publish --new-version ${nextVersion}`);
};

module.exports = {
  publish
};
