# Skill Validation Checklist

Complete guide to reviewing and testing skills.

## Review Checklist

### CRITICAL (must-have)

- [ ] Description has keywords AND NOT clause
- [ ] SKILL.md under 500 lines (`wc -l SKILL.md`)
- [ ] All referenced files exist (`find skill-dir/ -type f`)
- [ ] Test activation: Does it activate when it should?
- [ ] Test non-activation: Does it NOT activate when it shouldn't?

### HIGH PRIORITY (should-have)

- [ ] Has "When to Use" and "When NOT to Use" sections
- [ ] Includes 1-3 anti-patterns with "Why it's wrong"
- [ ] Encodes domain shibboleths (expert vs novice knowledge)
- [ ] `allowed-tools` is minimal

### NICE TO HAVE (polish)

- [ ] Temporal knowledge (what changed when)
- [ ] Working code examples (not just templates)
- [ ] References for deep dives
- [ ] Bash restrictions if applicable

## Activation Testing

### Positive Tests (SHOULD activate)

Ask Claude questions that should trigger the skill:
```
# Example for a React skill:
"Help me optimize this React component's re-renders"
"Why is my useEffect running twice?"
"How do I prevent unnecessary renders?"

# Check: Did the skill activate?
```

### Negative Tests (SHOULD NOT activate)

Ask questions that should NOT trigger the skill:
```
# Example for a React skill:
"Help me write a Python script"
"What's the best database for my project?"
"How do I set up nginx?"

# Check: Did it correctly NOT activate?
```

### Edge Cases

Test ambiguous queries at the boundary:
```
# For a React skill - might or might not be React-specific:
"How do I handle forms?"
"What's the best state management?"
```

## Integration Testing

- [ ] Test with related skills (do they conflict or complement?)
- [ ] Test with MCPs (does skill guide MCP usage?)
- [ ] Test in different project contexts

## Security Audit

- [ ] Read all scripts before enabling skill
- [ ] Check for network calls / data exfiltration
- [ ] Verify allowed-tools are minimal
- [ ] Test in isolated project first

## File Structure Validation

```bash
# Check for orphaned references
grep -r "references/" skill-dir/SKILL.md | \
  sed 's/.*references\//references\//' | \
  while read ref; do
    [ -f "skill-dir/$ref" ] || echo "Missing: $ref"
  done

# Check line count
wc -l skill-dir/SKILL.md
# Should be &lt; 500

# List all files
find skill-dir/ -type f -name "*.md" -o -name "*.py" -o -name "*.sh"
```

## Description Quality Check

Good description formula:
```
[What it does]. [Use cases]. Activate on [keywords]. NOT for [exclusions].
```

**Red flags**:
- No keywords → Won't activate correctly
- No NOT clause → False positives
- "Helps with many things" → Too vague
- Over 200 chars → Consider splitting

## Success Metrics

| Metric | Target |
|--------|--------|
| Correct activation | &gt;90% |
| False positive rate | &lt;5% |
| Token usage | &lt;5k typical |
| Error prevention | Measurable reduction |

## Common Issues

| Issue | Symptom | Fix |
|-------|---------|-----|
| Won't activate | Missing keywords | Add specific trigger words |
| Activates too much | No exclusions | Add NOT clause |
| Claude ignores sections | Buried too deep | Move to main SKILL.md |
| Missing files | Reference errors | Remove refs or create files |
| Token bloat | Slow loading | Extract to /references |
