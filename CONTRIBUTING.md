# Contributing

Contributions are welcome for detection rules, reporters, tests, and documentation.

## Rule changes

Each new or changed rule must include:

1. a stable rule ID and severity;
2. a focused test fixture that demonstrates the intended match;
3. a remediation message that a maintainer can act on;
4. a note about likely false positives;
5. no execution of fixture or target code.

Run the full checks before opening a pull request:

```bash
npm test
npm run scan:self
```

Keep dependencies at zero unless a proposal demonstrates why the new supply-chain surface is necessary.
