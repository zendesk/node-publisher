const yaml = require('js-yaml');
const { npmClient } = require('../client');

const readReleaseConfig = str => yaml.safeLoad(str);

const buildReleaseConfig = () => {
  const client = npmClient();
  const scriptRunner = client === 'yarn' ? 'yarn' : 'npm run';
  const packageRunner = client === 'yarn' ? 'yarn' : 'npx';

  return {
    rollback: true,
    prepare: [
      'git diff-index --quiet HEAD --',
      'git checkout master',
      'git pull --rebase',
      `[[ -f .nvmrc ]] && ${packageRunner} check-node-version --node $(cat .nvmrc)`,
      `${client} install`
    ],
    test: [`${scriptRunner} travis`],
    build: [
      `${scriptRunner} build`,
      'git add dist/bundle.js',
      'git commit -m "Update build file"'
    ],
    after_publish: ['git push --follow-tags origin master:master'],
    changelog: [
      `${packageRunner} offline-github-changelog > CHANGELOG.md`,
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
