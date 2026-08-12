# Changelog

This file records user-visible project changes. It does not imply adoption, download, or vulnerability-resolution metrics.

## 0.1.0

- Added a dependency-free Node.js CLI for read-only analysis of agent, Skill, plugin, MCP, and automation repositories.
- Added text, package, and Skill metadata checks for shell execution, destructive filesystem operations, network access, credential exposure, prompt injection, and supply-chain surfaces.
- Added text and JSON reporters with stable exit codes for local use and CI gates.
- Added `.agentsurface.json` configuration for ignore patterns and maximum file size.
- Added a Codex-compatible `audit-agent-surface` Skill with a reviewable triage workflow.
- Added security policy, contributor guidance, pinned CI actions, and reproducible test fixtures.
- Added README architecture and terminal-output visuals; the visuals are illustrative and contain no third-party scan data.
