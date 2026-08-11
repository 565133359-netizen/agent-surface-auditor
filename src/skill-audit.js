export function auditSkill(content, file) {
  if (!/(?:^|\n)---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.test(content)) {
    return [{
      ruleId: "skill.missing-frontmatter",
      severity: "low",
      file,
      line: 1,
      message: "SKILL.md does not contain YAML frontmatter.",
      evidence: "SKILL.md",
      recommendation: "Add name and trigger-focused description fields to YAML frontmatter.",
    }];
  }
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
  const findings = [];
  if (!/^name:\s*[a-z0-9-]+\s*$/m.test(frontmatter)) {
    findings.push({
      ruleId: "skill.invalid-name",
      severity: "low",
      file,
      line: 1,
      message: "Skill name is missing or not normalized to lowercase hyphen-case.",
      evidence: "name field",
      recommendation: "Use lowercase letters, digits, and hyphens only.",
    });
  }
  if (!/^description:\s*\S.+$/m.test(frontmatter)) {
    findings.push({
      ruleId: "skill.missing-description",
      severity: "low",
      file,
      line: 1,
      message: "Skill description is missing or empty.",
      evidence: "description field",
      recommendation: "Describe what the Skill does and the requests that should trigger it.",
    });
  }
  return findings;
}
