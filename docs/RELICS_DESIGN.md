# RELICS — Megabonk-style item system for BOO Survivors (V1_434+)

Kevin's brief: "change out our chests for megabonk style upgrades (think moldy cheese).
we need a full fledged system in this regard, scored against megabonk" — overnight
/goal loop to 90/100 where 100 = a full Megabonk-class item system.

CLAUDE.md carries the always-current summary; in-file registries are the truth.

## 1. What relics are

Run-local passive items with rarities, stacking, tradeoffs and synergies — the third
axis of build identity next to weapons (damage) and tomes (stats). Flavor: band-tour
junk — the stuff that accumulates in a van after 200 shows. Relics reset every run
(VS/Megabonk semantics); the meta layer (plasm shop, achievements) is untouched.

## 2. Drop source — chests, surgically

`acceptChestOffer()` keeps its exact precedence ladder:
1. `isEvolution` (V1_417 ceremony) — UNTOUCHED, still wins the chest
2. `isPotReward` / `isDirectiveBlessing` — UNTOUCHED
3. **everything else — was weapon/tome/legendary roll → now a RELIC roll**

Gold cost + escalation (double to 1000 then +50%), `runChests++`, `META.notify('chest')`
(the `lucky` achievement) all unchanged. The chest slot-reel reveal is reused as the
relic ceremony. Chest-sourced LEGENDARY_UPGRADES rolls are removed (legendary
upgrades keep their non-chest sources); the legendary RARITY tier below replaces that
excitement beat. Elite/boss drops stay plasm shards — one currency per corpse.

## 3. Registry schema

```js
const RELICS = {
  moldySandwich: {
    name: 'Moldy Green Room Sandwich', icon: '🥪', rarity: 'common',
    flavor: 'Week three. Still edible. Probably.',
    desc: '+6 Max HP', maxStacks: 8,
    // one of: stat fold (collected by recomputeRelicStats -> applyPassives
    // extension point) OR event hook id (single chokepoint each)
    stats: { maxHp: 6 },
  }, ...
};
```

- **Stat relics** fold into ONE `relicStatTotals()` collector consumed by
  `Player.applyPassives` at a single extension point. Attack-speed and crit-damage
  contributions enter the **V1_416 permanent lane** (through the knees); everything
  else is linear like tome passives. NEVER a second stat pathway.
- **Event relics** hook exactly one existing chokepoint each (takeDamage, dash,
  gold pickup, XP gem spawn, level-up offer build, death check). No polling, no
  per-frame work, no shadowBlur.

## 4. Rarities, weights, pity

| Rarity | Base weight | Launch count | Stack caps |
|---|---|---|---|
| Common | 58% | 10 | 5–8 |
| Rare | 27% | 8 | 2–5 |
| Epic | 12% | 6 | 1–2 |
| Legendary | 3% | 4 | 1–2, never re-offered at max |

**LUCK drives rarity (Kevin, Megabonk-style):** with luck L (the player's live luck
stat, e.g. 0.30 for +30%): rare ×(1+L), epic ×(1+1.5L), legendary ×(1+2L), common
absorbs the remainder after renormalizing. Pity tightens with luck: threshold
`4 − floor(L/0.15)` (min 2) consecutive commons force rare+. ACCEPTANCE: 400-roll
distribution at L=0 vs L=0.30 shows a statistically visible shift (epic+legendary
share up by ≥40% relative), or it doesn't ship.

Duplicate rolls of a max-stacked relic reroll once, then fall back to gold
(VS-style consolation: `40 + 10*minute` gold).

## 5. Launch set (28)

**Common (10):** Moldy Green Room Sandwich (+6 max HP), Cracked Drumstick (+2% atk
speed, PERM LANE), Blown Amp (+3% damage), Frayed Cable (+4% proj speed), Setlist
Scrap (+3% XP), Guitar Pick (+2% crit chance), Duct Tape (+1 armor), Merch Table
Coin (+4% gold gain), Stage Light Gel (+4% pickup), Worn Tour Shirt (+0.2/s regen).

**Rare (8):** Reverb Pedal (+6% effect duration), Spare Strings (+5% weapon size),
Roadie Gloves (−6% boost cooldown, cap 5), Energy Drink Case (+3% move speed, cap 5),
Backstage Pass (−8% merchant/shrine prices, cap 3), Feedback Loop (burn/freeze/shock
last +10%, cap 3), Fog Machine (enemy projectiles 6% slower, cap 2 — telegraph
doctrine friendly), Extra Verse (+5% double-XP-gem chance, cap 4).

**Epic (6, tradeoffs live here):** Overdriven Amp (+15% dmg / −5% max HP, cap 2),
Pyro Rig (burn ticks +30% / +10% contact damage taken, cap 1), Bass Drop (shockwave
knockback every 12s, cap 1 — reuse addRing + existing knockback math), Crowd Surf
Pads (+20% move speed 2s after taking a hit, cap 1), Bootleg Recording (+1 card on
level-up offers, cap 1 — wires into the offer builder beside V1_431 consumables),
Golden Kazoo (10% of gold pickups also drop an XP gem, cap 1).

**Legendary (4, run-defining):** Platinum Record (+1 projectile, **maxStacks 2** —
exactly the existing bonusProjectiles +2 clamp; chests become the ONLY projectile
source, see §5b), Encore Flare (revive once at 50% HP), Master Tape (evolved
weapons +12% damage — V1_417 synergy), Tour Bus (+12% move speed AND +1 boost
charge — plays with windRunner pips).

### 5b. Shrine projectile roll moves here (Kevin)

The V1_377 shrine reward that granted flat +1 `bonusProjectiles` is REMOVED from
the shrine pool (shrines keep every other reward; pool weights renormalize).
Projectiles are now chest-sourced via Platinum Record only. The `bonusProjectiles`
stat, its +2 clamp in `applyPassives`, and the shrine system itself are otherwise
untouched. Migration: run-local stat — nothing persists, nothing to migrate.

## 6. Ceremony + inventory UX

- Chest reveal reuses `#chestModal` + slot reel: rarity-colored border/glow
  (common gray-cyan / rare blue / epic violet / legendary gold), TYPE line = rarity,
  name, flavor line (italic, dim), effect line, TAKE (cost) / LEAVE unchanged.
- Pause menu gains a RELICS strip under WEAPONS/TOMES: icon + ×stack, one line per
  relic on tap/hover (reuse pause layout law from V1_393/V1_419 — one-line fit,
  no bleed at 412px).
- Info popup gains a short RELICS paragraph (what they are, reset per run).
- V1_422 cutoff law applies to every touched surface.

## 7. Integration laws (non-negotiable)

- Offer chokepoints stay sacred: relics never offered in level-ups; banishes
  (V1_431) don't interact with relics.
- V1_416 ceiling: guarded stats through the permanent lane; measure a maxed-relic
  build vs the 4.05× reference — must not blow the ceiling.
- Perf law: no per-frame shadowBlur; event hooks only; Bass Drop ring reuses pooled
  fx. Bench a 28-relic-hoard dense scene vs baseline (±5% frame time budget).
- Save schema: NOTHING persists (run-local). `survivors_meta` untouched.
- Test seams: `window.__RELICS = { grant(id,n), list(), reset(), totals() }`.

## 8. Phases (single writer, commit+push per phase)

1. **Core** (Opus/high): registry + roll/pity + chest wiring + stat collector into
   applyPassives + seams. Acceptance: 200-roll distribution matches weights ±3%,
   evolution/pot/blessing precedence intact, ceiling bench.
2. **Content + events** (Opus/high): all 28 relics live incl. event hooks; per-relic
   probe proving each effect (numeric or event assertion).
3. **Ceremony + inventory** (Sonnet/xhigh): reveal styling, pause strip, info copy,
   viewport matrix screenshots.
4. **Score + polish loop** (/goal to 90): rubric below, attack weakest category,
   re-score with evidence each iteration.

## 9. Rubric (100 = full Megabonk item system)

| Category | Pts | 90-bar |
|---|---|---|
| Item variety/count | 20 | 28+ items, all 4 rarities populated, no dead picks |
| Rarity/drop system | 15 | weighted rolls + pity + dupe handling proven by distribution test |
| Stacking + tradeoffs | 15 | caps enforced, 6+ tradeoff/downside decisions that matter |
| Synergies | 15 | 6+ relics keying other systems (status, dash, gold, XP, evolution) |
| Ceremony + inventory UX | 15 | rarity-styled reveal, flavor text, pause inventory, zero cutoff |
| Integration/balance | 10 | ceiling holds, evolution ceremony intact, economy sane |
| Stability/verification | 10 | zero pageerrors, per-relic probes, perf bench inside budget |

---

## 10. Phase status + open dial (V1_435)

Phases 1 (core, V1_434) and 2 (content, V1_435) are SHIPPED — all 28 relics live,
probe-verified. Two §5 dials were trimmed under the §7 ceiling law: Overdriven Amp
+15%→+10%/stack, Master Tape +12%→+10%. Reverb Pedal / Spare Strings caps set to 4.

**OPEN QUESTION FOR KEVIN (not blocking):** a theoretical kitchen-sink hoard (all
28 relics at max stacks ≈ 100 chest opens) reaches ×6.5 vs the 4.05× tome/shop
ceiling. This is economically unreachable (chest costs double to 1000 then +50% —
a real 30-min run opens ~8–15 chests), so live play stays under the ceiling, but
the structural options are: (a) accept relics as an intentional third power axis
whose gate is the chest economy (current state), or (b) add an equipped-relic cap.

## 10a. V1_437 (RELICS /goal iteration 1) — 85→ target 92, gaps attacked

Registry now **36 relics** (common 11 / rare 11 / epic 9 / legendary 5); base
weights unchanged (58/27/12/3). Adds: **6 true-downside relics** now live
(Overdriven Amp, Pyro Rig + Cursed Setlist, Heavy Cab, Feedback Screamer, Strobe
Rig); **4 niche-fillers** (Pop Filter shield-cap, EVP Recorder ghost soft-cap +2,
Signature Solo = first crit-DAMAGE relic, Gold Master Disc gold+escalation-slow);
**free-chest luck** (+0.25 to live luck on `chest.isFree` rolls only).

**Realistic-run measurement (replaces the earlier "measures a 12-relic run" promise
— these are the actual figures).** Simulated 20× the natural acquisition curve of a
competent 30-min run: gold income 2000–3500, 5 free chests (~1/6 min) rolled at live
luck 0.10 + the 0.25 free bonus, paid chests bought while affordable against the LIVE
escalation, all rolls through the live `rollRelic` (pity + luck). Natural loadout =
**13–15 relic stacks, 9–14 unique** per run. Effective single-target-DPS multiplier
(damage × attack-speed × crit — the same proxy the V1_416 4.05× reference used):

| Metric | Core (dmg×AS×crit) | With projectiles (Platinum Record) |
|---|---|---|
| median | **1.05×** | 1.14× |
| p90    | **1.17×** | 2.06× |
| max    | 1.28×              | 2.33× |

The natural loadout lands **~1.05–1.17× core DPS**, i.e. relics contribute a modest
lift on top of a build and the realistic ceiling is **nowhere near 4.05×** — most
relic value is survivability / economy / utility, not raw single-target DPS. The
kitchen-sink ×6.5 remains a theoretical (≈100-open) hoard, not a reachable state.

**Free-chest quality lift (300 free vs 300 paid, L=0):** epic+legendary share
13.3% paid → 23.4% free (**+75.9% relative**), consistent with an L=0.25 roll —
"found treasure is better treasure," no new UI (free chests keep their FREE styling).

**Ceiling proofs (numeric):** Strobe Rig's +10% attack speed enters the PERMANENT
lane through `PERM_AS_KNEE` (measured AS 1.65→1.725 softened, vs 1.75 naive).
Signature Solo's +20% crit damage enters the PERMANENT crit lane through
`PERM_CRIT_KNEE` — above the knee the relic's expected-crit-factor gain is softened
from a naive ΔF +0.19 to a measured +0.086 (measured F 3.034 = softened expectation
exactly). Full 36-relic hoard incl. EVP at max is frame-time neutral (Δ ≈ 0 ms;
baked V1_411 glows, no per-frame shadowBlur). Feedback Screamer is scoped to the
themed BOSS_IDENTITY bosses (MiniBoss + MajorBoss); the Maw is deliberately excluded
both directions to protect its bespoke `MAW_HP` tuning.
