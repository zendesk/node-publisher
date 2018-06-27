const publish = (nextVersion, { validVersion, execCommand }) => {
  if (validVersion(nextVersion)) {
    execCommand(`npm version ${nextVersion}`);
    execCommand('npm publish');
  } else {
    throw new Error(
      'Version argument is not supported, use either `major`, `minor` or `patch`'
    );
  }
};

module.exports = {
  publish
};
