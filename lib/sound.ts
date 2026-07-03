// Tiny Web Audio synth for host-screen cues — no audio files to ship. Browsers
// require a user gesture before audio can play, so call unlockAudio() from a
// click handler first.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

export function unlockAudio() {
  const c = getCtx();
  if (c && c.state === "suspended") void c.resume();
}

type BlipOpts = {
  type?: OscillatorType;
  dur?: number;
  gain?: number;
  when?: number;
  glideTo?: number;
};

function blip(freq: number, opts: BlipOpts = {}) {
  const c = getCtx();
  if (!c || c.state !== "running") return;
  const { type = "sine", dur = 0.15, gain = 0.12, when = 0, glideTo } = opts;
  const t0 = c.currentTime + when;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

export const sounds = {
  join: () => blip(660, { type: "triangle", dur: 0.12, gain: 0.07 }),
  questionStart: () => {
    blip(440, { type: "sawtooth", dur: 0.12, gain: 0.09 });
    blip(660, { type: "sawtooth", dur: 0.16, gain: 0.09, when: 0.1 });
  },
  tick: () => blip(880, { type: "square", dur: 0.05, gain: 0.08 }),
  reveal: () => {
    blip(523, { type: "sine", dur: 0.18, gain: 0.12 });
    blip(392, { type: "sine", dur: 0.22, gain: 0.1, when: 0.12 });
  },
  leaderboard: () => blip(330, { type: "sine", dur: 0.5, gain: 0.12, glideTo: 660 }),
  podium: () => {
    [523, 659, 784, 1047].forEach((n, i) =>
      blip(n, { type: "triangle", dur: 0.3, gain: 0.13, when: i * 0.16 })
    );
  },
};
