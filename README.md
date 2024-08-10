<p>
  <a href="https://aurelia.io/" target="_blank">
    <img alt="Aurelia" src="https://aurelia.io/styles/images/aurelia.svg">
  </a>
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm Version](https://img.shields.io/npm/v/aurelia-dependency-injection.svg)](https://www.npmjs.com/package/aurelia-dependency-injection)
![ci](https://github.com/aurelia/dependency-injection/actions/workflows/main.yml/badge.svg)
[![Discourse status](https://img.shields.io/discourse/https/meta.discourse.org/status.svg)](https://discourse.aurelia.io)
[![Twitter](https://img.shields.io/twitter/follow/aureliaeffect.svg?style=social&label=Follow)](https://twitter.com/intent/follow?screen_name=aureliaeffect)
[![Discord Chat](https://img.shields.io/discord/448698263508615178.svg)](https://discord.gg/RBtyM6u)

# aurelia-dependency-injection

This library is part of the [Aurelia](http://www.aurelia.io/) platform and contains a lightweight, extensible dependency injection container for JavaScript.

## Documentation

You can read documentation on dependency injection [here](https://aurelia.io/docs/fundamentals/dependency-injection/). If you would like to help improve this documentation, the source for the above can be found in the doc folder within this repository.

## Platform Support

This library can be used in the **browser** as well as on the **server**.

## Reporting Issues

Please refer to the [issue template](ISSUE_TEMPLATE.md). Accompany any bug report with a demo of the issue using a [runnable Gist](https://gist.run/?id=381fdb1a4b0865a4c25026187db865ce).

## Building

```shell
npm run build
```

## Tests

```shell
npm run test
```

## Developing

Run the tests in watch mode:

```shell
npm run develop
```

## Publishing

1. Bump the version
  
  ```shell
  npm run bump-version [<newversion> | major | minor | patch]
  ```

2. Prepare the release (run tests, run build, docs, release notes)
  
  ```shell
  npm run prepare-release
  ```

3. Commit, tag, npm publish (not automated)
