# A performance budget a designer can hold, and the folklore to drop

Two things in one file, because they are the same argument. The budget is what a
designer can spend before they spend it. The folklore section is the numbers
people quote instead of a budget, most of which are wrong, out of date, or about
something else.


## Before you quote a number

Half this file is numbers you can use and half is numbers to stop repeating. This decides which you are holding.

```mermaid
flowchart TD
    A(["About to quote a performance number"]) --> B{"Is it on the folklore list?"}
    B -->|yes| C["Do not use it"]
    C --> D["Lighthouse score as a proxy for speed:<br/>43% of pages scoring 90+ fail a<br/>Core Web Vital in the field"]
    C --> E["Per-KB parse-time constant:<br/>V8 retired it in 2019"]
    C --> F["Shared font cache across sites:<br/>cache partitioning killed it in 2020"]
    C --> G["'AI sites are heavier':<br/>no published measurement exists"]
    B -->|no| H{"Is it a BUDGET you can check<br/>without a profiler?"}
    H -->|yes| I["Use it. Frame it as a SIZE:<br/>'the hero is 200 KB' is the same kind<br/>of constraint as 'the hero is 1600px'"]
    H -->|no| J["Measure it, or say UNREVIEWED"]
```

## The budget

Every number here is a *design* constraint — something you can check in a design
review, without opening a profiler. The framing that makes a designer hold it:
these are not engineering numbers, they are **sizes**. "The hero is 200 KB" is
the same kind of constraint as "the hero is 1600px wide" or "the headline is
56px". Put them on the same artboard.

| Constraint | Budget | Why this number |
|---|---|---|
| LCP image | **≤200 KB**, AVIF or WebP | The LCP element is an image on 85% of desktop and 76% of mobile pages. At a P75 network of 9 Mbps and 100 ms RTT that is about 180 ms of transfer, which fits inside roughly 40% of a 2.5 s LCP budget. The median *largest* image on the web is 135 KB, so 200 KB is generous, not austere. |
| All images | **≤600 KB** | The median page ships 911 KB (mobile) / 1,058 KB (desktop) of images. 600 KB sits comfortably below that while leaving room for a hero plus a dozen supporting images at modern-format sizes. |
| Total page weight, first load | **≤1.2 MB** compressed, mobile | The conservative end of the 3-second budget for a JS-heavy page on a P75 device. The median mobile page is 2,559 KB; p90 is 8,337 KB. |
| JavaScript | **≤300 KB** compressed | The JS-light 3-second budget is 0.3 MiB. Median mobile pages ship 632 KB, of which a median **251 KB is never executed** — so 300 KB is roughly "the median page minus the waste". For a brochure site, 50 KB is the honest target. |
| Font families | **≤2** | The median page ships 3–4 font requests and 122 KB of fonts. Two families is where a typographic system starts; three is where it starts costing. This one is a judgement rather than a measured threshold, and saying so is part of using it. |
| Font faces | **≤4 total**, ≤122 KB | Median font file is 35–36 KB compressed, p90 about 115 KB. Four faces at the median is already above the median page's entire font budget — so four is the point at which you are above average, not a target. |
| Third-party origins | **≤3** on a marketing page | The median mobile page makes 79 third-party requests. Three origins is a hard constraint that forces a conversation each time a fourth is proposed, which is the entire point of a budget. |
| Third-party JS | **≤150 KB**, none render-blocking | A consent manager alone can exceed 200 KB and add half a second on mobile. Only 13–15% of pages pass the render-blocking audit, so "none blocking" already puts you in the top sixth of the web. |
| Render-blocking resources | **1**, same-origin | Same source. The single highest-leverage structural constraint on this list. |
| Video | **≤2 MB**, poster-first, never autoplay on cellular | Median video bytes are 384 KB on mobile and rising; a typical unoptimised 1080p hero loop is 8–15 MB. A 2 MB ceiling forces 720p and a short loop, both of which are the right answers. |
| Layout shift | **≤0.1**, no single shift >0.05 | 0.1 is the "good" threshold and most pages already pass it. The per-shift sub-budget is what makes it actionable in review, because it names the one element that broke it. |

**If someone needs the business argument**, use an A/B test rather than a
correlation: Vodafone measured a 31% LCP improvement against **8% more sales**,
15% better lead-to-visit and 11% better cart-to-visit. The two changes they name
first are moving rendering to the server and resizing the hero image — which are
the first and the twenty-second entries in this lane.

## What is folklore

Ten claims that circulate as performance wisdom. Several are real findings
misapplied; several have no source at all. Dropping them costs nothing and makes
the rest of the advice credible.

**"53% of users abandon a site that takes over 3 seconds."** Real — Google, 2017
— but it is about *load time*, and it is constantly relabelled as being about
*page weight* ("pages over 3 MB have a 53% bounce rate"). That mutation has no
source. It is also measured on 2016-era mobile networks and cited as current.

**"Every 100 KB of JavaScript adds ~350 ms of parse time."** The circulating
numbers — 350 ms, 150 ms, 50–80 ms — descend from 2017–2018 posts, and the 2019
V8 follow-up says parse and compile are *no longer* the dominant cost; download
and execution are. JavaScript is still disproportionately expensive on low-end
phones, but the per-KB parse constant is folklore. Budget JS bytes; do not quote
a parse-time constant.

**"Hosted fonts are fast because everyone already has them cached."** Dead since
2020, when browsers partitioned the HTTP cache by top-level site specifically to
close that cross-site tracking vector. Every site now pays the full download, and
the cross-origin connection cost is real and additional.

**"A Lighthouse score of 90+ means the site is fast."** 43% of pages scoring 90+
in Lighthouse failed one or more Core Web Vitals thresholds in the field.
Lighthouse is a lab simulation on a fixed emulated device; field data is what
your visitors experienced. Chrome's own documentation says a perfect 100 is "not
expected". **Use Lighthouse to find causes; use field data to decide whether
there is a problem.**

**"The Lighthouse Performance score is a ranking factor."** It is not. Core Web
Vitals field data is a small ranking signal; the Lighthouse composite is not, and
never was.

**"Framework X is fast / slow."** Be careful. Two SEO blogs published months
apart give flatly contradictory pass rates for the same framework — one at 31%
mobile, the other at 58% — and both are almost certainly generated content citing
each other. Technology cohorts differ enormously in what kind of sites use them,
and the only defensible statement is architectural: **shipping less JavaScript
makes pages faster, and frameworks differ in how much JavaScript they make it
easy to ship.** "Framework X is slow" is not defensible.

**"Minify and compress and you're done."** Brotli is worth 15–20% over gzip on
text and is essentially free, so take it. But the median page's problem is 911 KB
of images and 251 KB of JavaScript that never executes, and compression does not
touch either. Deleting the unused dependency beats compressing it.

**"Lazy-load your images."** Correct below the fold and actively harmful for the
LCP one — never lazy-load the LCP image. 16–17% of pages get this exactly
backwards, because the advice circulates without its exception.

**"A perfect score requires removing analytics, fonts and images."** The fatalist
inverse of score-chasing, and it excuses inaction. The measured reality is that
the biggest wins are usually one image and one script.

**"AI-generated sites are heavier — there's data."** **There is not.** What
exists measures AI-*adjacent* signals — builder subdomains, the spread of the
indigo palette across the open web — and explicitly does not measure page weight
for AI-built pages. What circulates instead is marketing copy asserting "3–5 MB
of JavaScript" with no methodology and no sample, recycling the mutated 2017
statistic above. **The mechanism is well understood and every individual tell in
this lane is measurable on any given page, but the population-level claim is
unmeasured. Say "unreviewed", not "AI-generated".** That is also the more useful
finding, because it is the one the reviewer can act on.

## Who feels what

The brief behind this lane asked which of it is *felt* and which is a score
people chase. The honest split:

**Felt.** The blank screen — a flash of invisible text, a blocking head, an empty
app shell. The content jumping under your thumb. The hero arriving in three
stages on cellular. The tap that does nothing for half a second, which is
overwhelmingly a phone problem: mobile passes the interaction metric at 77%
against desktop's 97%.

**Chased.** The composite lab score, and specifically the habit of optimising the
lab run — because the lab run is the thing you can see, and field data takes 28
days.

**Neither, and this is the interesting category.** Total page weight. Nobody
perceives 8 MB directly. They perceive its consequences, unevenly, depending on
their device and their network — which is why it is better described as an
inequality gap than as a performance problem. The visitor on a mid-range Android
experiences a different website from the one in the design review.

That asymmetry is the whole argument for a budget rather than a score. A score
tells you where you landed. A budget tells a designer what they can spend, before
they spend it.
