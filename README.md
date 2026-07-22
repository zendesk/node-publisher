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
![repo-checks](https://github.com/zendesk/node-publisher/workflows/repo-checks/badge.svg)

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

The script searches for unmet requirements in your package and attempts to address them. In general, it performs the following actions:

- Checks whether the package root is a git directory.
- Generates a release script in you `package.json` with a release branch of your choice.
- Generates a `.nvmrc` file if missing.
- Checks whether a `build` script is defined in `package.json`.
- Checks whether a CI script is defined in `package.json`.

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
- The tool expects the Node version to match the one in `.nvmrc` during the release process. If the expectation is not met, the release fails in its preparation phase.
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

`node-publisher` is published to npm from CI via the [`npm publish`](.github/workflows/npm-publish.yml) GitHub Actions workflow. Publishing is **tokenless** — it uses [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) over GitHub OIDC, so no npm token or local npm login is required.

1. **Bump the version in a PR.** Run `yarn version <patch|minor|major>` (this edits the `version` field in `package.json`; it does not create a commit or tag), or edit the field by hand. Commit, open a PR, and merge to `master`.
2. **Publish.** Go to **Actions → npm publish → Run workflow** and run it against `master`. The workflow builds the package and runs `yarn npm publish` to the Zendesk npmjs org, authenticating via OIDC.

> **Note:** publishing is restricted to the required reviewers configured on the `npm-publish` GitHub environment. Only those admins can approve and run a release.

**Prerequisites:**

- The `npm-publish` GitHub environment must exist on the repository (managed via #ask-packaging). The `NPM_TOKEN` and `NPM_TOTP_DEVICE` secrets are only needed for the one-time trusted-publisher setup below, not for regular publishes.
- The `version` in `package.json` must be higher than the latest version already on [npmjs.com](https://www.npmjs.com/package/node-publisher) — npm rejects re-publishing an existing version.

**First-time setup (once per package):**

Before the first OIDC publish, the trusted publisher must be registered on npm. After the `npm-publish` environment and its `NPM_TOKEN`/`NPM_TOTP_DEVICE` secrets exist, run **Actions → npm trusted publishing → Run workflow** against `master` once. This registers this repository, the `npm-publish.yml` workflow, and the `npm-publish` environment with npm. After it succeeds, all releases publish tokenlessly via step 2 above.

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
