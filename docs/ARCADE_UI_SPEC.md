# BOO Arcade — canonical UI spec (Kevin-approved, V1_503–V1_511)

Applies in every game (reference frame 640x718; phone 387x435; compact = frame <= 420px tall).
All DOM sizes below are at --ui-zoom 1 (the existing zoom rule scales them up on big frames).
Exceptions: Clyde keeps its intro/THE STORY flow and its own GAME OVER screen (but with canonical
buttons/styles); Survivors keeps its extra menu buttons (ACHIEVEMENTS, UPGRADES), level select,
settings gear, RESULTS screen and STATS in pause — but uses the shared visual language.
Hidden Space Shooter: out of scope.

## 1. Start menu
- Overlay: rgba(0,0,0,.95), centered column (justify-content: safe center), z-index 2000.
- Title: Oxanium 400, 40px, letter-spacing 4px, #0ff, glow `0 0 30px <accent>, 0 0 60px <accent>`
  (keep each game's own accent colour), margin-bottom 10px. Phone (<=500px wide): 30px / 2px.
  Compact: 26px / 2px.
- Subtitle: 16px #f0f, glow 15px, margin-bottom 40px. Phone 14px / mb 30px. Compact 12px / mb 14px.
- Buttons (.menu-btn): 164px wide, 39px tall (padding 10px 20px), 13px bold, letter-spacing 1px,
  uppercase, 2px outline border, radius 6, box-shadow 0 0 8px <color>, NO text-shadow, gap 15px.
  Phone: identical (no shrinking to 140px). Compact: 150x32, 12px, gap 8px.
- Order + colours: START GAME #0ff, HOW TO PLAY #f0f, LEADER BOARD #ffcc00.
  Survivors appends ACHIEVEMENTS #9b30ff, UPGRADES #c04dff (keeps its compact grid).
  Clyde: START GAME / THE STORY / LEADER BOARD.
- After a run the first button reads PLAY AGAIN (hover/primary may be filled cyan). No DIG AGAIN /
  TRY AGAIN variants.

## 2. Corner buttons (DOM only — no canvas-drawn corner buttons)
- 36x36, top 6px; slot 1 left 6px = MUTE (always, on menus AND in play, never hidden behind
  an overlay: z-index above the menu, e.g. 2500); slot 2 left 48px = PAUSE during play
  (Survivors: ⚙ settings takes slot 2 on its menu).
- Style: 2px solid rgba(0,255,255,.55), radius 6, background rgba(0,0,0,.7), glyph 18px #0ff
  (🔊 / 🔇, ⏸ / ▶). Compact: 30x30, top/left 4px, slot 2 at left 38px, glyph 15px.
- While a full-screen overlay with its own header is open (how-to-play, leaderboard, score modal,
  shop), corner buttons must not overlap its header (inset headers or hide the pause button).
- In parent fullscreen (body.parent-fs) the game's own pause/mute hide and the parent pane
  (index.html) takes over — pane order is mute first, pause second, same as in-game.
- Top-right corner is reserved for the parent ⛶, which since V1_514 sits INSIDE the frame
  there (36x36, inset 8px desktop / 6px phone; was parked outside the box by V1_491).
  Game-specific canvas controls like TD speed/EXIT stay — they sit inboard of the corner.

## 3. Pause menu (P, Escape, or the ⏸ button; auto-pause on tab hide)
- Backdrop rgba(0,0,0,.92). Game fully frozen (timers too). Music ducks via isPaused.
- Title "PAUSED": game-title style (40px / 30px phone / 26px compact, #0ff, the game's accent glow).
- Buttons (.menu-btn style, 164x39, gap 15): RESUME #0ff, LEADERBOARD #ffcc00,
  [STATS #9b30ff — Survivors only], EXIT GAME #ff3366.
- EXIT GAME → confirm box "Exit to main menu?" with YES (#ff3366) / NO (#0ff) → start menu.
- LEADERBOARD opens the canonical leaderboard; closing it returns to the pause menu.
- Optional hint line "P / ESC to resume" 12px #0ff .7 under the buttons — include it in every game.

## 4. Score modal (after game over)
- Open full-frame overlay rgba(0,0,0,.92) (not a boxed card).
- Rank title 38px bold #ffcc00 with glow: "👑 YOU'RE #1 👑" / "TOP 10!!" / "HIGH SCORE" /
  otherwise "GAME OVER". Stat line 26px #0ff ("Score: N"), optional secondary line 16px.
- Label 14px "Enter your name for the leaderboard:"; input 200x43, 2px #0ff, radius 8,
  placeholder "YOUR NAME", uppercase.
- Buttons: SUBMIT (#00ff88 outline) then SKIP (grey #888 outline), 40px tall, radius 8, 14px,
  uppercase. Enter submits.
- Then → start menu with PLAY AGAIN (Survivors: RESULTS screen → CONTINUE → menu with PLAY AGAIN;
  Clyde: its own GAME OVER screen with PLAY AGAIN / THE STORY / LEADER BOARD).

## 5. Leaderboard
- Open layout, container 500px max (90% on small frames), title "🏆 TOP 100" 32px 700 #ffcc00
  (26px phone, 22px compact). Clyde keeps "🏆 TOP DOGS 🏆". TD keeps its mode tabs.
- List panel rgba(10,10,20,.8), 2px #333, radius 12, rows ~41px, gold/silver/bronze top 3.
- Close ✕ = canonical ✕ (below) at the right end of the header row.

## 6. How to play
- Box 500px max, 2px #0ff, radius 15, 135deg dark gradient.
- Header row: "📖 HOW TO PLAY" 24px letter-spacing 2px #0ff left-aligned, canonical ✕ right.
- Step title 20px #f0f; body 14px.
- Nav: "← PREV" / dots (10px) / "NEXT →" — outlined #0ff, 14px, ~101x40, radius 5
  (disabled PREV dimmed). Last step NEXT reads "GOT IT".
- Clyde keeps THE STORY instead.

## 7. Canonical ✕ (all overlays)
- 40x40 circle (32px compact), 2px solid #ff6666, transparent bg, glyph 20px #ff6666; hover
  fills rgba(255,102,102,.2). Always the last item in the header row, vertically centred on the title.

## 8. Upgrade overlays
- Already unified; TD .upgrade-title 28px → 27px.
