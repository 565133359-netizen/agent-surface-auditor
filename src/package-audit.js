const RISKY_DEPENDENCY_SOURCE = /^(?:https?:|git\+|github:|file:|link:|\*|latest$)/i;

export function auditPackageJson(content, file) {
  let manifest;
  try {
    manifest = JSON.parse(content);
  } catch {
    return [{
      ruleId: "package.invalid-json",
      severity: "medium",
      file,
      line: 1,
      message: "package.json is not valid JSON.",
      evidence: "<invalid JSON>",
      recommendation: "Repair the manifest before installing or reviewing dependencies.",
    }];
  }

  const findings = [];
  for (const name of ["preinstall", "install", "postinstall", "prepare"]) {
    if (manifest.scripts?.[name]) {
      findings.push({
        ruleId: "supply-chain.lifecycle-script",
        severity: "high",
        file,
        line: 1,
        message: `The ${name} lifecycle script runs during common install or publish flows.`,
        evidence: `${name}: ${manifest.scripts[name]}`,
        recommendation: "Remove the lifecycle hook or document and constrain every command it runs.",
      });
    }
  }

  for (const section of ["dependencies", "devDependencies", "optionalDependencies"]) {
    for (const [name, version] of Object.entries(manifest[section] ?? {})) {
      if (RISKY_DEPENDENCY_SOURCE.test(String(version))) {
        findings.push({
          ruleId: "supply-chain.non-registry-dependency",
          severity: "medium",
          file,
          line: 1,
          message: `${name} uses a mutable or non-registry dependency source.`,
          evidence: `${section}.${name}: ${version}`,
          recommendation: "Pin an immutable release or commit and verify the upstream source.",
        });
      }
    }
  }
  return findings;
}
