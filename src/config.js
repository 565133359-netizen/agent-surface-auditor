import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const DEFAULT_CONFIG = Object.freeze({
  ignore: [],
  ignoredDirectories: [".git", "node_modules", "dist", "coverage"],
  maxFileBytes: 1_000_000,
  extensions: [
    ".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".py", ".rb",
    ".go", ".rs", ".sh", ".ps1", ".md", ".yaml", ".yml", ".json", ".toml",
  ],
});

export async function loadConfig(root, explicitPath = null) {
  const configPath = explicitPath ?? resolve(root, ".agentsurface.json");
  let userConfig = {};
  try {
    userConfig = JSON.parse(await readFile(configPath, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw new Error(`Invalid configuration at ${configPath}: ${error.message}`);
    }
  }

  return {
    ...DEFAULT_CONFIG,
    ...userConfig,
    ignore: [...DEFAULT_CONFIG.ignore, ...(userConfig.ignore ?? [])],
    ignoredDirectories: [
      ...DEFAULT_CONFIG.ignoredDirectories,
      ...(userConfig.ignoredDirectories ?? []),
    ],
    extensions: userConfig.extensions ?? DEFAULT_CONFIG.extensions,
  };
}

export function matchesIgnore(relativePath, patterns) {
  const path = relativePath.replaceAll("\\", "/");
  return patterns.some((pattern) => {
    const normalized = pattern.replaceAll("\\", "/");
    if (normalized.endsWith("/**")) {
      const prefix = normalized.slice(0, -3).replace(/\/$/, "");
      return path === prefix || path.startsWith(`${prefix}/`);
    }
    if (!normalized.includes("*")) return path === normalized;
    const escaped = normalized.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`^${escaped.replaceAll("**", ".*").replaceAll("*", "[^/]*")}$`);
    return regex.test(path);
  });
}
