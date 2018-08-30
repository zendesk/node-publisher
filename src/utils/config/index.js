const yaml = require('js-yaml');
const { npmClient } = require('../client');
const { isBuildDefined } = require('../');

const readReleaseConfig = str => yaml.safeLoad(str);

const buildReleaseConfig = () => {
  const client = npmClient();
  const binPathPrefix = './node_modules/.bin/';
  const scriptRunner = client === 'yarn' ? 'yarn' : 'npm run';

  const config = {
    rollback: true,
    prepare: [
      'git diff-index --quiet HEAD --',
      'git checkout master',
      'git pull --rebase',
      `[[ -f .nvmrc ]] && ${binPathPrefix}check-node-version --node $(cat .nvmrc)`,
      `${client} install`
    ],
    test: [`${scriptRunner} travis`],
    after_publish: ['git push --follow-tags origin master:master'],
    changelog: [
      `${binPathPrefix}offline-github-changelog > CHANGELOG.md`,
      'git add CHANGELOG.md',
      'git commit --allow-empty -m "Update changelog"',
      'git push origin master:master'
    ]
  };

  if (isBuildDefined()) {
    config.build = [
      `${scriptRunner} build`,
      'git add .',
      'git commit --allow-empty -m "Update build file"'
    ];
  }

  return config;
};

module.exports = {
  readReleaseConfig,
  buildReleaseConfig
};
