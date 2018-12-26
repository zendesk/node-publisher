const publish = ({ nextVersion, execCommand, preid }) => {
  const publishCommand = preid
    ? `lerna publish ${nextVersion} --preid ${preid}`
    : `lerna publish ${nextVersion}`;

  execCommand(publishCommand);
};

module.exports = {
  publish
};
