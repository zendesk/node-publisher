const yaml = require('js-yaml');
const { npmClient } = require('../client');

const readReleaseConfig = str => yaml.safeLoad(str);

const buildReleaseConfig = () => {
  const client = npmClient();

  return {
    rollback: true,
    prepare: [
      'git diff-index --quiet HEAD --',
      'git checkout master',
      'git pull --rebase',
      'check-node-version --node $(cat .nvmrc)',
      `${client} install`
    ],
    test: [`${client === 'yarn' ? 'yarn' : 'npm run'} travis`],
    build: [
      `${client === 'yarn' ? 'yarn' : 'npm run'} build`,
      'git add dist/bundle.js',
      'git commit -m "Update build file"'
    ],
    after_publish: ['git push --follow-tags origin master:master'],
    changelog: [
      'offline-github-changelog > CHANGELOG.md',
      'git add CHANGELOG.md',
      'git commit --allow-empty -m "Update changelog"',
      'git push origin master:master'
    ]
  };
};

module.exports = {
  readReleaseConfig,
  buildReleaseConfig
};
