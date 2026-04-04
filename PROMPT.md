The current selector's ui and ux are not well. All the projects and owner / root path in the same list without any classifying and formatting.

I do not know whether `@inquirer/prompts` can be used for my idea below. Maybe we need to build a TUI or do something ourselves.

My idea is to classify projects by owner and then display them in a flat list. And search display should be different from the list display.

Like this

```bash
$ mo cd

? Where would you like to go?

❯ .

  antfu-collective (bold and cyan, unselectable)
  .
  ni

  liang-demos (bold and cyan, unselectable)
  oxc-typecheck-reproduction
  oxlint-oxfmt-demo
  pnpm-demo
```

And if users scroll, the owner name should be stick to the top.

For search, it should be different. We hide the owner name and just display the project name. Like this:

```bash
$ mo cd

? Where would you like to go? ni

❯ ni (antfu-collective) (the suffix should be dimmed)
  ni (liangmiQwQ)

  antfu-collective (dimmed as owner name, selectable)
  liangmiQwQ (dimmed as owner name, selectable)
```
