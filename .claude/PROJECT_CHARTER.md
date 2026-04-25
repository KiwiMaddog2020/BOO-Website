# PROJECT CHARTER — Bunch of Others (BOO) Website

> Charter version: 1.0 | Last updated: 2026-04-22 | Maintained by: Kevin | Ensemble slug: `boo-website`

This charter is the durable source of truth for this repo. Every Ensemble Agent working on BOO reads this at the start of every significant task. Existing worktree-scoped `CLAUDE.md` files (e.g. `.claude/worktrees/*/CLAUDE.md`) remain valid for worktree-local dev guidance but do not override this.

---

## 1. Identity

- **Slug:** `boo-website`
- **One-line description:** Single-page psychedelic website for Bunch of Others (BOO) — a Kelowna-based rock band — with a 7-game HTML5 arcade and Firebase leaderboards.
- **Repo path:** `/Users/kevin/Documents/GitHub/BOO-Website/BOO-Website`
- **Primary contact:** Kevin (project lead, sole developer)
- **Live:** https://bunchofothers.com

## 2. Mission & Users

BOO formed in 2024 after Jeff discovered his late brother Kyle's (Fields of Green frontman) unreleased recordings. The website serves as the band's digital home — showcasing the story, music, arcade entertainment, and discovery pathways to streaming services.

- **Primary users:** fans and new discoverers.
- **Secondary users:** band members sharing links; future press / booking contacts.

## 3. Quality Bar — Apple-Caliber

**"We live in the details."** Pixel-level and percentage-level feedback is the norm. Psychedelic visual complexity, balanced with clean readability.

**Proud examples (canonical anchors):**
- **V1_36** — white title outlines, centered sections (5rem padding), wavy flutter overlay, smaller medium icon. Kevin's favorite.
- **V1_43** — pill music player, synced nav hover animations, restored logo glow/breathing, seamless black fades, smaller photo tiles with scale hover. Kevin's favorite.

**Embarrassing:** chaotic overlays, broken mobile, Safari failures, UTF-8 encoding corruption, dead code accumulation, unrequested "cleanup" passes.

**Explicit non-goals:**
- No frameworks (vanilla HTML / CSS / JS only)
- No dependencies beyond Firebase Firestore + GA4
- No Bebas Neue in new work (historical only)
- No version-suffixed HTML backups (`index_V1_XX.html` retired — git tags replace this)
- No iOS Fullscreen API (pseudo-fullscreen via CSS only; Fullscreen API is unreliable on Safari)

## 4. Stack & Tooling

| Layer | Choice |
|---|---|
| Frontend | Vanilla HTML / CSS / JavaScript |
| Graphics | HTML5 Canvas (games) |
| Backend | Firebase Firestore (leaderboards only) |
| Analytics | Google Analytics 4 — `G-ELVHNXC9MJ` |
| Hosting | GitHub Pages |
| VCS | Git + GitHub Desktop (Windows) |
| Local dev | `python3 -m http.server 8000` (or `devserver.py` in active worktree) |
| iOS port | Xcode (beta, iOS 26.2 runtime), SpriteKit (Brickbreaker port, in progress) |
| Fonts | Tilt Neon (titles), Oxanium (body), Exo 2 (UI), Orbitron (games), Poppins (nav) |

## 5. Conventions

- **SURGICAL EDITS ONLY.** Modify exactly what's requested — nothing more. Preserve ALL existing values, animations, features. Flag ripples. Never "clean up" unrequested code.
- **Changelog-style proposals** before multi-line implementation changes. Side effects called out.
- **Commit format:** `[V1_XX] <brief description>` — e.g. `[V1_57] Tighten bio scroll touch-action on iOS`.
- **Branch strategy:** `main` only. No feature branches unless explicitly experimental.
- **Tags:** significant releases tagged `v1_XX`.
- **Encoding:** UTF-8 only. Avoid box-drawing characters (`├──` etc.) in committed files.
- **Timing values (do not change without explicit approval):**
  - Overlay fade: `0.25s`
  - Scroll cooldown: `550ms`
  - Content slide-in: `0.35s` / `20px`
  - Scroll-snap on `html`

## 6. Scope & Boundaries

- **In scope:** UI polish, mobile stability, browser compatibility, arcade refinement, Firestore schema maintenance, accessibility touch-ups, iOS port work in its own lane.
- **Out of scope:** switching to a framework; adding runtime dependencies; rewriting the visual system wholesale.
- **Off-limits / don't touch without explicit direction:**
  - V1_36 and V1_43 canonical visual anchors — reference baselines for drift checks.
  - The four timing constants in §5.
  - Firestore collection schemas (`highscores`, `survivors_scores`, `towerdefense_scores`, `neondig_scores`, `snake_scores`, `clydes_jump_scores`, `spaceshooter_scores`) — schema changes = explicit menu + approval.
  - `G-ELVHNXC9MJ` GA ID.

## 7. Decision Authority

- **Ship solo (no approval needed):** typos, known-bug fixes that restore documented behavior, Kevin-requested values applied as-is, committing and pushing changes Kevin has already approved, `[V1_XX]` formatted commits.
- **Requires Kevin's approval (menu + approval word):** any change affecting design anchors, animation timings, arcade architecture, Firestore schema, fonts, new dependencies, structural HTML/CSS refactors.
- **Never without explicit go-ahead:**
  - Breaking the V1_36 or V1_43 canonical baselines
  - Pushing to `main` changes that weren't approved
  - Force-push
  - Deleting Firestore collections or documents
  - Changing the GA4 `G-ELVHNXC9MJ` ID
  - Introducing a build step, bundler, or framework

**Approval signals Kevin uses** (from existing CLAUDE.md):
- `1`, `go`, `yes`, `y`, `ok`, empty reply → apply the recommendation.
- `skip`, `s` → defer.
- Free text → override.

*Note: per the Ensemble Agent contract (`ENSEMBLE_AGENT.md` §2), multiple-choice decisions should use the `AskUserQuestion` tool (click-button) rather than text-format numbered options. The approval signals above still apply to free-text acknowledgements.*

## 8. Risk Posture & Release Cadence

- **Cadence:** direct push to `main` on approval, per-change. Related micro-changes grouped into one commit.
- **Breaking changes:** none — this is a live fan-facing site. Mobile stability is non-negotiable.
- **Rollback:** `git revert` + push. Previous version anchors stay tagged for reference.
- **Feature flags:** none.

## 9. Performance Budgets

- Mobile GPU memory is a real constraint on canvas-heavy pages. Strip hue-rotate and heavy filters on mobile.
- Safari: avoid `text-stroke` animation on mobile H1.
- Chrome/Chromium desktop: reduced overlay complexity; mobile GPU fixes.
- Lazy loading with 300px preload margin for images.
- Target device for mobile testing: **Kevin's OnePlus 13R (412px CSS viewport)** — test against this first.

## 10. Security & Compliance

- Firestore rules (all leaderboard collections): `name` string 2–12 chars, scores int ≥ 0, **no updates, no deletes**.
- No PII collected beyond player-entered names.
- No auth (leaderboards post anonymously).
- GA4 analytics only (no third-party trackers).

## 11. Accessibility

- Readable layout balance (psychedelic but not chaotic).
- Keyboard navigation on lightbox and games.
- Touch targets sized for OnePlus 13R (412px viewport).
- Color contrast checked against neon palette on dark backgrounds.

## 12. Observability

- GA4 events for engagement and arcade starts.
- Firestore console for leaderboard health.
- Manual cross-browser testing during dev.
- No APM or error-tracking beyond browser console.

## 13. Stakeholders & Deadlines

- **Kevin** — sole developer, design lead, final decision authority.
- **Band members (Jeff, Joe, Johnny, Shawn)** — review site updates, provide content (photos, music, videos).
- **Active near-term work:**
  - iOS App Store release of Neon Brickbreaker (Swift/SpriteKit port) — gated on Xcode beta runtime compatibility.
  - `PAYMENT_PLAN.md` in the `lucid-nightingale-0c1878` worktree — merch payment flow in progress; status needs confirmation.
  - Ongoing mobile polish and cross-browser testing.
- **External deadlines:** none unless a show or release drives one — flag at the time.

## 14. Open Questions

- **PAYMENT_PLAN.md status** — still active dev? Target launch date? Stripe vs. alternative?
- **iOS Brickbreaker** — target App Store submission window?
- **22 local commits** on `main` not pushed to `origin` — any reason to hold, or push at next safe window?
- **Worktree CLAUDE.md content** (`.claude/worktrees/*/CLAUDE.md`) — absorb into this charter, or keep separate for per-worktree details?

---

*Per ENSEMBLE_AGENT.md §3 (Single Source of Truth): this charter is the authoritative per-project contract. When anything here conflicts with a worktree-local doc, this wins for repo-wide decisions.*

---

## Plugin migration pending (2026-04-23)

The Ensemble is transitioning from a self-hosted `~/.claude/orchestrator/` install to a Claude Code plugin. The refactor work is on the `plugin-refactor` branch at `github.com/KiwiMaddog2020/claude-ensemble`; merge to `main` is awaiting Kevin's review.

**After cutover, paths change:**

- Bundle (templates, scripts, skills) moves: `/Users/kevin/.claude/orchestrator/{templates,bin,skills}/...` → `${CLAUDE_PLUGIN_ROOT}/...`
- Writable state (state.json, chats/, charters/ fallback, briefings/, queue/, pulse/, runs/, agents/, lock_steals.log, work_hours.json) moves: `/Users/kevin/.claude/orchestrator/...` → `${CLAUDE_PLUGIN_DATA}/...`

**What stays here in this repo (no change):**

- `.claude/PROJECT_CHARTER.md` (this file)
- `.claude/.chat_slug`
- `.claude/README-ENSEMBLE.md`
- Any worktree-local `CLAUDE.md`

**What changes for the Virtuoso in this chat:**

- Slash commands `/ensemble:maestro` and `/ensemble:agent-onboard` replace paste-in bootstrap prompts.
- Hooks are declared in `plugin.json` rather than `~/.claude/settings.json` — re-install surfaces `[ORCHESTRATOR] hard-enforcement active` on SessionStart same as before.

**No action required from this Virtuoso** until Kevin signals cutover complete. See `~/.claude/orchestrator/docs/PLUGIN_REFACTOR.md` for full plan.
