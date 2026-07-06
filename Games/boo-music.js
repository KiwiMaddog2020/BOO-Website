/* ===== BOO ARCADE MUSIC ENGINE (V1_389) =====
   Shared procedural chiptune engine for the BOO games — a parameterized port of
   the engine built (and verified) inside BOO Survivors in V1_386/V1_387.
   NES-style voices: 2 pulse channels with real 25%/12.5% duty cycles
   (PeriodicWave), triangle bass, noise+sweep drums, light echo bus on the lead.
   Real transitions: fade-out / breath / swell-in between states; song rotation
   runs beat-tight so composed drum fills ring into the next downbeat.
   Yields automatically while the main site's media player (#audio-player in the
   parent page) is playing — the band outranks the arcade.

   Usage (inside a game):
     const MUSIC = createBooMusic({
       audioCtx: SFX.audioCtx,          // shared AudioContext factory (may return null)
       isPaused: function () { ... },   // truthy -> low-pass duck (700Hz)
       tracks: { title: {...}, songA: {...}, ..., over: {...} },
       playlist: ['songA', 'songB'],    // in-game rotation pool (shuffled per run)
       titleKey: 'title', overKey: 'over',
       loopsPerTrack: 2
     });
     MUSIC.setState('menu' | 'game' | 'gameover' | 'off');
     // + wire SFX.setMuted -> MUSIC.setMuted, and unlock on first gesture.

   Track format (see any game's TRACKS block):
     { bpm, bars, v1, v2, vb, d1, d2, once?,
       p1: [barString...], p2: [...], bass: [...],   // "C5:4 E5:2 .:2 ..." (len16, default 2)
       drums: [grid16...] }                          // 16 chars/bar: k s h o .
*/
window.createBooMusic = function (cfg) {
    let a = null, master = null, duckLP = null, chans = null, noiseBuf = null;
    let waves = null;
    let muted = !!cfg.startMuted, vol = (cfg.volume === undefined ? 0.5 : cfg.volume);
    let suppressed = false, running = false;
    let state = 'off', track = null, stepIdx = 0, nextTime = 0, loopsDone = 0;
    let playlist = [], plIdx = 0, tickTimer = null, lastSiteCheck = 0, echoWetNode = null, overrideKey = null;
    const LOOKAHEAD = 0.24, TICK_MS = 90;
    const MASTER_LVL = cfg.masterLevel === undefined ? 0.42 : cfg.masterLevel;
    const LOOPS_PER = cfg.loopsPerTrack === undefined ? 2 : cfg.loopsPerTrack;
    const TITLE_KEY = cfg.titleKey || 'title', OVER_KEY = cfg.overKey || 'over';

    // --- note helpers ---
    const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    function midi(n) {
        const sharp = n[1] === '#';
        return (parseInt(n[sharp ? 2 : 1], 10) + 1) * 12 + SEMI[n[0]] + (sharp ? 1 : 0);
    }
    function freq(m) { return 440 * Math.pow(2, (m - 69) / 12); }
    function mel(bars) {
        const ev = [];
        bars.forEach(function (bar, bi) {
            let s = bi * 16;
            bar.split(/\s+/).forEach(function (tok) {
                if (!tok) return;
                const p = tok.split(':'), len = p[1] ? parseInt(p[1], 10) : 2;
                if (p[0] !== '.') ev.push([s, midi(p[0]), len]);
                s += len;
            });
        });
        return ev;
    }
    function dr(bars) {
        const ev = [];
        bars.forEach(function (bar, bi) {
            for (let i = 0; i < 16; i++) if (bar[i] && bar[i] !== '.') ev.push([bi * 16 + i, bar[i]]);
        });
        return ev;
    }
    function byStep(evts) {
        const m = {};
        evts.forEach(function (e) { (m[e[0]] = m[e[0]] || []).push(e); });
        return m;
    }
    const TRACKS = cfg.tracks;
    Object.keys(TRACKS).forEach(function (k) {
        const t = TRACKS[k];
        t.steps = t.bars * 16;
        t.iP1 = byStep(mel(t.p1)); t.iP2 = byStep(mel(t.p2));
        t.iBass = byStep(mel(t.bass)); t.iDr = byStep(dr(t.drums));
    });

    // --- audio graph ---
    function pulseWave(duty) {
        const N = 32, re = new Float32Array(N), im = new Float32Array(N);
        for (let n = 1; n < N; n++) im[n] = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * duty);
        return a.createPeriodicWave(re, im, { disableNormalization: false });
    }
    function ensure() {
        if (a) return a;
        a = cfg.audioCtx();
        if (!a) return null;
        master = a.createGain();
        master.gain.value = effVol();
        duckLP = a.createBiquadFilter();
        duckLP.type = 'lowpass'; duckLP.frequency.value = 18000;
        duckLP.connect(master); master.connect(a.destination);
        chans = { p1: a.createGain(), p2: a.createGain(), bass: a.createGain(), dr: a.createGain() };
        Object.keys(chans).forEach(function (k) { chans[k].gain.value = 1; chans[k].connect(duckLP); });
        const dly = a.createDelay(0.5), fb = a.createGain(), wet = a.createGain();
        dly.delayTime.value = 0.23; fb.gain.value = 0.24; wet.gain.value = 0.14;
        chans.p1.connect(dly); dly.connect(fb); fb.connect(dly); dly.connect(wet); wet.connect(duckLP);
        echoWetNode = wet; // V1_390: per-track echo depth (track.echoWet, default 0.14)
        waves = { w25: pulseWave(0.25), w125: pulseWave(0.125) };
        const n = Math.floor(a.sampleRate * 0.3), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
        noiseBuf = buf;
        return a;
    }
    function effVol() { return (muted || suppressed || state === 'off') ? 0 : MASTER_LVL * vol; }
    function applyVol(ramp) {
        if (!master) return;
        const t = a.currentTime;
        master.gain.cancelScheduledValues(t);
        master.gain.setValueAtTime(master.gain.value, t);
        master.gain.linearRampToValueAtTime(effVol(), t + (ramp || 0.05));
    }

    // --- voices ---
    function vPulse(ch, m, t, dur, vel, duty) {
        const o = a.createOscillator(), g = a.createGain();
        if (duty === 0.5) o.type = 'square';
        else o.setPeriodicWave(duty === 0.125 ? waves.w125 : waves.w25);
        o.frequency.value = freq(m);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(vel, t + 0.005);
        g.gain.setValueAtTime(vel, Math.max(t + 0.005, t + dur - 0.03));
        g.gain.linearRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(ch);
        o.start(t); o.stop(t + dur + 0.02);
    }
    function vBass(m, t, dur, vel) {
        const o = a.createOscillator(), g = a.createGain();
        o.type = 'triangle'; o.frequency.value = freq(m);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(vel, t + 0.006);
        g.gain.setValueAtTime(vel, Math.max(t + 0.006, t + dur - 0.04));
        g.gain.linearRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(chans.bass);
        o.start(t); o.stop(t + dur + 0.02);
    }
    function vDrum(type, t) {
        if (type === 'k') {
            const o = a.createOscillator(), g = a.createGain();
            o.type = 'triangle';
            o.frequency.setValueAtTime(160, t);
            o.frequency.exponentialRampToValueAtTime(42, t + 0.09);
            g.gain.setValueAtTime(0.5, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
            o.connect(g); g.connect(chans.dr); o.start(t); o.stop(t + 0.12);
        } else {
            const src = a.createBufferSource(); src.buffer = noiseBuf;
            const g = a.createGain(), f = a.createBiquadFilter();
            let dur, lvl;
            if (type === 's') { f.type = 'highpass'; f.frequency.value = 900; dur = 0.10; lvl = 0.22; }
            else if (type === 'o') { f.type = 'highpass'; f.frequency.value = 6000; dur = 0.09; lvl = 0.10; }
            else { f.type = 'highpass'; f.frequency.value = 6500; dur = 0.03; lvl = 0.09; }
            g.gain.setValueAtTime(lvl, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + dur);
            src.connect(f); f.connect(g); g.connect(chans.dr);
            src.start(t); src.stop(t + dur + 0.01);
            if (type === 's') {
                const o = a.createOscillator(), g2 = a.createGain();
                o.type = 'triangle'; o.frequency.value = 190;
                g2.gain.setValueAtTime(0.14, t);
                g2.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
                o.connect(g2); g2.connect(chans.dr); o.start(t); o.stop(t + 0.07);
            }
        }
    }

    // --- sequencer ---
    function spb(t) { return 60 / (t.bpm * 4); }
    function scheduleStep(t, s, when) {
        const dur = spb(t);
        (t.iP1[s] || []).forEach(function (e) { vPulse(chans.p1, e[1], when, e[2] * dur * 0.92, t.v1, t.d1); });
        (t.iP2[s] || []).forEach(function (e) { vPulse(chans.p2, e[1], when, e[2] * dur * 0.90, t.v2, t.d2); });
        (t.iBass[s] || []).forEach(function (e) { vBass(e[1], when, e[2] * dur * 0.95, t.vb); });
        (t.iDr[s] || []).forEach(function (e) { vDrum(e[1], when); });
    }
    function shufflePlaylist() {
        playlist = (cfg.playlist || []).slice().sort(function () { return Math.random() - 0.5; });
        plIdx = 0;
    }
    function switchTrack(key, opts) {
        opts = opts || {};
        const fade = opts.fade === undefined ? 0.18 : opts.fade;
        const gap = opts.gap === undefined ? 0.10 : opts.gap;
        const t = a.currentTime;
        master.gain.cancelScheduledValues(t);
        master.gain.setValueAtTime(master.gain.value, t);
        if (fade > 0) master.gain.linearRampToValueAtTime(0.0001, t + fade);
        const startAt = t + fade + gap;
        if (opts.rise) {
            master.gain.setValueAtTime(0.0001, startAt);
            master.gain.linearRampToValueAtTime(effVol(), startAt + opts.rise);
        } else {
            master.gain.setValueAtTime(effVol(), startAt);
        }
        track = TRACKS[key];
        stepIdx = 0; loopsDone = 0;
        nextTime = startAt + 0.02;
        if (echoWetNode) echoWetNode.gain.setValueAtTime(track.echoWet === undefined ? 0.14 : track.echoWet, startAt); // V1_390
    }
    function tick() {
        if (!a || !running) return;
        let paused = false;
        try { paused = !!(cfg.isPaused && cfg.isPaused()); } catch (e) {}
        const fTarget = (paused && state === 'game') ? 700 : 18000;
        if (Math.abs(duckLP.frequency.value - fTarget) > 1) {
            duckLP.frequency.setTargetAtTime(fTarget, a.currentTime, 0.12);
        }
        const now = Date.now();
        if (now - lastSiteCheck > 1500) {
            lastSiteCheck = now;
            let sup = false;
            try {
                if (window.parent && window.parent !== window) {
                    const pa = window.parent.document.getElementById('audio-player');
                    sup = !!(pa && !pa.paused && !pa.ended);
                }
            } catch (e) { /* cross-origin / standalone — no parent player */ }
            if (sup !== suppressed) {
                suppressed = sup;
                applyVol(0.6);
                if (!sup) nextTime = a.currentTime + 0.3;
            }
        }
        if (suppressed || muted || !track || a.state !== 'running') return;
        const stepDur = spb(track);
        while (nextTime < a.currentTime + LOOKAHEAD) {
            scheduleStep(track, stepIdx, nextTime);
            stepIdx++; nextTime += stepDur;
            if (stepIdx >= track.steps) {
                stepIdx = 0; loopsDone++;
                if (track.once) {
                    if (state === 'gameover') { state = 'menu'; switchTrack(TITLE_KEY, { fade: 0, gap: 1.1, rise: 0.9 }); }
                    break;
                }
                if (state === 'game' && !overrideKey && playlist.length > 1 && loopsDone >= LOOPS_PER) {
                    plIdx = (plIdx + 1) % playlist.length;
                    switchTrack(playlist[plIdx], { fade: 0, gap: 0.12 });
                    break;
                }
            }
        }
    }

    return {
        get state() { return state; },
        unlock: function () {
            if (!ensure()) return;
            if (a.state === 'suspended') a.resume().catch(function () {});
            if (!running) {
                running = true;
                tickTimer = setInterval(tick, TICK_MS);
                if (state === 'off') this.setState('menu');
                else if (!track) this.setState(state, true);
            }
        },
        // V1_390: hold a specific track (e.g. a boss room) until cleared — rotation
        // pauses while an override is active. Entry slams in hard; exit swells back
        // into whichever rotation song was playing.
        setOverride: function (key, opts) {
            if (!TRACKS[key] || overrideKey === key || !a) return;
            overrideKey = key;
            switchTrack(key, opts || { fade: 0.12, gap: 0.1 });
        },
        clearOverride: function (opts) {
            if (!overrideKey) return;
            overrideKey = null;
            if (a && state === 'game') switchTrack(playlist[plIdx] || TITLE_KEY, opts || { fade: 0.3, gap: 0.25, rise: 0.4 });
        },
        setState: function (s, force) {
            if (s === state && !force) return;
            state = s;
            overrideKey = null; // any real state change ends a boss hold
            if (!a) { return; }
            if (s === 'menu') switchTrack(TITLE_KEY, { fade: 0.22, gap: 0.15, rise: 0.35 });
            else if (s === 'game') { shufflePlaylist(); switchTrack(playlist[0] || TITLE_KEY, { fade: 0.15, gap: 0.08 }); }
            else if (s === 'gameover') switchTrack(OVER_KEY, { fade: 0.12, gap: 0.4 });
            else { track = null; applyVol(0.1); }
        },
        setMuted: function (m) { muted = !!m; applyVol(0.1); },
        setVolume: function (v) { vol = Math.max(0, Math.min(1, v || 0)); applyVol(0.1); },
        _tracks: TRACKS,
        _dbg: function () { return { state: state, suppressed: suppressed, muted: muted, vol: vol, running: running, gain: master ? master.gain.value : null, bpm: track ? track.bpm : null, step: stepIdx }; }
    };
};
