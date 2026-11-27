# Severity Rubric

Use this when classifying product-review findings.

The build-stage labels below apply to plan reviews. For a built experience use
`blocks-task`, `adds-friction` or `improvement` with the demonstrated customer
consequence. A recommendation is not a new permission or launch gate.

| Severity | Meaning | Examples |
| --- | --- | --- |
| `must-fix-before-build` | Blocks a new user, creates trust risk, or invalidates architecture. | No account path, no provider fallback, secrets unclear, agent can mutate without approval. |
| `can-build-with-risk` | Build can start, but the risk must be tracked and owned. | Pricing copy incomplete, support workflow manual, telemetry dashboard deferred. |
| `watch-after-launch` | Acceptable for MVP if explicitly monitored. | Edge-case import failure, nice-to-have onboarding copy, secondary persona unsupported. |

## Escalation Rules

- A missing account path is material when the promised task requires shared
  identity, cloud ownership, teams or billing. Local saved work need not require
  an account if ownership and recovery are clear.
- Missing provider access is blocking when the intended audience cannot complete
  the core task through a supported route. A clearly stated key/account
  requirement can be appropriate for a technical audience; do not demand an
  unrelated fallback merely to fill a checklist.
- Agent write actions need an appropriate authorization boundary and recovery
  strategy. Existing scoped automatic permission can satisfy authorization;
  do not require repeated human approval for every action.
- Missing support path is `can-build-with-risk` unless failures can destroy user work, then it is `must-fix-before-build`.

The original manifest checker still reports conservative missing-field findings
using its plan vocabulary. Interpret applicability in the human review; a
manifest verdict does not establish that a built product is ready or unready.
