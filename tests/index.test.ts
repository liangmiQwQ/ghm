import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, expect, test } from "vite-plus/test";
import { GhmError, listRepos, parseRepoSpec, readConfig } from "../src";

let createdPaths: string[] = [];

afterEach(async () => {
  await Promise.all(
    createdPaths.map(async (p) => {
      try {
        await fs.rm(p, { recursive: true, force: true });
      } catch {
        // ignore
      }
    }),
  );
  createdPaths = [];
});

test("parseRepoSpec", () => {
  expect(parseRepoSpec("vitejs/vite")).toEqual({ owner: "vitejs", repo: "vite" });
  expect(parseRepoSpec("vitejs/vite.git")).toEqual({ owner: "vitejs", repo: "vite" });

  expect(() => parseRepoSpec("")).toThrow(GhmError);
  expect(() => parseRepoSpec("vitejs")).toThrow(GhmError);
  expect(() => parseRepoSpec("vitejs/vite/extra")).toThrow(GhmError);
});

test("listRepos lists owner/repo dirs", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "ghm-root-"));
  createdPaths.push(root);

  await fs.mkdir(path.join(root, "vitejs", "vite"), { recursive: true });
  await fs.mkdir(path.join(root, "vuejs", "core"), { recursive: true });
  await fs.mkdir(path.join(root, ".hidden", "ignore"), { recursive: true });

  await fs.writeFile(path.join(root, "not-a-dir"), "x");

  const repos = await listRepos(root);
  expect(repos).toEqual(["vitejs/vite", "vuejs/core"]);
});

test("readConfig validates config file and root", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "ghm-root-"));
  const configDir = await fs.mkdtemp(path.join(os.tmpdir(), "ghm-config-"));
  createdPaths.push(root, configDir);

  const configPath = path.join(configDir, "ghm.json");
  await fs.writeFile(configPath, JSON.stringify({ root }, null, 2));

  const config = await readConfig({ configPath });
  expect(config.root).toBe(root);

  await fs.writeFile(configPath, JSON.stringify({ root: path.join(root, "nope") }, null, 2));
  await expect(readConfig({ configPath })).rejects.toBeInstanceOf(GhmError);
});
