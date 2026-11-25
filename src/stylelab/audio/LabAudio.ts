/** Procedural Web Audio beds — no samples, no freeze, starts after user gesture. */

export type LabVoice = "wax" | "depth" | "case" | "glyph" | "dio";

type VoiceNodes = {
  stop: () => void;
};

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let current: VoiceNodes | null = null;
let muted = true;

function ensureCtx() {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
  }
  return ctx;
}

function tone(
  ac: AudioContext,
  dest: AudioNode,
  type: OscillatorType,
  freq: number,
  gain: number
) {
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = gain;
  o.connect(g);
  g.connect(dest);
  o.start();
  return { o, g };
}

function makeWax(ac: AudioContext, dest: AudioNode): VoiceNodes {
  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 420;
  filter.Q.value = 0.7;
  filter.connect(dest);
  const a = tone(ac, filter, "sine", 55, 0.05);
  const b = tone(ac, filter, "triangle", 82.5, 0.03);
  const c = tone(ac, filter, "sine", 110, 0.02);
  const lfo = ac.createOscillator();
  const lfoG = ac.createGain();
  lfo.frequency.value = 0.07;
  lfoG.gain.value = 80;
  lfo.connect(lfoG);
  lfoG.connect(filter.frequency);
  lfo.start();
  return {
    stop: () => {
      [a, b, c].forEach((n) => {
        n.o.stop();
        n.o.disconnect();
        n.g.disconnect();
      });
      lfo.stop();
      lfo.disconnect();
      lfoG.disconnect();
      filter.disconnect();
    },
  };
}

function makeDepth(ac: AudioContext, dest: AudioNode): VoiceNodes {
  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 280;
  filter.connect(dest);
  const a = tone(ac, filter, "sine", 40, 0.06);
  const b = tone(ac, filter, "sine", 60.5, 0.035);
  const noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.15;
  const noise = ac.createBufferSource();
  noise.buffer = noiseBuf;
  noise.loop = true;
  const ng = ac.createGain();
  ng.gain.value = 0.012;
  const nf = ac.createBiquadFilter();
  nf.type = "bandpass";
  nf.frequency.value = 900;
  noise.connect(nf);
  nf.connect(ng);
  ng.connect(dest);
  noise.start();
  return {
    stop: () => {
      a.o.stop();
      b.o.stop();
      noise.stop();
      [a.o, a.g, b.o, b.g, noise, ng, nf, filter].forEach((n) => n.disconnect());
    },
  };
}

function makeCase(ac: AudioContext, dest: AudioNode): VoiceNodes {
  const a = tone(ac, dest, "square", 90, 0.008);
  const b = tone(ac, dest, "sawtooth", 45, 0.012);
  const filter = ac.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 200;
  // hum through filter
  a.g.disconnect();
  b.g.disconnect();
  a.o.connect(a.g);
  b.o.connect(b.g);
  a.g.connect(filter);
  b.g.connect(filter);
  filter.connect(dest);
  a.g.gain.value = 0.006;
  b.g.gain.value = 0.01;
  return {
    stop: () => {
      a.o.stop();
      b.o.stop();
      [a.o, a.g, b.o, b.g, filter].forEach((n) => n.disconnect());
    },
  };
}

function makeGlyph(ac: AudioContext, dest: AudioNode): VoiceNodes {
  const a = tone(ac, dest, "square", 130.8, 0.01);
  const b = tone(ac, dest, "square", 164.8, 0.007);
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 600;
  filter.Q.value = 4;
  a.g.disconnect();
  b.g.disconnect();
  a.o.connect(a.g);
  b.o.connect(b.g);
  a.g.connect(filter);
  b.g.connect(filter);
  filter.connect(dest);
  a.g.gain.value = 0.008;
  b.g.gain.value = 0.005;
  const lfo = ac.createOscillator();
  const lfoG = ac.createGain();
  lfo.frequency.value = 0.15;
  lfoG.gain.value = 200;
  lfo.connect(lfoG);
  lfoG.connect(filter.frequency);
  lfo.start();
  return {
    stop: () => {
      a.o.stop();
      b.o.stop();
      lfo.stop();
      [a.o, a.g, b.o, b.g, filter, lfo, lfoG].forEach((n) => n.disconnect());
    },
  };
}

function makeDio(ac: AudioContext, dest: AudioNode): VoiceNodes {
  const a = tone(ac, dest, "sine", 65.4, 0.04);
  const b = tone(ac, dest, "triangle", 98, 0.02);
  const c = tone(ac, dest, "sine", 196, 0.01);
  return {
    stop: () => {
      [a, b, c].forEach((n) => {
        n.o.stop();
        n.o.disconnect();
        n.g.disconnect();
      });
    },
  };
}

const makers: Record<LabVoice, (ac: AudioContext, dest: AudioNode) => VoiceNodes> = {
  wax: makeWax,
  depth: makeDepth,
  case: makeCase,
  glyph: makeGlyph,
  dio: makeDio,
};

export function isLabMuted() {
  return muted;
}

export async function setLabMuted(next: boolean) {
  muted = next;
  const ac = ensureCtx();
  if (ac.state === "suspended") await ac.resume();
  if (!master) return;
  const now = ac.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.linearRampToValueAtTime(muted ? 0 : 0.9, now + 0.25);
}

export async function playLabVoice(voice: LabVoice) {
  const ac = ensureCtx();
  if (ac.state === "suspended") await ac.resume();
  if (!master) return;
  current?.stop();
  current = makers[voice](ac, master);
  if (!muted) {
    const now = ac.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.linearRampToValueAtTime(0.9, now + 0.4);
  }
}

export function stopLabVoice() {
  current?.stop();
  current = null;
}
