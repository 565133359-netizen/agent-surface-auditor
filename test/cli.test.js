import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const cli = resolve("bin/agent-surface-auditor.js");

test("returns exit code 1 when the configured threshold is met", async () => {
  const root = await mkdtemp(join(tmpdir(), "agent-surface-cli-"));
  try {
    await writeFile(join(root, "agent.js"), "child_process.exec(userInput);", "utf8");
    const run = spawnSync(process.execPath, [cli, root, "--format", "json", "--fail-on", "high"], {
      encoding: "utf8",
    });
    assert.equal(run.status, 1);
    const report = JSON.parse(run.stdout);
    assert.equal(report.counts.high, 1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("returns exit code 2 for invalid options", () => {
  const run = spawnSync(process.execPath, [cli, "--format", "xml"], { encoding: "utf8" });
  assert.equal(run.status, 2);
  assert.match(run.stderr, /Unsupported format/);
});
