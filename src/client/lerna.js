const publish = ({ execCommand }) => {
  execCommand('lerna publish');
};

module.exports = {
  publish
};
