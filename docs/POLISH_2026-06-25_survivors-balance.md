# Polish — BOO Survivors balance + UX pass (V1_305)

**Date:** 2026-06-25 · **Scope:** `Games/neon-survivors.html` only. Balance overhaul (every upgrade source audited) + 3 UX/AI features. Method: 10-agent read-only audit workflow → synthesis → adversarial verify → orchestrator-implemented with file:line evidence. Two-axis (craft × fit) re-rate at the end.

---

## 1 Audit (fan-out, evidence-cited)

Ran an 8-area read-only audit (weapon DPS, weapon reach, tomes, passives+legendaries, shrine/chest/start, boss HP, early difficulty, rarity scaling) → a synthesis spec → an **adversarial verifier** that recomputed every claim against source. The verifier caught two real errors in the first-pass spec and supplied corrected, late-safe numbers (used below):

- The proposed weapon "late-neutral" dmgScales actually **undershot** L20 by 12–37% (would have quietly nerfed late DPS). Corrected to the true late-neutral set.
- The proposed boss-HP cut was a **flat ~-33% at every timestamp** (incl. 20-min bosses), not 10-min-weighted. Corrected to trim the flat terms only, keeping the per-bossCount + timeScale growth.

**Design goals:** G1 tight balance · G2 no early faceroll (Lightning one-shot reference) · G3 don't move >10-min balance · G4 -15% start range on longest weapons · G5 ease the 10-min boss slog without gutting late bosses.

---

## 2 Changes (file:line, current → new)

### Early game (G2) — the one fix that carries the early difficulty, provably late-neutral
- **`earlyHpMult(t)`** new, beside `powerOffsetHpMult` (`:7665`); applied at the enemy HP composition (`:11900`). +45% enemy HP at t=0, linear→1.0 by 210s, **hard-clamped to 1.0 for t≥240s** (the exact point `powerOffsetHpMult` engages) ⇒ cannot touch mid/late. Bosses use separate HP formulas and are intentionally excluded.

### Weapon reach (G4, -15% start, step kept, ≤409 cap)
- Boomerang `250→213` **at BOTH** the gameplay `boom.maxDist` (`:9530`) and the display meta `range.fn` (`:21196`) — duplicated magic number, both edited or display desyncs.
- Star Field `baseRadius 240→204` (`:7851`) · Lightning `baseRange 240→204` (`:7897`) · Beam `baseRange 220→187` (`:7840`). Single-source (gameplay + meta read `def`).

### Boss HP (G5, 10-min-weighted)
- **Major** (`:13664` + ts `:13659`): base `805→560`, dropped the `1.1664→1.0` V1_253 double-stack; **kept** `bossCount*161` and the `0.30` timeScale step ⇒ **−29% @10 min, −24% @20 min** (still ~20k HP at 20 min).
- **Mini** (`:13296`): base `440→380`, `1.1664→1.10`; kept `*110` + `0.24` step ⇒ **~−12% @10 min, −10% @20 min**.

### Weapon DPS — data-driven `dmgScale` (G1/G2)
Made damage-scale data-driven: `replace_all` routed all 19 fire-fn sites + `weaponDamageAt` to `def.dmgScale ?? 0.04`, then added a `dmgScale` field only to tuned weapons.
- **Base-cut one-shotters, late-neutral** (L20 per-hit verified ±0.2%): Lightning `27→13`/`0.140`, Meteor `38→18`/`0.143`, Ghost `25→12`/`0.140`, Boomerang `19→12`/`0.094`, Squirrel `22→13`(walk `7→5`)/`0.104`, Pulse Mine `35→16`/`0.150`, Chain `13→10`/`0.068`, Ricochet `12.6→10`/`0.064`. Removes early one-shots; late DPS unchanged.
- **Floor lifts** (weak weapons → band): Energy Bolt `7.2→8`/`0.07`, Boom Box `/0.05`, Ice `/0.06`, Toxic `/0.06`.

### Tomes / shrine / rarity (G1 — nothing OP, desc text updated to match)
- powerTome `0.08→0.06`, luckTome `0.06→0.05`, attackSpeedTome `0.07→0.06`; vitality `15→18`, regen `0.8→1.0`, xp `0.10→0.12`, magnet `0.15→0.20` (lifts dead utility tomes).
- Shrine: luck `0.08→0.03` (was dispensed full-value vs halved tome luck), pickup `0.20→0.15`, critMult `0.10→0.09` (tome-consistency).
- `WEAPON_RARITY_BONUS` `{0,1,2,3,5}→{0,1,1,2,3}` (`:7688`) — the old spread instantly multiplied instance counts (epic squirrel = 3) into an early faceroll.

### Legendaries (G1/late — stop the degenerate loops)
- **shock** chance `0.10→0.06`, stun `3000→1500ms` (`:11947`), dmg `15+lvl*3→10+lvl*2` — perma-locked crowds. **burn** chance `0.15→0.12`, dmg `8+lvl*2 → min(60, 6+lvl*1.5)` (uncapped before). **holyBook** radiate `0.5→0.30`, radius `120→90`, **bosses excluded** (`:8456`) — no-cooldown free AoE was trivializing boss fights. **stillness** lifesteal `0.20→0.10`, standing heal `5→3 HP/s`.

### Late valve (G3) — the only sanctioned late-difficulty knob
- Spawn count (`:20418`): **byte-identical for the first 10 min**, then growth slows `/105→/120` so the boss-HP cuts don't make 10 min+ too easy.

### Features
- **Boss obstacle avoidance** (`moveWithAvoidance`, `:13233`): bosses tried ONE perpendicular and froze on rocks/trees. New helper mirrors the enemy slide (preferred perp → alt perp → 2 diagonals) + an unstick + push-away. Wired into Mini + Major chase.
- **Shop spawn** (`spawnShopkeeper`, `:15549`): was a 280–440px ring around the player. Now samples 40 points well out on the 8398² map, discards terrain/water/near-other-merchant, keeps the **farthest clear** candidate; first merchant min **1100px**. Robust fallback never spawns on the player.
- **Desktop HUD tooltips** (`setupHudTooltips`, `:21700` + CSS `:705`): the inline `.item-tooltip`s were clipped by the trackpad's `overflow:hidden` and pinned to the screen bottom. A body-level tooltip (escapes clipping) is positioned ABOVE the hovered weapon/tome icon; delegated on `document` so it survives HUD rebuilds; desktop-only (`hover:hover` + `pointer:fine`); inline copy suppressed when active.

---

## 3 Validation

- **Syntax:** all 4 inline `<script>` blocks parse (`new Function`). 244 insertions / 145 deletions.
- **Late-neutral proof (computed from shipped values):** base-cut weapons L20 per-hit drift: Lightning +0.1%, Meteor 0.0%, Ghost −0.2%, Boomerang 0.0%, Squirrel 0.0%, Pulse Mine 0.0%, Chain +0.2%, Ricochet −0.1%.
- **Early one-shot (t=0, basic 21 / fast 14 / swarm 8):** Lightning L1 ~13.7 → no longer one-shots basic OR fast (the reference is fixed). Ghost ~12.6, Squirrel ~13.7 likewise.
- **Boss HP (computed):** Major 7271→5179 @10 min (−29%), 26520→20075 @20 min (−24%); Mini −12%/−10%.
- **Tooltip (headless Chromium):** injected a standard `.weapon-icon`, hovered → body tooltip renders the name+desc ABOVE the icon, clamped to viewport, hides on mouseout. Screenshot captured.
- **Data-driven scale:** 19 fire-fn sites + `weaponDamageAt` read `def.dmgScale`; 12 def fields present; boomerang both reach sites = 213.

---

## 4 Re-rate (craft × fit)

| Axis | Before | After |
|------|--------|-------|
| Craft | 8.5/10 | **8.8/10** |
| Fit | 8.4/10 | **8.9/10** |

**Fit:** directly fixes every owner ask — 10-min boss no longer a slog (−29%), early game no longer a one-shot faceroll, longest weapons reined −15%, every upgrade source audited and clustered with no degenerate outliers, late game held within a tight band, bosses path around obstacles, shop is a deliberate trek, desktop tooltips work. **Craft:** evidence-cited audit + adversarial verify caught real miscalibrations before they shipped; the dmgScale refactor is data-driven (one source of truth) rather than 19 scattered magic numbers; late-neutral math is proven, not asserted.

**Blocks a 9.5:** balance ultimately wants live playtest iteration (esp. the band feel and the legendary loop-fixes). The combined early nerf (earlyHpMult + base cuts + tome/rarity trims) is intentionally large; recommend a play session before further tightening. All numbers are single-line tunable.
