import type { CivicChallenge } from '../game/simulation/types';

/**
 * gameAudio.ts — 混合音訊引擎：「樣本優先，程式生成備援」。
 *   1. 啟動時載入 public/audio/manifest.json 指定的音檔（CC0 資源包）；缺檔退回合成音。
 *   2. 背景：音樂 pad（合成）＋ 城市環境噪音底層（樣本，循環）。
 *   3. 政策實施：花錢／收銀機聲（樣本或合成）＋ 上行確認音。
 *   4. 災害事件：各主題實錄音（樣本）或合成備援。
 * 公開介面與舊版相同，呼叫端不需更動。
 */

export type GameSoundCue = CivicChallenge['soundCue'] | 'policy' | 'select' | 'success' | 'failure';
type Cue = CivicChallenge['soundCue'];

export interface GameAudio {
  startAmbience: (cue: Cue) => void;
  playEvent: (cue: Cue) => void;
  playPolicy: () => void;
  playSelect: () => void;
  playSuccess: () => void;
  playFailure: () => void;
  setMuted: (muted: boolean) => void;
}

export function createGameAudio(): GameAudio {
  return new ProceduralGameAudio();
}

interface ThemeMusic {
  chord: number[];
  scale: number[];
  filterBase: number;
  filterSweep: number;
  noteIntervalMs: number;
  pulse: boolean;
  padGain: number;
}

const THEMES: Record<Cue, ThemeMusic> = {
  heat: { chord: [55, 110, 165, 220], scale: [330, 370, 440, 495, 587], filterBase: 320, filterSweep: 180, noteIntervalMs: 2600, pulse: true, padGain: 0.05 },
  rain: { chord: [73.4, 110, 146.8, 220], scale: [293.7, 349.2, 392, 440, 523.3], filterBase: 560, filterSweep: 260, noteIntervalMs: 1900, pulse: false, padGain: 0.055 },
  air: { chord: [65.4, 98, 130.8, 196], scale: [261.6, 294, 392, 440, 588], filterBase: 300, filterSweep: 120, noteIntervalMs: 3000, pulse: false, padGain: 0.05 },
  energy: { chord: [82.4, 123.5, 164.8, 247], scale: [329.6, 412, 494, 659, 824], filterBase: 720, filterSweep: 320, noteIntervalMs: 1500, pulse: true, padGain: 0.048 },
  civic: { chord: [65.4, 98, 130.8, 164.8], scale: [261.6, 327.5, 392, 436, 523.3], filterBase: 480, filterSweep: 200, noteIntervalMs: 2300, pulse: false, padGain: 0.052 }
};

interface SampleSpec { file: string; loop?: boolean; gain?: number }

class ProceduralGameAudio implements GameAudio {
  private context?: AudioContext;
  private master?: GainNode;
  private reverbSend?: GainNode;
  private musicGain?: GainNode;
  private sfxGain?: GainNode;
  private ambienceBedGain?: GainNode;

  private padVoices: { osc: OscillatorNode; gain: GainNode; filter: BiquadFilterNode }[] = [];
  private padLfo?: OscillatorNode;
  private currentTheme?: Cue;
  private melodyTimer = 0;
  private pulseTimer = 0;
  private muted = true;

  private sampleSpecs: Record<string, SampleSpec> = {};
  private sampleBuffers = new Map<string, AudioBuffer>();
  private ambienceBedSource?: AudioBufferSourceNode;
  private samplesReady: Promise<void>;

  constructor() {
    this.samplesReady = this.loadManifest();
  }

  private async loadManifest(): Promise<void> {
    try {
      const res = await fetch('/audio/manifest.json', { cache: 'no-cache' });
      if (!res.ok) return;
      const data = await res.json();
      this.sampleSpecs = (data?.samples ?? {}) as Record<string, SampleSpec>;
    } catch {
      // 無 manifest 全用合成音
    }
  }

  private async getSample(name: string): Promise<AudioBuffer | undefined> {
    if (this.sampleBuffers.has(name)) return this.sampleBuffers.get(name);
    const spec = this.sampleSpecs[name];
    if (!spec) return undefined;
    try {
      const res = await fetch(`/audio/${spec.file}`, { cache: 'force-cache' });
      if (!res.ok) return undefined;
      const arr = await res.arrayBuffer();
      const buffer = await this.ensureContext().decodeAudioData(arr);
      this.sampleBuffers.set(name, buffer);
      return buffer;
    } catch {
      return undefined;
    }
  }

  private async playSample(name: string): Promise<boolean> {
    await this.samplesReady;
    const buffer = await this.getSample(name);
    if (!buffer) return false;
    const ctx = this.ensureContext();
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = this.sampleSpecs[name]?.gain ?? 0.6;
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(this.sfxGain!);
    gain.connect(this.reverbSend!);
    source.start();
    return true;
  }

  startAmbience(cue: Cue): void {
    const ctx = this.ensureContext();
    this.resume();
    void this.startCityBed();
    if (this.currentTheme === cue && this.padVoices.length > 0) return;
    this.stopPadAndMelody();
    this.currentTheme = cue;
    const theme = THEMES[cue];

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.05 + Math.random() * 0.03;
    lfoGain.gain.value = theme.filterSweep;
    lfo.connect(lfoGain);
    lfo.start();
    this.padLfo = lfo;

    this.padVoices = theme.chord.map((freq, i) => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = i === 0 ? 'sine' : i === theme.chord.length - 1 ? 'triangle' : 'sawtooth';
      osc.frequency.value = freq;
      osc.detune.value = (Math.random() - 0.5) * 8;
      filter.type = 'lowpass';
      filter.frequency.value = theme.filterBase;
      filter.Q.value = 0.8;
      lfoGain.connect(filter.frequency);
      const voiceGain = theme.padGain / (1 + i * 0.35);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(voiceGain, ctx.currentTime + 2.2);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain!);
      gain.connect(this.reverbSend!);
      osc.start();
      return { osc, gain, filter };
    });

    const scheduleMelody = () => {
      if (this.currentTheme !== cue) return;
      this.playMelodyNote(theme);
      this.melodyTimer = window.setTimeout(scheduleMelody, theme.noteIntervalMs * (0.7 + Math.random() * 0.6));
    };
    this.melodyTimer = window.setTimeout(scheduleMelody, 1200);

    if (theme.pulse) {
      const schedulePulse = () => {
        if (this.currentTheme !== cue) return;
        this.playTone(theme.chord[0], theme.chord[0], 0.5, 0.035, 'sine');
        this.pulseTimer = window.setTimeout(schedulePulse, 1400);
      };
      this.pulseTimer = window.setTimeout(schedulePulse, 900);
    }
  }

  private async startCityBed(): Promise<void> {
    if (this.ambienceBedSource) return;
    await this.samplesReady;
    const buffer = await this.getSample('cityAmbience');
    if (!buffer || this.ambienceBedSource) return;
    const ctx = this.ensureContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(this.ambienceBedGain!);
    const target = this.sampleSpecs.cityAmbience?.gain ?? 0.32;
    this.ambienceBedGain!.gain.setValueAtTime(0, ctx.currentTime);
    this.ambienceBedGain!.gain.linearRampToValueAtTime(target, ctx.currentTime + 3);
    source.start();
    this.ambienceBedSource = source;
  }

  private playMelodyNote(theme: ThemeMusic): void {
    const ctx = this.ensureContext();
    const freq = theme.scale[Math.floor(Math.random() * theme.scale.length)];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.045, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
    osc.connect(gain);
    gain.connect(this.musicGain!);
    gain.connect(this.reverbSend!);
    osc.start(now);
    osc.stop(now + 1.85);
  }

  playEvent(cue: Cue): void {
    this.resume();
    void this.playSample(cue).then((played) => {
      if (!played) this.synthEvent(cue);
    });
  }

  private synthEvent(cue: Cue): void {
    if (cue === 'heat') {
      this.playTone(140, 70, 1.1, 0.085, 'sawtooth', true);
      this.playNoise(0.9, 820, 0.05, true);
      window.setTimeout(() => this.playTone(96, 60, 0.9, 0.06, 'triangle'), 90);
      return;
    }
    if (cue === 'rain') {
      this.playNoise(1.3, 1400, 0.085, true);
      this.playNoise(0.6, 240, 0.06, true);
      this.playTone(70, 48, 1.0, 0.05, 'sine');
      return;
    }
    if (cue === 'air') {
      this.playNoise(1.4, 380, 0.06, true);
      this.playTone(84, 74, 1.1, 0.05, 'sine', true);
      return;
    }
    if (cue === 'energy') {
      [180, 240, 300, 360].forEach((f, i) => window.setTimeout(() => this.playTone(f, f * 1.4, 0.16, 0.055, 'square', true), i * 110));
      return;
    }
    this.playTone(294, 392, 0.4, 0.06, 'sine', true);
    window.setTimeout(() => this.playTone(392, 523, 0.5, 0.05, 'triangle', true), 150);
  }

  playPolicy(): void {
    this.resume();
    void this.playSample('spend').then((spent) => {
      if (!spent) this.synthCash();
    });
    void this.playSample('policy').then((played) => {
      if (played) return;
      [523, 659, 784, 1047].forEach((f, i) => window.setTimeout(() => this.playTone(f, f, 0.2, 0.05, 'triangle', true), i * 70));
      window.setTimeout(() => this.playTone(392, 588, 0.3, 0.045, 'sine', true), 300);
    });
  }

  private synthCash(): void {
    this.playTone(1318, 1318, 0.08, 0.06, 'square', true);
    window.setTimeout(() => this.playTone(1568, 1568, 0.1, 0.05, 'square', true), 70);
    window.setTimeout(() => this.playNoise(0.18, 3200, 0.04, true), 120);
    window.setTimeout(() => this.playNoise(0.14, 2400, 0.03, true), 200);
  }

  playSelect(): void {
    this.resume();
    void this.playSample('select').then((played) => {
      if (!played) this.playTone(560, 660, 0.1, 0.03, 'sine');
    });
  }

  playSuccess(): void {
    this.resume();
    void this.playSample('success').then((played) => {
      if (played) return;
      [392, 494, 587, 784].forEach((f, i) => window.setTimeout(() => this.playTone(f, f, 0.35, 0.06, 'triangle', true), i * 120));
      window.setTimeout(() => this.playTone(1047, 1047, 0.6, 0.05, 'sine', true), 520);
    });
  }

  playFailure(): void {
    this.resume();
    void this.playSample('failure').then((played) => {
      if (played) return;
      [330, 277, 233, 165].forEach((f, i) => window.setTimeout(() => this.playTone(f, f * 0.9, 0.4, 0.06, 'sawtooth', true), i * 150));
      window.setTimeout(() => this.playTone(110, 70, 1.0, 0.07, 'sine', true), 600);
    });
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    const ctx = this.ensureContext();
    const target = muted ? 0 : 0.32;
    this.master!.gain.cancelScheduledValues(ctx.currentTime);
    this.master!.gain.setTargetAtTime(target, ctx.currentTime, 0.1);
    if (!muted) this.resume();
  }

  private ensureContext(): AudioContext {
    if (this.context) return this.context;
    const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) throw new Error('此瀏覽器不支援 Web Audio。');

    const ctx = new AudioCtor();
    this.context = ctx;

    const master = ctx.createGain();
    master.gain.value = this.muted ? 0 : 0.32;
    master.connect(ctx.destination);
    this.master = master;

    const convolver = ctx.createConvolver();
    convolver.buffer = this.buildImpulseResponse(ctx, 2.6, 2.4);
    const wet = ctx.createGain();
    wet.gain.value = 0.32;
    const send = ctx.createGain();
    send.gain.value = 1;
    send.connect(convolver);
    convolver.connect(wet);
    wet.connect(master);
    this.reverbSend = send;

    const music = ctx.createGain();
    music.gain.value = 0.6;
    music.connect(master);
    this.musicGain = music;

    const sfx = ctx.createGain();
    sfx.gain.value = 0.9;
    sfx.connect(master);
    this.sfxGain = sfx;

    const bed = ctx.createGain();
    bed.gain.value = 0;
    bed.connect(master);
    this.ambienceBedGain = bed;

    return ctx;
  }

  private buildImpulseResponse(ctx: AudioContext, seconds: number, decay: number): AudioBuffer {
    const rate = ctx.sampleRate;
    const length = Math.floor(rate * seconds);
    const buffer = ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch += 1) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return buffer;
  }

  private resume(): void {
    const ctx = this.ensureContext();
    if (ctx.state === 'suspended') void ctx.resume();
  }

  private stopPadAndMelody(): void {
    if (!this.context) return;
    const now = this.context.currentTime;
    window.clearTimeout(this.melodyTimer);
    window.clearTimeout(this.pulseTimer);
    for (const voice of this.padVoices) {
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setTargetAtTime(0, now, 0.4);
      voice.osc.stop(now + 1.2);
    }
    this.padVoices = [];
    if (this.padLfo) {
      this.padLfo.stop(now + 1.2);
      this.padLfo = undefined;
    }
  }

  private playTone(startFreq: number, endFreq: number, duration: number, peakGain: number, type: OscillatorType, reverb = false): void {
    const ctx = this.ensureContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(this.master!);
    if (reverb) gain.connect(this.reverbSend!);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private playNoise(duration: number, filterFreq: number, peakGain: number, reverb = false): void {
    const ctx = this.ensureContext();
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;

    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    source.buffer = buffer;
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = 0.9;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master!);
    if (reverb) gain.connect(this.reverbSend!);
    source.start(now);
    source.stop(now + duration + 0.02);
  }
}
