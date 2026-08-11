export const SEVERITY_RANK = Object.freeze({
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
});

export const TEXT_RULES = Object.freeze([
  {
    id: "secret.private-key",
    severity: "critical",
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
    message: "Private key material appears to be committed.",
    recommendation: "Revoke and remove the key, purge it from history, and use a secret manager.",
    redact: true,
  },
  {
    id: "secret.hardcoded-credential",
    severity: "high",
    pattern: /(?:api[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|password|token|secret)\s*[:=]\s*["'][A-Za-z0-9_./+=-]{12,}["']/i,
    message: "A credential-like value is assigned in source text.",
    recommendation: "Move the value to a scoped secret store and rotate any exposed credential.",
    redact: true,
  },
  {
    id: "shell.destructive-command",
    severity: "critical",
    pattern: /\brm\s+-[^\n]*r[^\n]*f\b|Remove-Item\b[^\n]*(?:-Recurse[^\n]*-Force|-Force[^\n]*-Recurse)|shutil\.rmtree\s*\(|fs\.(?:rm|rmSync)\s*\([^)]*recursive\s*:\s*true/i,
    message: "A recursive destructive filesystem operation is present.",
    recommendation: "Constrain the target to a verified workspace path and require explicit confirmation.",
  },
  {
    id: "shell.command-execution",
    severity: "high",
    pattern: /\b(?:child_process\.(?:exec|execSync|spawn|spawnSync)|(?:exec|execSync|spawn|spawnSync)\s*\(|subprocess\.(?:run|Popen|call)\s*\(|os\.system\s*\()/,
    message: "The project can launch local commands or processes.",
    recommendation: "Use fixed argument arrays, avoid shell interpolation, and enforce an allowlist.",
  },
  {
    id: "network.outbound-request",
    severity: "medium",
    pattern: /\b(?:fetch\s*\(|axios\.(?:get|post|request)\s*\(|requests\.(?:get|post|request)\s*\(|urllib\.request|curl\s+https?:\/\/|Invoke-WebRequest\b)/i,
    message: "The project can send outbound network requests.",
    recommendation: "Document destinations, validate URLs, restrict redirects, and keep credentials scoped.",
  },
  {
    id: "credential.environment-access",
    severity: "medium",
    pattern: /process\.env(?:\[[^\]]*(?:KEY|TOKEN|SECRET|PASSWORD)[^\]]*\]|\.[A-Z0-9_]*(?:KEY|TOKEN|SECRET|PASSWORD))|os\.environ[^\n]*(?:KEY|TOKEN|SECRET|PASSWORD)/i,
    message: "The project reads credential-like environment variables.",
    recommendation: "Read only named variables, avoid logging values, and document the minimum scope.",
  },
  {
    id: "filesystem.broad-write",
    severity: "high",
    pattern: /\b(?:writeFile|writeFileSync|appendFile|createWriteStream)\s*\(\s*(?:process\.env\.(?:HOME|USERPROFILE)|os\.homedir\s*\(\)|["']\/["']|["'][A-Za-z]:\\)/i,
    message: "A write target may escape the repository workspace.",
    recommendation: "Resolve and verify the final path under an explicit workspace root before writing.",
  },
  {
    id: "prompt.instruction-override",
    severity: "high",
    pattern: /ignore (?:all |any )?(?:previous|prior|system|developer) instructions|reveal (?:the )?system prompt|bypass (?:the )?(?:policy|guardrail)/i,
    message: "Instruction-override language may represent prompt injection content.",
    recommendation: "Treat the content as untrusted data and prevent it from changing tool or policy instructions.",
  },
]);
