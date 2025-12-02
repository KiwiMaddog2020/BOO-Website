# Bunch of Others

Official website for BOO — a psychedelic rock band out of Kelowna, BC.

## About

BOO started in 2024 after Jeff lost his brother Kyle, who fronted Fields of Green. Jeff found Kyle's unreleased recordings and taught himself guitar to bring the music back to life. Joe (who played with Kyle and mentored Jeff), Johnny (Fields of Green's drummer), and Sean on bass round out the lineup.

The music comes from good times, loss, love, and wanting to make something others can connect with.

## The Site

Psychedelic single-page site with animated gradients, breathing effects, and layered visuals. Pure HTML, CSS, and JavaScript — no frameworks.

**Sections:** Home, Bio, Videos, Photos, Game, Merch, Events

**Features:**
- Scroll-snap navigation
- Pill-style music player
- Animated color-cycling effects
- Mobile touch support
- Works on Chrome, Safari, Firefox, and mobile browsers

## 🎮 Neon Brickbreaker

The site includes a custom brickbreaker game with roguelike elements.

### Controls

- **Desktop:** Arrow keys or mouse
- **Mobile:** Slide on the trackpad below the game, or touch the paddle

Break all bricks to clear a level. Don't let the ball drop.

### Mechanics

| | |
|--|--|
| **Lives** | Start with 3. Lose one when the ball falls. |
| **Levels** | Ball gets faster as you progress. |
| **Bosses** | Every 5 levels — moving bricks that take multiple hits. |
| **Leaderboard** | Submit your score when you're done. |

### Power-Ups

Catch these with your paddle:

| Power-Up | Color | What it does |
|----------|-------|--------------|
| Big Paddle | 🟢 Green | Wider paddle (10s) |
| Multi Ball | 🟠 Orange | 3 balls (5 bounces) |
| Crusher | 🔴 Red | Ball plows through bricks (8s) |
| Extra Life | 🩷 Pink | +1 life (max 5) |
| Small Paddle | ⚫ Gray | Smaller paddle (8s) — avoid this one |

### Upgrades

Every 2 levels you pick a permanent buff:

- **Paddle Speed+** — Move faster
- **Ball Control** — Better angle control
- **Power-Up Magnet** — Power-ups drift toward you
- **Combo Master** — Bonus points for streaks
- **Extra Life** — +1 life right now

### Tips

- Hit brick edges to start chain reactions
- Crusher clears problem areas fast
- Multi Ball scores big but gets chaotic
- Boss levels — stay patient, stay alive

Game runs client-side (HTML5 canvas + JS).

## Files

```
index.html               # Main site
neon-brickbreaker.html   # Game (standalone or embedded)
```

## Local Development

Open `index.html` directly, or run a local server if iframes give you trouble:

```bash
python -m http.server 8000
# then go to http://localhost:8000
```

## Links

- [Instagram](https://www.instagram.com/bunch_of_others/)
- [YouTube](https://www.youtube.com/@BunchOfOthersMusic)
- [Spotify](https://open.spotify.com/artist/1n8AIkpbrWiXAS8pewVjnP)
- [Apple Music](https://music.apple.com/us/artist/bunch-of-others/1754588177)

## License

© Bunch of Others. All rights reserved.
