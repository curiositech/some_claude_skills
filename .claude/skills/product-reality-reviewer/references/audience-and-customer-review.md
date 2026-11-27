# Audience, customer journeys and buyer decisions

Use for built apps and marketing pages. The unit of review is a person trying to
complete a task or make a decision with the information available at that point.
The product's implementation and its current screen inventory are inputs, not a
definition of what the customer needs.

## Establish a useful audience model

Start from available customer research, support requests, product constraints and
observed use. When those are unavailable, state a small set of plausible task
hypotheses and what remains unknown. Do not invent biographical personas whose
age, name or hobbies do no work in the review.

| Audience state | Starting point to establish | Task to inspect | Common missing support |
| --- | --- | --- | --- |
| First-time user | Category knowledge, expectations, available accounts/data and setup constraints | Understand the offer and reach a meaningful first result | Explanation, example data, permissions rationale, clear next step |
| Returning user | Prior work, time away, changed state and unfinished task | Find, resume and finish work | Saved state, history, recognizable objects, recovery after interruption |
| Power user | Frequency, volume, repetitive work and control needed | Complete realistic repeated or complex work efficiently | Search, selection, batch actions, shortcuts, defaults, visibility and undo |
| Buyer or evaluator | Decision authority, alternatives, budget and perceived risk | Decide whether to try, buy or recommend | Relevant proof, fit/limits, costs, objections, implementation effort and next step |

Use only rows relevant to the artifact. A power user can also be a first-time
visitor to this product; distinguish domain knowledge from familiarity with this
interface. An administrator, approver or support person may need a separate task
when their role changes permissions or the outcome. Do not force one journey to
serve contradictory goals without choosing a primary audience or a branch.

## Walk a task rather than admire a screen

Write a concrete start and finish: "A new customer with no imported data creates
and saves a first invoice," rather than "review onboarding." Use realistic data
volume and permissions for returning and experienced users. For each step, record:

1. The user's immediate goal and knowledge at that moment.
2. What is visible and what action it suggests.
3. Whether the action is available and discoverable for that role and state.
4. What actually happens, how success or failure is communicated, and what comes next.
5. The evidence: direct interaction, recording, screenshot, source inspection or hypothesis.

Do not rescue the walkthrough with an internal URL, a developer console command,
preconfigured credentials or an explanation the product never gives. Stop at a
blocker, record it, then inspect independent paths that remain useful. Keep live
interaction within the task's authorization; use safe fixtures for consequential
actions where available. A review request does not authorize a purchase, live
customer message or destructive data change.

Distinguish these outcomes because they need different repairs:

- **Missing behavior:** the task cannot be completed. Identify the smallest
  necessary capability or explicit product limitation.
- **Hidden behavior:** completion is possible, but the audience lacks a visible
  cue. Fix the navigation, label, example or feedback.
- **Unclear outcome:** an action runs but the user cannot tell whether it worked
  or what happens next. Supply accurate state and a next step.
- **Unnecessary work:** the user repeatedly supplies information the system
  already has or completes manual steps without a task reason. Check whether
  defaults, reuse or a supported shortcut would remove it.
- **Wrong promise:** the page creates an expectation the flow does not meet.
  Repair the promise or the behavior, guided by the intended product scope.

Test relevant empty, loading, error, success, cancellation and interruption
states. Check the path back from a mistake as well as the happy path. For native
apps, include platform conventions, permission prompts, supported text sizes and
navigation back to prior work. Screenshots support appearance findings; they do
not establish that a control, focus transition or recovery action works.

## Review a marketing page as a buying decision

Name the primary audience, the action the business wants and the value that makes
that action reasonable. Trace the visitor's actual entry page through the CTA's
destination. Search traffic may start on an interior page.

Check both an unfamiliar visitor who needs to understand fit and an informed
buyer ready to act. The first may need an example or demonstration; the second
may need price, terms and a direct purchase, signup or contact route. Do not
force ready buyers through a long explanation before they can act.

Ask whether the visitor can answer these questions from the page's content and
available links, in an order appropriate to the purchase:

- What is this, who is it for, and which problem does it solve?
- What result could I get, and why would I choose this over my current approach?
- How does it work at the level needed to judge suitability and effort?
- What evidence supports the promise, and does it apply to my situation?
- What does it cost in money, time, setup and risk? What relevant limitations apply?
- What would prevent me from buying or trying it, and does the page answer that concern?
- What happens when I take the next step, and does that destination match the label?

Do not require each answer in its own section, force a fixed card count or add
unneeded material to a low-stakes purchase. Give each existing section a decision
job. Remove or relocate sections that merely fill a layout slot or describe an
internal implementation without helping the buyer.

Classify a technical detail before editing it:

| Detail's job | Treatment |
| --- | --- |
| Helps a technical buyer judge integration, control, reliability or procurement fit | Keep it and explain its relevant implication with evidence |
| Necessary setup information after the buying decision | Put it in the appropriate setup step or linked documentation |
| Reveals an implementation artifact with no customer decision value | Remove it from primary copy or replace it with the actual supported outcome |
| Claims a benefit the architecture alone cannot prove | Qualify it and obtain evidence before making the promise |

For example, a mainstream buyer may need to know that unfinished work survives
closing the app, while an enterprise evaluator may also need the storage and
deployment constraints. Verify either claim before publishing it. Hiding all
engineering information can damage a technical sale just as leading with the
stack can confuse a nontechnical buyer.

Sales optimization should increase informed, successful next steps. Avoid false
scarcity, fabricated testimonials, omitted costs or a signup CTA that silently
starts a paid commitment. Preserve constraints material to fit. Useful proof can
be a real demonstration, an explained example, documented behavior or relevant
customer evidence; do not invent social proof to fill a section.

## Deliver evidence and a repair

Keep findings specific: audience and task, screen or section, observed cue/action,
customer consequence, evidence status, proposed repair and verification method.
Rank repeated confusion below a blocked core task unless evidence shows greater
harm. Recommend missing features because a task needs them, not because a generic
SaaS checklist contains them. Record intentionally excluded audiences and tasks.

For copy, provide an actual proposed heading, paragraph or CTA and the reason it
serves the buying decision. For a product gap, provide a minimal interaction or
state change and an observable acceptance condition. If the user authorized
implementation, make the bounded repair and revisit the journey. Otherwise,
deliver the review and concrete proposal without silently changing the product.

When a benefit remains a hypothesis, propose how to evaluate it. A user trial can
observe task completion and confusion. A sales experiment needs a defined action,
an existing baseline or a plan to collect one, and an outcome appropriate to the
business. Distinguish clicks, signups, paid purchases and retained use. Do not
claim that more clicks prove more successful customers or that a rewrite will
produce a specific conversion lift before measurement.

## Basis and limits

Reviewed 2026-11-22. These practitioner sources support the review methods, not
the effectiveness of a particular proposed repair:

- [NN/g on cognitive walkthroughs](https://www.nngroup.com/articles/cognitive-walkthroughs/)
  describes a structured task inspection from a new user's perspective and
  distinguishes it from user testing. Our individual agent review is an
  inspection with explicit assumptions; it is not a study with customers.
- [NN/g on matching the real world](https://www.nngroup.com/articles/match-system-real-world/)
  supports familiar customer language and domain conventions. It does not imply
  that every technical term is inappropriate for every audience.
- [NN/g on flexibility and efficiency](https://www.nngroup.com/articles/flexibility-efficiency-heuristic/)
  supports efficient paths for experienced users alongside novice use. A
  particular shortcut or batch feature still needs a relevant customer task.
- [NN/g on homepage design](https://www.nngroup.com/articles/homepage-design-principles/)
  supports clear purpose, value, examples and next actions. It does not provide
  a conversion prediction for this product or a mandatory page template.
