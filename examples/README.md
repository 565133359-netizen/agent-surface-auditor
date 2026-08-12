# Examples

The `minimal-agent` directory is a small, safe repository-shaped target for trying the scanner without installing or executing target code.

From the project root:

```bash
npm run scan:example
```

You can also scan it directly:

```bash
node ./bin/agent-surface-auditor.js ./examples/minimal-agent --format json --fail-on high
```

The example is intentionally clean. It demonstrates the command shape and exit behavior; it is not evidence that an arbitrary agent repository is safe.

For a real review, point the CLI at a cloned or locally available agent, Skill, plugin, MCP, or automation repository and inspect every finding before execution.
