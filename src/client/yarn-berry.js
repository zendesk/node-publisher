const { packageJson } = require('../utils/package');

const version = str => {
  if (str[0] === 'v') {
    return str;
  }

  return `v${str}`;
};

const publish = ({ nextVersion, execCommand, env }) => {
  execCommand(`yarn version ${nextVersion}`);

  const pkg = packageJson();

  execCommand(`git add package.json yarn.lock`);
  execCommand(`git commit -m "${version(pkg.version)}"`);
  execCommand(`git tag "${version(pkg.version)}"`);
  execCommand(`git push origin ${env.branch || 'master'} --follow-tags`);
  execCommand(`yarn npm publish`);
};

module.exports = {
  publish
};
