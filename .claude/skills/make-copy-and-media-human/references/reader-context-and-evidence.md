# Reader context and evidence families

Load this file when distinguishing kinds of evidence, diagnosing placeholder
content, or deciding how an explanation fits its audience.

## The six families

Findings carry a `family`, and the family tells you how much to trust the
finding. This matters more than severity.

`residue` covers unconverted citation tokens, tracking parameters, and leaked
assistant boilerplate. Verify their context before removing them: examples and
quotations can contain these deliberately. Unicode spacing belongs to typography,
not provenance. U+202F is used in French locale formatting; preserve meaningful
spacing and script joiners unless a concrete rendering defect requires repair.

`form` covers grammatical patterns and editorial comprehension rubrics. Some
patterns have measured effect sizes, like participial
tails at 5.3 times the human rate or nominalizations at roughly twice. Humans do
these too, so read the `false_positive_when` line before you cut.

`rhythm` covers punctuation and sentence-length habits. Weak on their own, real
against a baseline. This is where false accusations come from.

`shape` covers document assembly: heading density, bullet colonization, rules
between every section, the obligatory future-directions block. Usually safe to
act on, because the fix improves the document regardless.

Weight `form` and `shape` over the phrase-level items when the two disagree. The
largest community analysis of what makes writing sound like AI concluded against
its own premise on this, finding cosmetic tells mostly noise. The quantitative
version is stronger still: a study of 61,608 stories separated human from
generated fiction at 93.2% macro-F1 using discourse-level narrative features
alone, with every stylistic cue stripped out. Structure survives a model that has
learned not to say "delve". Phrases do not.

`code` covers engineering artifacts. The highest-precision checks here are all
relative, comparing a change against the repo's own log, idiom, and PR norms.
A contributor who read the surrounding code passes them automatically.

### Declared but not wired

A useful interaction-risk pattern is a visible affordance whose failure behavior
was never tested. Static source can contain an Escape handler without proving
that Escape closes the modal, restores focus, or works in the relevant state.
The catalog includes a browser-trial study of this gap; its numerical claims
were not live-verified in this research pass, so they are not a calibrated
severity threshold here.

So when auditing anything interactive, ask of each affordance whether its label
is present without its behaviour. A sort caret with no `aria-sort`. A disabled
button with no reason. A `<dialog>` written but opened with `.show()` rather than
`.showModal()`. An `onMutate` with no `onError`. A "Last 30 days" label with no
range control. Two related shapes travel with it: the interface that is a
one-to-one rendering of the data model rather than a designed view (every column
a column, every config key a switch), and the content whose cardinality exactly
equals a layout constant (four cards because the grid has four columns).

These patterns locate missing behavior. They do not distinguish a model
author from a human author who did not test the interface.

`defect` is the odd one out, and the most useful. These are not inferences about
who built something; they are things that are broken. The page scrolls sideways
at 390px. The button is not a button. The grey text fails contrast. You reproduce
them by opening the page, so they carry no fairness caveat at all and you act on
them with full confidence. Work this family first: a site that does not work on a
phone has a bigger problem than a site that reads a bit generated.

`defect` findings share their standing with one more class that sits outside the
families and outranks everything. Citation pathology is about truth rather than
authorship: a dead DOI, a reference that
does not support its sentence, a statistic with no study behind it. Check those
with complete confidence, because you are verifying a claim rather than inferring
an author. It is the highest-yield check in the skill and it has no fairness cost.

## Placeholder copy produces placeholder layout

For web pages the taste findings and the content findings are one family, and
the arrow runs in a direction worth knowing. Underspecified input gets answered
with the statistical average of every page on the internet, and the average page
is mediocre. Ask for a landing page without giving it real content and it invents
placeholder copy, and placeholder copy forces placeholder layout.

That explains the tells together rather than separately. The eyebrow is empty
because the template has an eyebrow slot and nothing true was available to fill
it. The hero has no image because there is no product to photograph. The grid has
three cards because three is what you pick when the number of real things is
unknown. The pull quote quotes nothing because a quote is a provenance relation
and there was no document to pull from.

So the fix usually runs upstream of the design. Supply the real content, and most
of the layout problems stop being layout problems. When you cannot supply it,
that absence is the finding, and a page that admits it beats a page that fills
the gap with a gradient.

## Ask what the reader already knows

Expository writing fails in ways sentence-level review never catches. A blog post
touts improvements over a v2 nobody saw. Internal codenames arrive unglossed. A
term of art is used three times and defined never. Everything is explained at the
same depth, so nothing is signposted as hard.

It is tempting to call these one failure, and I did until the evidence said
otherwise. There are three mechanisms, and they need different fixes.

**Context leakage.** The model writes from its context window, which holds the
previous versions, the internal thread and the repository, and nothing in the
loop marks which parts the reader was present for. It treats availability as
sharedness. This is the curse of knowledge with a machine behind it, and it is
the family `unearned-prior-reference`, `repo-context-leak` and
`definition-after-use` catch. **Fix it with a referent audit:** for every back-
reference, name, and term, check that the thing it points at exists on the page.

**Altitude lock**, and this is the one that breaks the tidy story. When the
audience is stated explicitly in the prompt — so the model has been told what the
reader knows and the context confusion is gone — it still fails. Explanations
generated for different stated audiences come out indistinguishable in reading
level, and match their intended level about half the time against roughly
four-fifths for human-written ones. **Prompting the audience does not fix this.**
The author has to supply a depth plan: which two ideas are hard, which get a
worked example, which get one sentence.

**Template completion.** The structure is announced rather than built, the
promised idea never arrives, the release notes wear an essay's clothes. Form
before content, which is the `shape` family. **Fix it by deleting the scaffold.**

The diagnostic, when you want one question: **could a competent stranger who
arrived from a search result follow this, and where is the first place they would
have to stop and look something up?** That spot is the fix. But note it only
surfaces the first family reliably — altitude lock produces prose a stranger can
follow and learn nothing from, so for that one ask instead which two things here
are hard, and whether the piece spends more time on them than on the easy parts.
