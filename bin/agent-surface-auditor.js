#!/usr/bin/env node

import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { scanRepository } from "../src/index.js";
import { formatJson, formatText } from "../src/reporters.js";
import { SEVERITY_RANK } from "../src/rules.js";

const VERSION = "0.1.0";

function usage() {
  return `Agent Surface Auditor ${VERSION}

Usage:
  agent-surface-auditor [path] [options]

Options:
  --format <text|json>       Output format (default: text)
  --fail-on <level|none>     Exit 1 at or above low, medium, high, or critical
  --config <path>            Use an explicit JSON configuration file
  --version                  Print the version
  --help                     Print this help
`;
}

function parseArgs(argv) {
  const options = {
    root: ".",
    format: "text",
    failOn: "high",
    configPath: null,
  };
  let rootSet = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help") return { help: true };
    if (arg === "--version") return { version: true };
    if (arg === "--format" || arg === "--fail-on" || arg === "--config") {
      const value = argv[index + 1];
      if (!value) throw new Error(`${arg} requires a value`);
      index += 1;
      if (arg === "--format") options.format = value;
      if (arg === "--fail-on") options.failOn = value;
      if (arg === "--config") options.configPath = resolve(value);
      continue;
    }
    if (arg.startsWith("-")) throw new Error(`Unknown option: ${arg}`);
    if (rootSet) throw new Error(`Unexpected path: ${arg}`);
    options.root = arg;
    rootSet = true;
  }

  if (!["text", "json"].includes(options.format)) {
    throw new Error(`Unsupported format: ${options.format}`);
  }
  if (options.failOn !== "none" && !(options.failOn in SEVERITY_RANK)) {
    throw new Error(`Unsupported fail threshold: ${options.failOn}`);
  }
  return options;
}

export async function main(argv = process.argv.slice(2)) {
  try {
    const options = parseArgs(argv);
    if (options.help) {
      process.stdout.write(usage());
      return 0;
    }
    if (options.version) {
      process.stdout.write(`${VERSION}\n`);
      return 0;
    }

    const result = await scanRepository({
      root: resolve(options.root),
      configPath: options.configPath,
    });
    const output = options.format === "json" ? formatJson(result) : formatText(result);
    process.stdout.write(`${output}\n`);

    if (options.failOn === "none") return 0;
    const threshold = SEVERITY_RANK[options.failOn];
    return result.findings.some((finding) => SEVERITY_RANK[finding.severity] >= threshold) ? 1 : 0;
  } catch (error) {
    process.stderr.write(`agent-surface-auditor: ${error.message}\n`);
    return 2;
  }
}

const isEntryPoint = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isEntryPoint) {
  process.exitCode = await main();
}
