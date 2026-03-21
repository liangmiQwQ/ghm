# `ghm` Project Feature and Road Map

## - [ ] Stage One: Basic Feature Setup

### - [ ] Basic Config System

Require `~/.config/ghm.json` as the config file like below.

```json
{
  "root": "~/code"
}
```

Exit program for no config file (as well as empty or with an unvaild path)

### - [ ] `ghm` main command

`ghm`

A wrapper of `cd` command

Display a prompt, allow users to enter repo name to cd to it, also allow user cd to the root path or the owner path. (like cd to `~/code`, or `~/code/vitejs`)

### - [ ] `clone` command

`ghm clone <user>/<repo>`

alias `ghm c`

e.g. `ghm clone vitejs/devtools`

It will clone the repo to `~/code/vitejs/devtools`, create dir if not exist.

### - [ ] `list` command

`ghm list`

alias `ghm ls`

Show the all repos available, with the remote, repo type.
