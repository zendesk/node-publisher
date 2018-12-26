const publish = ({ nextVersion, execCommand, preid }) => {
  const versionCommand = preid
    ? `npm version ${nextVersion} --preid=${preid}`
    : `npm version ${nextVersion}`;

  execCommand(versionCommand);
  execCommand('npm publish');
};

module.exports = {
  publish
};
