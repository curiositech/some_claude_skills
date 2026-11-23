# Connected prose: examples and counterexamples

These are synthetic editorial examples. They show how to preserve a relation
while removing rhetorical compression. The numbers and product behaviors are
assumptions of the examples, not verified claims about a product.

<!-- humanize:ignore-start -->

## A short pair hides the failure

Before: Both read v. Each writes v+1. The counter moves by one.

After: Both workers read v before either writes, so each writes v+1. After the
two writes, the counter holds v+1 instead of the required v+2, so one increment
has been lost.

The rewrite supplies the ordering, expected value and consequence. It does not
need a closing "Neither worker was wrong" or "Timing was everything."

## A contrast replaces the mechanism

Before: This isn't about locks. It's about trust.

After: The server checks the write's epoch and rejects it if a newer holder has
already written to the resource.

The direct claim explains the action. If a real comparison with locks is needed,
state what each mechanism checks and why the difference matters for this write.

## Chopping drops the causal link

Before: We added a cache. Latency dropped.

After, if causation is established: Adding the cache reduced latency because
repeated reads could use stored results.

After, if only sequence is established: Latency dropped after we added the
cache; we have not established how much of the change came from caching.

Do not add an attractive measurement or mechanism unless the evidence supports it.

## A landing-page promise exceeds the next screen

Assume the button opens a request form and staff email a quote the next business
day. Before: Instant clarity. Zero waiting. Get your quote.

After: Request a quote. We'll email it the next business day.

The repair names the actual action and next actor. Use the timeline only when
verified; otherwise resolve the promise against product behavior first.

## A noun stack conceals an ordinary action

Before: Cross-session ownership continuity verification enables safe resumption.

After: Before resuming work, check who currently owns the file so you do not
overwrite another worker's changes.

The rewrite names the actor, action and consequence without inventing a new label.

## Keep the construction when it helps

- "Save. Close. Reopen." can be three useful instructions. A local cadence
  finding is a prompt to inspect them, not an order to merge them.
- "Now count the remaining cards" is a grammatical imperative.
- "Your account has two roles: owner and reviewer" uses a colon to introduce
  useful information.
- "Read permission does not grant write permission" makes a necessary distinction.
- "The upload failed. This means your changes are still on this device" has a
  clear demonstrative, provided the product behavior supports the claim.
- Repeated "If" clauses can make proof cases easier to compare. Keep their
  actual conditions and consequences, even when they have the same shape.
- "Submit application" is an appropriate concise button label. A button does
  not need a finite main verb and a written subject.

<!-- humanize:ignore-end -->
