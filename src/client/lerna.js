const publish = ({ nextVersion, execCommand }) => {
  execCommand(`lerna publish ${nextVersion}`);
};

module.exports = {
  publish
};
