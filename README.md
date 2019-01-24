<p align="center">
  <a href="https://github.com/zendesk/node-publisher">
    <img
      alt="Node Publisher by Zendesk"
      src="https://github.com/zendesk/node-publisher/raw/master/assets/logo.png"
      width="500"
    />
  </a>
</p>

This is a configurable release automation tool for node packages inspired by [create-react-app](https://github.com/facebook/create-react-app) and [Travis CI](https://travis-ci.org/). It has a default configuration, which can be overriden in case of need. As a convention, this release tool defines a set of hooks that represent the release lifecycle. The default configuration can be overriden by redefining what commands should run under which hook in a `.release.yml` file. The hooks are listed under the [Lifecycle](#lifecycle) section.

[![NPM version](https://badge.fury.io/js/node-publisher.svg)](https://badge.fury.io/js/node-publisher)
[![Build Status](https://travis-ci.com/zendesk/node-publisher.svg?branch=master)](https://travis-ci.com/zendesk/node-publisher)

# Getting started
## 1. Install the package:

```sh
npm install node-publisher --save-dev
```

or

```sh
yarn add --dev node-publisher
```

## 2. Setup

Run the setup script:

```sh
npx node-publisher setup
```

The script will search for unmet requirements in your package and attempt to fix them automatically. In case there is more info needed, it will ask some questions about your project.

Possible questions:

- `Which branch is your default one?` It is assumed that one would like to release from the main branch. Of course, it might not be your case, so pick the branch that you would like to release from.
- In case you don't have NVM installed and a .nvmrc file is missing, it might ask you `whether to generate it anyway`.
- Before the tool generates the .nvmrc file, it will ask you the `Node version you would like it to use` there. The default version is your current Node version.
- If a `build` script is missing, it will ask whether it should generate an empty one for you.
- If a `ci` script is missing, the same question will be asked.

For more info, read the [Prerequisites section](#prerequisites).

# Usage

```sh
npm run release -- <version>
```

or 

```sh
yarn release <version>
```

Since `v1.2.0`, node-publisher supports the version options supported by the detected npm client. In earlier versions, only `major`, `minor` and `patch` options were accepted. When using `yarn`, the pre-release identifier (`--preid`) is ignored.

```sh
npm run release -- <version> --preid alpha
```

# Customize the release process

```sh
npx node-publisher eject
```

After ejecting, a `.release.yml` file will appear in the root directory of your package. You can override the default behaviour by modifying this file.

## Custom branch
Using the `--branch` release param, it is possible to specify which branch should be checked out during the `prepare` [lifecycle](#lifecycle) step. When no `branch` is specified, the `master` branch will be checked out by default.

## Multiple configuration files

Using the `--config` release param, it is possible to specify which file to load the release steps from. This way, one can have different release procedures for different purposes.

Example:

```js
// package.json

{
  "scripts": {
    "release": "node-publisher release",
    "pre-release": "node-publisher release --config path/to/.pre-release.yml"
  }
}
```

# Prerequisites

The default release process assumes the following:

- The master branch is called `master`.
- A `.nvmrc` file is present in the root of your package. In case it is missing, the release fails in its preparation phase.
- The tool expects the build generation script to be called `build`. Otherwise, the build step is skipped.
- The tool expects the test triggering script to be called `travis` or `ci`. The reason is that many times the standard `test` scripts are implemented to watch the files for changes to re-trigger the tests. This tool relies on the test script to return eventually, hence the choice of the commonly used CI-friendly script names. The list of accepted script names may be extended in the future. If both `travis` and `ci` scripts are present, `travis` will be preferred.

*Notice:* the test triggering script (`travis` or `ci`) has to return a value, eventually. Otherwise, the release would stall and not run correctly. Interrupting a stalling release process would also interrupt the `rollback` feature's execution.

# Lifecycle

1. `prepare`: The process that prepares the workspace for releasing a new version of your package. It might checkout to master, check whether the working tree is clean, check the current node version, etc. Between this step and `test`, a rollback point is created for your git repo.

2. `test`: Runs the tests and/or linting. You might want to configure the tool to run the same command as your CI tool does.

3. `build`: Runs your build process. By default it runs either `yarn build` or `npm run build` depending on your npm client. This step is only run if `build` is defined unders `sripts` in your `package.json` file.

4. `publish`: Publishes a new version of your package. By default, the tool detects your npm/publishing client and calls the publish command. Currently supported clients are: `npm`, `yarn`, `lerna`.

5. `after_publish`: Runs the declared commands immediately after publishing. By default, it pushes the changes to the remote along with the tags. In case the publishing fails, this hook will not execute.

6. `after_failure`: Runs the specified commands in case the release process failed at any point. Before running the configured commands, a rollback to the state after `prepare` might happen - in case the `rollback` option is set to `true` which is the default behaviour.

7. `changelog`: In case the package was successfully published, a changelog will be generated. This tool uses the [offline-github-changelog](https://github.com/sunesimonsen/offline-github-changelog) package for this purpuse.

8. `after_success`: Runs the specified commands after generating the changelog, in case the release process was successful. It might be used to clean up any byproduct of the previous hooks.

## Configuration

The lifecycle hooks can be redefined in the form of a configurable YAML file. Additionally to the hooks, the configuration also accepts the following options:

* `rollback [Boolean]` - rolls back to the latest commit fetched after the `prepare` step. The rollback itself happens in the `after_failure` step and only if this flag is set to `true`.

## Default configuration
The exact configuration depends on the npm client being used and the contents of your `package.json` file. In case you use yarn, the default configuration will look like this:

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

build: # only if "build" is defined as a script in your `package.json`
  - yarn build
  - git diff --staged --quiet || git commit -am "Update build file"

after_publish:
  - git push --follow-tags origin master:master

changelog:
  - ./node_modules/.bin/offline-github-changelog > CHANGELOG.md
  - git add CHANGELOG.md
  - git commit --allow-empty -m "Update changelog"
  - git push origin master:master
```

# Supported publishing clients

`node-publisher` supports the main npm clients and Lerna as an underlying publishing tool. It automatically detects them based on the different `lock files` or `config files` they produce or require. If multiple of these files are detected, the following precedence will take place regarding the publishing tool to be used:

`lerna` > `yarn` > `npm`

# Development

## Install packages
```sh
yarn
```

## Release a new version
```sh
yarn release <version>
```

# Contributing

Contributing to `node-publisher` is fairly easy, as long as the following steps are followed:

1. Fork the project
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request
6. Mention one or more of the maintainers to get the Pull Request approved and merged

## Maintainers
- Attila Večerek ([@vecerek](https://github.com/vecerek/))
- Sune Simonsen ([@sunesimonsen](https://github.com/sunesimonsen/))

# Copyright and License
Copyright (c) 2018 Zendesk Inc.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.

You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
