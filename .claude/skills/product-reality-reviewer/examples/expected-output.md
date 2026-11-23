# Example Output

## Verdict

`not-ready`

## Must Fix Before Build

| Finding | User Impact | Evidence | Recommended Plan Change |
| --- | --- | --- | --- |
| No missing-provider fallback | New users without paid AI accounts cannot reach first value. | Plan says "connect Claude or OpenAI" only. | Add demo mode, routed-provider option, and provider credential panel. |
| Agent write actions lack rollback | Users cannot recover from a bad generated change. | Agent plan has progress but no receipt or rollback. | Add diff preview, approval gate, and revert command. |

## Can Build With Risk

| Finding | Owner | Mitigation | Follow-up Trigger |
| --- | --- | --- | --- |
| Support path is manual | Product | Launch with transcript export and feedback form. | More than 3 failed runs in a week. |
