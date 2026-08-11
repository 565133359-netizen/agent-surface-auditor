import { lstat, readFile, readdir } from "node:fs/promises";
import { extname, relative, resolve, sep } from "node:path";
import { loadConfig, matchesIgnore } from "./config.js";
import { auditPackageJson } from "./package-audit.js";
import { TEXT_RULES, SEVERITY_RANK } from "./rules.js";
import { auditSkill } from "./skill-audit.js";

function normalizePath(path) {
  return path.split(sep).join("/");
}

function redactEvidence(line, redact) {
  const trimmed = line.trim().slice(0, 240);
  return redact ? "<redacted>" : trimmed;
}

function scanText(content, file) {
  const findings = [];
  const lines = content.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.includes("asa: ignore")) continue;
    for (const rule of TEXT_RULES) {
      rule.pattern.lastIndex = 0;
      if (!rule.pattern.test(line)) continue;
      findings.push({
        ruleId: rule.id,
        severity: rule.severity,
        file,
        line: index + 1,
        message: rule.message,
        evidence: redactEvidence(line, rule.redact),
        recommendation: rule.recommendation,
      });
    }
  }
  return findings;
}

async function collectFiles(root, config) {
  const files = [];
  async function visit(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const absolute = resolve(directory, entry.name);
      const relativePath = normalizePath(relative(root, absolute));
      if (matchesIgnore(relativePath, config.ignore)) continue;
      if (entry.isDirectory()) {
        if (!config.ignoredDirectories.includes(entry.name)) await visit(absolute);
        continue;
      }
      if (entry.isSymbolicLink()) continue;
      if (!entry.isFile()) continue;
      if (!config.extensions.includes(extname(entry.name)) && entry.name !== "Dockerfile") continue;
      files.push({ absolute, relativePath });
    }
  }
  await visit(root);
  return files;
}

export async function scanRepository({ root, configPath = null }) {
  const absoluteRoot = resolve(root);
  const rootStat = await lstat(absoluteRoot);
  if (!rootStat.isDirectory()) throw new Error(`Scan target is not a directory: ${absoluteRoot}`);
  const config = await loadConfig(absoluteRoot, configPath);
  const files = await collectFiles(absoluteRoot, config);
  const findings = [];
  let skippedLargeFiles = 0;

  for (const file of files) {
    const stat = await lstat(file.absolute);
    if (stat.size > config.maxFileBytes) {
      skippedLargeFiles += 1;
      continue;
    }
    const content = await readFile(file.absolute, "utf8");
    if (content.includes("\u0000")) continue;
    findings.push(...scanText(content, file.relativePath));
    if (file.relativePath.endsWith("package.json")) {
      findings.push(...auditPackageJson(content, file.relativePath));
    }
    if (file.relativePath.endsWith("SKILL.md")) {
      findings.push(...auditSkill(content, file.relativePath));
    }
  }

  findings.sort((a, b) => {
    const severity = SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
    return severity || a.file.localeCompare(b.file) || a.line - b.line;
  });

  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const finding of findings) counts[finding.severity] += 1;

  return {
    schemaVersion: 1,
    root: absoluteRoot,
    scannedFiles: files.length - skippedLargeFiles,
    skippedLargeFiles,
    counts,
    findings,
  };
}
