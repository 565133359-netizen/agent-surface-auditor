export function formatJson(result) {
  return JSON.stringify(result, null, 2);
}

export function formatText(result) {
  const lines = [
    "Agent Surface Auditor",
    `Scanned files: ${result.scannedFiles}`,
    `Skipped large files: ${result.skippedLargeFiles}`,
    `Findings: ${result.counts.critical} critical, ${result.counts.high} high, ${result.counts.medium} medium, ${result.counts.low} low`,
  ];

  if (result.findings.length === 0) {
    lines.push("", "No findings.");
    return lines.join("\n");
  }

  for (const finding of result.findings) {
    lines.push(
      "",
      `[${finding.severity.toUpperCase()}] ${finding.ruleId}`,
      `${finding.file}:${finding.line}`,
      finding.message,
      `Evidence: ${finding.evidence}`,
      `Remediation: ${finding.recommendation}`,
    );
  }
  return lines.join("\n");
}
