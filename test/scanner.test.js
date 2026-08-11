import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { scanRepository } from "../src/scanner.js";

async function withFixture(files, callback) {
  const root = await mkdtemp(join(tmpdir(), "agent-surface-auditor-"));
  try {
    for (const [path, content] of Object.entries(files)) {
      const absolute = join(root, path);
      await mkdir(join(absolute, ".."), { recursive: true });
      await writeFile(absolute, content, "utf8");
    }
    return await callback(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("detects destructive commands and redacts credential evidence", async () => {
  await withFixture({
    "agent.js": [
      "const token = 'ghp_1234567890abcdef';",
      "child_process.exec(userCommand);",
      "const cleanup = 'rm -rf /tmp/agent';",
    ].join("\n"),
  }, async (root) => {
    const result = await scanRepository({ root });
    const ids = new Set(result.findings.map((finding) => finding.ruleId));
    assert.ok(ids.has("secret.hardcoded-credential"));
    assert.ok(ids.has("shell.command-execution"));
    assert.ok(ids.has("shell.destructive-command"));
    const secret = result.findings.find((finding) => finding.ruleId === "secret.hardcoded-credential");
    assert.equal(secret.evidence, "<redacted>");
  });
});

test("detects install hooks and mutable dependency sources", async () => {
  await withFixture({
    "package.json": JSON.stringify({
      scripts: { postinstall: "node scripts/setup.js" },
      dependencies: { helper: "github:example/helper" },
    }),
  }, async (root) => {
    const result = await scanRepository({ root });
    const ids = new Set(result.findings.map((finding) => finding.ruleId));
    assert.ok(ids.has("supply-chain.lifecycle-script"));
    assert.ok(ids.has("supply-chain.non-registry-dependency"));
  });
});

test("honors repository ignore patterns", async () => {
  await withFixture({
    ".agentsurface.json": JSON.stringify({ ignore: ["fixtures/**"] }),
    "fixtures/unsafe.js": "child_process.exec(input);",
    "src/safe.js": "export const value = 1;",
  }, async (root) => {
    const result = await scanRepository({ root });
    assert.equal(result.findings.length, 0);
    assert.equal(result.scannedFiles, 2);
  });
});
