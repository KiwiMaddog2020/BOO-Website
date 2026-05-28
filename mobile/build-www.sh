#!/usr/bin/env bash
# build-www.sh — Sync canonical web assets into the Capacitor www/ directory.
#
# Single source of truth: ../Games/, ../Images/, ../Music/ in the BOO-Website
# repo root. This script wipes and re-copies those three directories into
# mobile/www/ before each iOS/Android build, so the native app and the web
# site always ship the exact same game files.
#
# Run via:  npm run build   (from mobile/)
#           or directly:  bash build-www.sh
#
# What is NOT copied:
#   - The band site's index.html (the arcade has its own menu shell)
#   - PAYMENT_PLAN.md, README.md, CLAUDE.md (docs)
#   - .git, .claude, _unused, devserver.py, success.html, cancel.html
#   - The cancel/success Stripe redirect pages (web-only)

set -euo pipefail

# Run from mobile/ regardless of caller's cwd
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

REPO_ROOT="$(cd .. && pwd)"
WWW_DIR="$SCRIPT_DIR/www"

echo "[build-www] Repo root: $REPO_ROOT"
echo "[build-www] www target: $WWW_DIR"

# Ensure www/ exists
mkdir -p "$WWW_DIR"

# Wipe synced directories (preserve hand-authored files like index.html,
# menu.css, menu.js, splash assets, app icons).
for dir in Games Images Music; do
    target="$WWW_DIR/$dir"
    if [ -d "$target" ]; then
        rm -rf "$target"
        echo "[build-www] Wiped $target"
    fi
done

# Copy canonical assets
for dir in Games Images Music; do
    src="$REPO_ROOT/$dir"
    target="$WWW_DIR/$dir"
    if [ -d "$src" ]; then
        cp -R "$src" "$target"
        count="$(find "$target" -type f | wc -l | tr -d ' ')"
        echo "[build-www] Copied $dir ($count files)"
    else
        echo "[build-www] WARN: $src does not exist; skipping"
    fi
done

# Sanity check: did the menu shell and games make it?
if [ ! -f "$WWW_DIR/index.html" ]; then
    echo "[build-www] ERROR: $WWW_DIR/index.html missing — author it before building." >&2
    exit 1
fi
# Verify EVERY game file synced — a renamed/missing game would otherwise ship
# a 404 black-tile iframe in the app, with a green build (V1_171).
GAMES="neon-brickbreaker neon-survivors neon-tower-defense neon-dig neon-snake clydes-big-jump neon-space-shooter"
for game in $GAMES; do
    if [ ! -f "$WWW_DIR/Games/$game.html" ]; then
        echo "[build-www] ERROR: Games/$game.html not found in www/ after sync." >&2
        exit 1
    fi
done

echo "[build-www] Done. www/ is ready for 'npx cap sync'."
