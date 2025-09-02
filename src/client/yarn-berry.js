const { packageJson } = require('../utils/package');

const publish = ({ nextVersion, execCommand }) => {
  execCommand(`yarn version ${nextVersion}`);

  const pkg = packageJson();

  execCommand(`git add package.json yarn.lock`);
  execCommand(`git commit -m "v${pkg.version}"`);
  execCommand(`git tag "v${pkg.version}"`);
  execCommand(`git push origin master --follow-tags`);
  execCommand(`yarn npm publish`);
};

module.exports = {
  publish
};
