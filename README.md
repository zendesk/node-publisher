# node-publisher

This is a configurable release automation tool for node packages inspired by Travis CI. It has a default configuration, which can be overriden in case of need. As a convention, this release tool defines a set of hooks that represent the release lifecycle. The default configuration can be overriden by redefining what commands should run under which hook in a `.release.yml` file. The hooks are listed under the [Lifecycle](#lifecycle) section.

## Getting started
### 1. Install the package:

```
npm install @zendesk/node-publisher --save-dev
```

or

```
yarn add --dev @zendesk/node-publisher
```

### 2. Add following scripts to `package.json`
```js
// package.json
// make sure the `travis` command exits with a status that can be read from the terminal with $?

{
  ...,
  "sctipts": {
    "travis": "your linting/testing/etc. command here",
    "release": "node-publisher release",
  },
  ...
}
```

## Usage

```
npm run release -- (major | minor | patch)
```

or 

```
yarn release (major | minor | patch)
```

## Customize the release process

```
node-publisher eject
```

After ejecting, a `.release.yml` file will appear in the root directory of your package. You can override the default behaviour by modifying this file.

## Prerequisites

The default release process assumes the following:

- The master branch is called `master`.
- A `.nvmrc` file is present in the root of your package. In case it is missing, the release fails in its preparation phase.

## Lifecycle

1. `prepare`: The process that prepares the workspace for releasing a new version of your package. It might checkout to master, check whether the working tree is clean, check the current node version, etc. Between this step and `test`, a rollback point is created for your git repo.

2. `test`: Runs the tests and/or linting. You might want to configure the tool to run the same command as your CI tool does.

3. `build`: Runs your build process. By default it runs either `yarn build` or `npm run build` depending on your npm client.

4. `publish`: Publishes a new version of your package. By default, the tool detects your npm/publishing client and calls the publish command. Currently supported clients are: `npm`, `yarn`, `lerna`.

5. `after_publish`: Runs the declared commands immediately after publishing. By default, it pushes the changes to the remote along with the tags. In case the publishing fails, this hook will not execute.

6. `after_failure`: Runs the specified commands in case the release process failed at any point. Before running the configured commands, a rollback to the state after `prepare` might happen - in case the `rollback` option is set to `true` which is the default behaviour.

7. `changelog`: In case the package was successfully published, a changelog is being generated. This tool uses the [offline-github-changelog](https://github.com/sunesimonsen/offline-github-changelog) package for this purpuse.

8. `after_success`: Runs the specified commands after generating a changelog, in case the release process was successful. It might be used to clean up any byproduct of the previous hooks. By default, it unsets the rollback point saved in the `prepare` hook.

## Configuration

The lifecycle hooks can be redefined in the form of a configurable YAML file. Additionally to the hooks, the configuration also accepts the following options:

* `rollback [Boolean]` - rolls back to the latest commit fetched after the `prepare` step. The rollback itself happens in the `after_failure` step and only if this flag is set to `true`.

### Default configuration
The exact configuration depends on the npm client being used. In case, it is yarn, the default configuration will look like this:

```yaml
rollback: true

prepare:
  - git diff-index --quiet HEAD --
  - git checkout master
  - git pull --rebase
  - '[[ -f .nvmrc ]] && ./node_modules/.bin/check-node-version --node $(cat .nvmrc)'
  - yarn install

test:
  - yarn travis

build:
  - yarn build
  - git add .
  - git commit --allow-empty -m "Update build file"

after_publish:
  - git push --follow-tags origin master:master

changelog:
  - ./node_modules/.bin/offline-github-changelog > CHANGELOG.md
  - git add CHANGELOG.md
  - git commit --allow-empty -m "Update changelog"
  - git push origin master:master
```

## Supported publishing clients

`node-publisher` supports the main npm clients and Lerna as an underlying publishing tool. It automatically detects them based on the different `lock files` or `config files` they produce or require. If multiple of these files are detected, the following precedence will take place regarding the publishing tool to be used:

`lerna` > `yarn` > `npm`

## Development

### Install packages
```
yarn
```

### Release a new version
```
yarn release (major|minor|patch)
```

## Owners
- Email: [delta@zendesk.com](mailto:delta@zendesk.com)
- Slack: [#delta-team](https://zendesk.slack.com/messages/delta-team/)
- GitHub: `@zendesk/delta`
