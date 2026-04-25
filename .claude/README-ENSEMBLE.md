# This repo is an Ensemble project

This `.claude/` directory is managed by [The Ensemble](https://github.com/KiwiMaddog2020/claude-ensemble) — a multi-chat Claude Code orchestration system.

## Slug

`boo-website`  *(read at tool-call time by the PreToolUse hook for lock identification)*

## Files in this directory

| File | Purpose |
|---|---|
| `PROJECT_CHARTER.md` | Durable source of truth — mission, quality bar (V1_36 / V1_43 canonical), decision authority, scope. Read at the start of every significant Virtuoso task. |
| `.chat_slug` | One-line slug (`boo-website`) for hook identification. Do not edit. |
| `README-ENSEMBLE.md` | This file. |
| `worktrees/` | Local dev isolation; gitignored. Existing `CLAUDE.md` in active worktrees is authoritative for "Dev" persona details. |

## Per-Virtuoso files on the user's PC (not in this repo)

- Identity (durable, append-only log): `~/.claude/orchestrator/agents/boo-website.md`
- Status (ephemeral, heartbeat): `~/.claude/orchestrator/chats/boo-website.json`

## Re-opening a Virtuoso chat for this repo

1. `cd /Users/kevin/Documents/GitHub/BOO-Website/BOO-Website`
2. Open a fresh Claude Code chat here
3. Run `/ensemble:agent-onboard` once the plugin is installed. The chat re-reads the charter, refreshes its status, and reports in rapid-fire format. Or paste `AGENT_BOOTSTRAP.md` from the Ensemble plugin bundle.

## Safety rails — standing rules

No `git push` to `origin/main` (currently 22 commits ahead), no Firebase deploy, no force-push, no destructive ops, no changes to V1_36 / V1_43 canonical anchors or the four timing constants, no deletes of Firestore collections — without Kevin's explicit per-turn approval. See `~/.claude/projects/-Users-kevin/memory/safety_constraints.md`.

## Install / update the Ensemble

```bash
/plugin marketplace add KiwiMaddog2020/claude-ensemble
/plugin install ensemble@claude-ensemble
```
