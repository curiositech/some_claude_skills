# Skill Lifecycle Management

From creation to deprecation - how to maintain skills over time.

## Lifecycle Stages

```
DRAFT → ACTIVE → MATURE → DEPRECATED → ARCHIVED
  │        │        │          │           │
  v        v        v          v           v
Testing  In use   Stable    Phasing out  Read-only
```

---

## Stage 1: DRAFT

**Characteristics**:
- New skill under development
- May have incomplete features
- Not yet validated

**Tasks**:
- [ ] Write initial SKILL.md
- [ ] Add description with keywords + NOT clause
- [ ] Create at least 1 anti-pattern
- [ ] Run validation scripts
- [ ] Test activation with 10+ queries

**Version**: 0.x.x (pre-release)

---

## Stage 2: ACTIVE

**Characteristics**:
- Validated and working
- Being actively used and refined
- Accepting feedback

**Tasks**:
- [ ] Monitor activation precision
- [ ] Add anti-patterns as discovered
- [ ] Update temporal knowledge
- [ ] Respond to user feedback
- [ ] Keep CHANGELOG updated

**Version**: 1.0.0+

---

## Stage 3: MATURE

**Characteristics**:
- Stable, well-documented
- Comprehensive anti-patterns
- Working tools included
- Rarely needs changes

**Tasks**:
- [ ] Periodic review (quarterly)
- [ ] Check temporal knowledge freshness
- [ ] Validate against latest Claude behavior
- [ ] Consider extracting sub-skills if grown too large

**Version**: 2.0.0+ (stable API)

---

## Stage 4: DEPRECATED

**Characteristics**:
- Being phased out
- Better alternative exists
- Still functional but not recommended

**Tasks**:
- [ ] Add deprecation notice to SKILL.md header
- [ ] Document migration path
- [ ] Point to replacement skill
- [ ] Set end-of-support date

**Example deprecation notice**:
```markdown
> ⚠️ **DEPRECATED**: This skill is deprecated as of v2.3.0.
> Use `new-skill-name` instead. Migration guide: `references/migration.md`
> End of support: 2025-06-01
```

---

## Stage 5: ARCHIVED

**Characteristics**:
- No longer maintained
- Kept for historical reference
- May still work but unsupported

**Tasks**:
- [ ] Move to `/archived/` directory
- [ ] Update any references
- [ ] Document why archived

---

## Maintenance Checklist

### Monthly
- [ ] Check activation logs for issues
- [ ] Review user feedback
- [ ] Update any broken links

### Quarterly
- [ ] Validate temporal knowledge
- [ ] Run full test suite
- [ ] Check for new anti-patterns
- [ ] Update dependencies (if MCP/scripts)

### Annually
- [ ] Full skill audit
- [ ] Consider restructuring
- [ ] Evaluate if still needed

---

## Versioning

Follow Semantic Versioning (SemVer):

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| Bug fix, typo | PATCH (0.0.X) | 1.0.0 → 1.0.1 |
| New feature, anti-pattern | MINOR (0.X.0) | 1.0.1 → 1.1.0 |
| Breaking change, restructure | MAJOR (X.0.0) | 1.1.0 → 2.0.0 |

**CHANGELOG format**:
```markdown
## [1.2.0] - 2025-01-15

### Added
- New anti-pattern: Template Theater
- Script for activation testing

### Changed
- Updated NOT clause for better precision

### Fixed
- Typo in example code
```

---

## When to Create vs Extend

| Scenario | Action |
|----------|--------|
| New domain expertise | Create new skill |
| Extension of existing | Extend that skill |
| Skill > 500 lines | Split into focused skills |
| Cross-domain | Create composition pattern |
| Experiment | Create in DRAFT, delete if fails |

---

## Skill Health Indicators

| Indicator | Healthy | Warning | Critical |
|-----------|---------|---------|----------|
| Activation precision | &gt;90% | 70-90% | &lt;70% |
| SKILL.md lines | &lt;300 | 300-500 | &gt;500 |
| Anti-patterns | 3+ | 1-2 | 0 |
| Last update | &lt;3 months | 3-6 months | &gt;6 months |
| Validation errors | 0 | 1-2 | &gt;2 |
