#!/usr/bin/env node
import { cloneRepo } from "./lib/clone.js";
import { GhmError } from "./lib/error.js";
import { listRepos } from "./lib/list.js";
import { readConfig } from "./lib/config.js";

type Command =
  | { name: "help" }
  | { name: "version" }
  | { name: "clone"; spec?: string }
  | { name: "list" };

function parseCommand(argv: string[]): Command {
  const [command, ...rest] = argv;

  if (!command || command === "-h" || command === "--help") return { name: "help" };
  if (command === "-v" || command === "--version") return { name: "version" };

  if (command === "clone" || command === "c") return { name: "clone", spec: rest[0] };
  if (command === "list" || command === "ls") return { name: "list" };

  return { name: "help" };
}

function printHelp(): void {
  process.stdout.write(
    [
      "ghm - GitHub Project Manager",
      "",
      "Usage:",
      "  ghm clone <owner>/<repo>",
      "  ghm c <owner>/<repo>",
      "  ghm list",
      "  ghm ls",
      "",
      "Config:",
      "  ~/.config/ghm.json",
      '  { "root": "~/code" }',
      "",
    ].join("\n"),
  );
}

export async function main(argv = process.argv.slice(2)): Promise<number> {
  try {
    const command = parseCommand(argv);

    if (command.name === "help") {
      printHelp();
      return 0;
    }

    if (command.name === "version") {
      // best-effort: package.json is not bundled in dist in all setups
      process.stdout.write("ghm\n");
      return 0;
    }

    const { root } = await readConfig();

    if (command.name === "list") {
      const repos = await listRepos(root);
      for (const repo of repos) process.stdout.write(`${repo}\n`);
      return 0;
    }

    if (command.name === "clone") {
      if (!command.spec) throw new GhmError("Usage: ghm clone <owner>/<repo>", 2);
      await cloneRepo(command.spec, { root });
      return 0;
    }

    printHelp();
    return 0;
  } catch (error) {
    if (error instanceof GhmError) {
      process.stderr.write(`${error.message}\n`);
      return error.exitCode;
    }

    process.stderr.write(`${(error as Error).message}\n`);
    return 1;
  }
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    process.stderr.write(`${(error as Error).message}\n`);
    process.exitCode = 1;
  });
