watch-all-gh-org-repos (wagor)
==============================

[![npm version](https://img.shields.io/npm/v/watch-all-gh-org-repos.svg?style=flat)](https://www.npmjs.com/package/watch-all-gh-org-repos)
[![build status](https://api.travis-ci.org/gedex/watch-all-gh-org-repos.svg)](http://travis-ci.org/gedex/watch-all-gh-org-repos)
[![dependency status](https://david-dm.org/gedex/watch-all-gh-org-repos.svg)](https://david-dm.org/gedex/watch-all-gh-org-repos)

watch-all-gh-org-repos (wagor) is a command line interface to watch all GitHub
organization / user repos.

## Install

```
$ npm install -g watch-all-gh-org-repos
```

## Usage

Once installed globally, `wagor` should be available from shell.

```
$ wagor -h

  Usage: ugor [options]

  Options:

    -h, --help                         output usage information
    -V, --version                      output the version number
    -t, --token <token>                GitHub token
    -o, --organization <organization>  GitHub organization
```

Once installed, you need to [create personal token](https://help.github.com/articles/creating-an-access-token-for-command-line-use/). An example of watching all repos in `GedexTestOrg`:

```
$ wagor -t my-personal-token -o GedexTestOrg

Fetching GedexTestOrg repos..
┌────────────────────┬────────────────────────────────────────────────────────────┐
│ Repo               │ Description                                                │
├────────────────────┼────────────────────────────────────────────────────────────┤
│ wp-dummy-plugin    │ Repo used for testing                                      │
├────────────────────┼────────────────────────────────────────────────────────────┤
│ repo-with-milesto… │ Repo used for testing                                      │
└────────────────────┴────────────────────────────────────────────────────────────┘
Found 2 repos. Watch those? (yes)
Watched GedexTestOrg/repo-with-milestone-and-issues successfully
Watched GedexTestOrg/wp-dummy-plugin successfully
```

## License

MIT
