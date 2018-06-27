const publish = (nextVersion, { validVersion, execCommand }) => {
  if (validVersion(nextVersion)) {
    execCommand(`yarn publish --new-version ${nextVersion}`);
  } else {
    throw new Error(
      'Version argument is not supported, use either `major`, `minor` or `patch`'
    );
  }
};

module.exports = {
  publish
};
