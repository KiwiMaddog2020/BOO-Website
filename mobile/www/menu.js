// BOO Arcade — menu shell behavior.
// Tapping a tile loads the game into the iframe overlay; back gestures + the
// X button return to the menu. Capacitor plugins (Haptics, StatusBar, App)
// are loaded conditionally so the same file works in plain mobile Safari for
// dev (where Capacitor is undefined) and in the native app (where it is).

const splashVeil    = document.getElementById('splash-veil');
const gameShell     = document.getElementById('game-shell');
const gameFrame     = document.getElementById('game-shell-frame');
const gameBack      = document.getElementById('game-shell-back');

// --- Capacitor plugins (lazy, optional) -------------------------------------
let Haptics = null;
let App = null;
async function loadCapacitorPlugins() {
    try {
        const cap = window.Capacitor;
        if (!cap) return;
        // These imports succeed only when running inside the Capacitor app
        // bundle. In browsers they'd fail; we silently skip.
        const hapticsMod = await import('@capacitor/haptics').catch(() => null);
        if (hapticsMod) Haptics = hapticsMod.Haptics;
        const appMod = await import('@capacitor/app').catch(() => null);
        if (appMod) App = appMod.App;
    } catch (e) {
        // Running outside Capacitor — that's fine.
    }
}

function tapHaptic(style) {
    if (!Haptics) return;
    try {
        Haptics.impact({ style: style || 'Medium' });
    } catch (e) {}
}

// --- Splash fade -----------------------------------------------------------
// V1_91: hold the splash for ~1500ms so the ghost-scale-in animation (1.3s)
// completes + brief settle pause, THEN start the veil-fade-out (700ms).
window.addEventListener('load', () => {
    setTimeout(() => {
        document.body.classList.add('menu-ready');
        // Remove the veil from the DOM after the fade completes so it can't
        // intercept anything later.
        setTimeout(() => { if (splashVeil && splashVeil.parentNode) splashVeil.remove(); }, 800);
    }, 1500);
});

// --- Game shell open/close --------------------------------------------------
// V1_98: Mirror main-site V1_97 fullscreen letterbox-cap so games stretch
// to fit the device with thin black bars top + bottom. Aspect lookup matches
// the main-site arcade pills: all games use 640/718 (Brickbreaker shape) by
// default; Survivors gets 800/820 override per V1_81.
const MAX_LETTERBOX_RATIO = 0.08;
const GAME_FULLSCREEN_ASPECT = {
    'Games/neon-survivors.html': '800/820'
};
const DEFAULT_FULLSCREEN_ASPECT = '640/718';
let currentGameSrc = null;

function sizeGameFrame() {
    if (!currentGameSrc || !gameFrame || !gameShell) return;
    const aspectStr = GAME_FULLSCREEN_ASPECT[currentGameSrc] || DEFAULT_FULLSCREEN_ASPECT;
    const parts = aspectStr.split('/');
    const aw = parseFloat(parts[0]) || 640;
    const ah = parseFloat(parts[1]) || 718;
    const gameRatio = aw / ah;
    const shellRect = gameShell.getBoundingClientRect();
    const vw = shellRect.width;
    const vh = shellRect.height;
    if (vw <= 0 || vh <= 0) return;
    let gameW, gameH;
    if (vw / vh > gameRatio) {
        gameW = vh * gameRatio;
        const pillarRatio = (vw - gameW) / 2 / vw;
        if (pillarRatio > MAX_LETTERBOX_RATIO) {
            gameW = vw * (1 - 2 * MAX_LETTERBOX_RATIO);
        }
        gameH = vh;
    } else {
        gameH = vw / gameRatio;
        const letterRatio = (vh - gameH) / 2 / vh;
        if (letterRatio > MAX_LETTERBOX_RATIO) {
            gameH = vh * (1 - 2 * MAX_LETTERBOX_RATIO);
        }
        gameW = vw;
    }
    gameFrame.style.width = gameW + 'px';
    gameFrame.style.height = gameH + 'px';
}

function openGame(src) {
    currentGameSrc = src;
    gameFrame.src = src;
    gameShell.classList.add('is-open');
    gameShell.setAttribute('aria-hidden', 'false');
    sizeGameFrame();
    tapHaptic('Medium');
}

function closeGame() {
    currentGameSrc = null;
    gameShell.classList.remove('is-open');
    gameShell.setAttribute('aria-hidden', 'true');
    // Stop game audio / loops by clearing the iframe src.
    gameFrame.src = 'about:blank';
    tapHaptic('Light');
}

gameBack.addEventListener('click', (e) => {
    e.preventDefault();
    closeGame();
});

// V1_98: re-fit iframe on rotate / viewport change while a game is open
window.addEventListener('resize', sizeGameFrame);
window.addEventListener('orientationchange', () => setTimeout(sizeGameFrame, 100));

// --- Tile taps --------------------------------------------------------------
document.querySelectorAll('.game-tile').forEach((tile) => {
    tile.addEventListener('click', (e) => {
        e.preventDefault();
        const isActive = tile.getAttribute('data-active') === '1';
        if (!isActive) {
            // Subtle "nope" haptic for disabled tiles
            tapHaptic('Light');
            return;
        }
        const game = tile.getAttribute('data-game');
        if (game) openGame(game);
    });
});

// --- Capacitor App back button (Android) -----------------------------------
// On iOS swipe-back is a system gesture; on Android the hardware back button
// fires App.backButton when running in Capacitor.
loadCapacitorPlugins().then(() => {
    if (App) {
        App.addListener('backButton', () => {
            if (gameShell.classList.contains('is-open')) {
                closeGame();
            } else {
                // Let the OS exit the app from the menu.
                App.exitApp();
            }
        });
    }
});
