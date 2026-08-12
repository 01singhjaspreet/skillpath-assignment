# Skillpath submission

- **Live site:** _Add the final Netlify URL_
- **Source:** https://github.com/01singhjaspreet/skillpath-assignment
- **Shared AI chat:** Not available — this Codex desktop task has no public
  conversation-sharing action. It can copy a local/account-bound deeplink or export the
  transcript as Markdown, but neither produces the public, reviewer-accessible URL the
  assignment requests.

## Short note

The hardest product decision was what to do when courses load but region detection fails.
I kept the useful catalog visible, clearly fell back to USD, and made region retry
independent. I also validated responses at runtime because a successful HTTP response can
still contain unusable data. With two more days, I would add production telemetry for the
flaky endpoints, run browser tests against a controllable mock server, and tune the hero
image from measured Netlify performance data. The state model, currency handling, and
accessibility are the strongest parts. The weakest part is that the API provides no course
artwork, so the poster treatments are generated from course codes rather than real media.

## AI disclosure

I first used Figma Make to create the initial visual scaffold. I then used OpenAI Codex to
inspect the assignment, redesign and implement the production page, generate the original
hero image, build the API state model, add tests, and perform responsive browser QA. I
made the product decisions, including the explicit USD fallback, learner-facing category,
configuration controls, and final visual direction, and verified the implementation rather
than accepting generated output unchecked.

### Design reference

I supplied [master.dev](https://master.dev/) as a visual reference. Master is a design
education platform whose site uses editorial-scale typography, dark high-contrast
surfaces, photographic storytelling, and course cards with distinct poster-like identities.
It was used as a mood and quality reference—not as a template, source-code source, or a
page to copy. Skillpath's layout, brand, imagery, card system, copy, states, and responsive
behavior were created for this assignment.

### Prompts used

The meaningful prompts and directions were:

1. “Complete this assignment to the highest quality. Ignore Framer; we will deploy it on
   Netlify.”
2. Build a polished Skillpath landing page inspired by master.dev: a full-bleed
   photographic hero, dark creator-focused course catalog, compact footer, live resilient
   API states, regional pricing, search, sorting, accessibility, responsive layouts, tests,
   GitHub publishing, and Netlify configuration.
3. “Use shadcn for all primitive components. You may add custom styles, but they should be
   based on shadcn.”
4. Generate an original, natural-looking wide hero photograph of a confident young South
   Asian creator/educator recording a lesson in a dark studio, with the subject on the
   right and negative space on the left for the headline; no logos or embedded text.
5. Fix the final mobile polish issues: clean text truncation, equal search/sort control
   heights, and no button position shift on hover.

The original assignment text and normal implementation/debugging exchanges were also
provided as context. The prompt requesting a public conversation link cannot be fulfilled
inside this Codex desktop task because the menu shown for this task offers Copy, Copy
deeplink, and Copy as Markdown, but no public Share action. A copied deeplink only opens
for an authorized local/account context; a Markdown export is a file, not an independently
hosted conversation URL.
