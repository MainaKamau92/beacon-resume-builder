<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project knowledge base (knowledge/)

Agent-maintained wiki (Karpathy LLM-wiki pattern, OKF conventions:
markdown + YAML frontmatter, `type` field, relative links as the graph).

- **Session start:** read `knowledge/index.md`, then the last 1–2 entries of
  `knowledge/log.md`. That is the handoff — resume from its "Next steps".
- **Session end / milestone / significant decision:** append a `log.md` entry
  (`## [YYYY-MM-DD] kind | title`), update any touched concept pages and the
  index. Never rewrite history in log.md.
- One concept per file; frontmatter with at least `type`; cross-link with
  relative markdown links.
- Don't duplicate: agent instructions = stable facts & conventions;
  knowledge/ = evolving state, decisions with rationale, synthesis.
- Occasionally run a lint pass: stale claims, orphaned pages, contradictions.

**What belongs there:** decisions *with the rejected alternatives and why*,
constraints invisible at the call site, defects whose cause generalises,
current state and next steps, and synthesis across sources. **What does not:**
anything reconstructable by reading the code in two minutes — file listings,
API surfaces, what a function does, restated commit messages.

**Volatile values stay out of prose.** Counts, versions, thresholds, scores and
dates rot silently. Put them in frontmatter or tell the reader to read them
from the code; never assert them in a sentence.

**Pinned human corrections.** When the maintainer corrects something, record
the correction *and why* beside the claim so it survives the page being
rewritten. Existing pins: the AI provider is deliberately swappable (not a
considered choice); the per-template ATS scores are placeholders needing a real
basis.

## Environment (read before running anything)

Node version is not optional here — the system Node is too old and a
wrong-architecture Node on this machine fails in confusing, unrelated-looking
ways. See `knowledge/runbooks/dev-loop.md` before your first command.

## Privacy constraint

`test_docs/resumes/` and `test_docs/jds/` hold **real people's documents** and
are git-ignored. Never commit them, never paste their contents into a test, and
never send them anywhere except the app's own extraction endpoint. Regression
tests use `test_docs/synthetic/` only.
