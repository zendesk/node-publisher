const yaml = require('js-yaml');
const { npmClient } = require('../client');

const readReleaseConfig = path => yaml.safeLoad(path);

const buildReleaseConfig = () => {
  const client = npmClient();

  return {
    prepare: [
      'git diff-index --quiet HEAD --',
      'git checkout master',
      'git pull --rebase',
      'check-node-version --node $(cat .nvmrc)',
      'ROLLBACK_COMMIT_ID=$(git rev-parse HEAD)',
      `${client} install`
    ],
    test: [`${client === 'yarn' ? 'yarn' : 'npm run'} travis`],
    build: [
      `${client === 'yarn' ? 'yarn' : 'npm run'} build`,
      'git add dist/bundle.js',
      'git commit -m "Update build file"'
    ],
    after_publish: ['git push --follow-tags origin master:master'],
    after_failure: [
      '[[ ! -z "$ROLLBACK_COMMIT_ID" ]] && git reset --hard $ROLLBACK_COMMIT_ID',
      'unset ROLLBACK_COMMIT_ID'
    ],
    changelog: [
      'offline-github-changelog > CHANGELOG.md',
      'git add CHANGELOG.md',
      'git commit --allow-empty -m "Update changelog"',
      'git push origin master:master'
    ],
    after_success: ['unset ROLLBACK_COMMIT_ID']
  };
};

module.exports = {
  readReleaseConfig,
  buildReleaseConfig
};
