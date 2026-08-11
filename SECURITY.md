# Security Policy

## Supported versions

Security fixes are applied to the latest release and the default branch.

## Reporting a vulnerability

Do not open a public issue for a vulnerability that exposes a credential, enables command execution, or permits destructive filesystem access. Use GitHub private vulnerability reporting when it is available. Include the affected rule or component, a minimal reproduction, impact, and a proposed mitigation if known.

## Trust boundaries

Agent Surface Auditor treats scanned repositories as untrusted input. The scanner:

- reads regular text files only;
- does not execute scanned code or package scripts;
- does not install dependencies;
- does not follow symbolic links;
- does not make network requests;
- redacts evidence for credential and private-key findings.

The scanner uses pattern matching and can produce false positives or miss context-dependent vulnerabilities. A clean report is not a security guarantee.
