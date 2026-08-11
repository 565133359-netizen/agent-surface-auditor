# Agent Surface Auditor

Agent Surface Auditor is a dependency-free static analysis CLI for repositories that contain AI agents, skills, plugins, MCP servers, automation, or tool-calling code. It identifies security-relevant surfaces before they reach an agent runtime or a contributor review queue.

The scanner is read-only. It does not execute project code, install dependencies, follow symlinks, or make network requests.

## What it detects

- command execution and destructive shell patterns;
- outbound network request code;
- credential and private-key material;
- broad filesystem writes outside an expected workspace;
- prompt-injection and instruction-override phrases;
- install lifecycle scripts and non-registry dependency sources;
- missing or weak Skill metadata.

Findings include a rule ID, severity, file, line, redacted evidence, and a remediation note. Output is available as human-readable text or machine-readable JSON.

## Quick start

```bash
npm test
node ./bin/agent-surface-auditor.js .
node ./bin/agent-surface-auditor.js ../another-agent --format json --fail-on high
```

Exit codes are stable: `0` means no finding met the configured threshold, `1` means the threshold was met, and `2` means the command or configuration was invalid.

## Configuration

Add `.agentsurface.json` at the scan root:

```json
{
  "ignore": ["test/fixtures/**", "vendor/**"],
  "maxFileBytes": 1000000
}
```

Default exclusions include `.git`, `node_modules`, `dist`, and `coverage`. The scanner does not follow symbolic links.

## Agent Skill

The repository includes `skill/audit-agent-surface`, a Codex-compatible Skill that guides an agent through a read-only scan, finding triage, and a reviewable remediation plan. The Skill never authorizes automatic fixes or command execution.

## Security model

This project uses conservative pattern matching. A finding is a review signal, not proof of exploitation. Secret-like evidence is redacted in reports. See [SECURITY.md](SECURITY.md) for reporting guidance and trust boundaries.

## Contributing

New rules require a focused fixture, expected severity, remediation guidance, and a false-positive discussion. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
