/**
 * Procedural Web Audio API sound synthesizer for Cyber Pixel Run.
 * Zero external audio dependencies, 0ms latency, authentic 8-bit cyberpunk chiptunes.
 */

class PixelRunAudioEngine {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private isMusicPlaying = false;
  private isMuted = false;
  private musicTimer: number | null = null;
  private currentNoteIndex = 0;

  // Energetic 8-bit Synthwave cyberpunk bassline & lead loop
  // [frequency in Hz, duration in 16th notes (1 step ~ 115ms)]
  private melodyNotes: [number, number][] = [
    // Bar 1 - Am groove
    [220.0, 2], // A3
    [220.0, 2], // A3
    [440.0, 2], // A4
    [392.0, 2], // G4
    [329.63, 2], // E4
    [392.0, 2], // G4
    [440.0, 4], // A4

    // Bar 2 - Fmaj groove
    [174.61, 2], // F3
    [174.61, 2], // F3
    [349.23, 2], // F4
    [329.63, 2], // E4
    [261.63, 2], // C4
    [329.63, 2], // E4
    [349.23, 4], // F4

    // Bar 3 - Cmaj groove
    [261.63, 2], // C4
    [261.63, 2], // C4
    [523.25, 2], // C5
    [493.88, 2], // B4
    [392.0, 2], // G4
    [493.88, 2], // B4
    [523.25, 4], // C5

    // Bar 4 - G/E turnaround
    [196.0, 2], // G3
    [196.0, 2], // G3
    [392.0, 2], // G4
    [329.63, 2], // E4
    [293.66, 2], // D4
    [329.63, 2], // E4
    [440.0, 4], // A4 (wrap to Am)
  ];

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(0.28, this.ctx.currentTime);
        this.sfxGain.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        this.musicGain.connect(this.ctx.destination);
      }
    }

    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted && this.isMusicPlaying) {
      this.stopMusic();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // --- Sound Effects ---

  /**
   * Snappy upward frequency sweep + thruster hiss for jump
   */
  public playJump(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.12);

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  /**
   * Downward filter swoosh for slide / duck
   */
  public playDuck(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + 0.09);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  /**
   * Gentle landing thud
   */
  public playLand(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.05);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  /**
   * Iconic 2-tone milestone chime (every 100 meters)
   */
  public playMilestone(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;

    // Tone 1: 587.33Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "square";
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc1.connect(gain1);
    gain1.connect(this.sfxGain);
    osc1.start(now);
    osc1.stop(now + 0.09);

    // Tone 2: 880Hz (A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "square";
    osc2.frequency.setValueAtTime(880.0, now + 0.09);
    gain2.gain.setValueAtTime(0.2, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc2.connect(gain2);
    gain2.connect(this.sfxGain);
    osc2.start(now + 0.09);
    osc2.stop(now + 0.23);
  }

  /**
   * Ascending 3-note chime on collecting data core
   */
  public playCollect(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteTime = now + idx * 0.05;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.22, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.1);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(noteTime);
      osc.stop(noteTime + 0.11);
    });
  }

  /**
   * Electrical shatter buzz when holo-shield absorbs a hit
   */
  public playShieldBreak(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.15);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.17);
  }

  /**
   * Deep 8-bit explosion crash
   */
  public playCrash(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;

    // Sub-bass pitch drop
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.35);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.36);

    // Noise blast
    const bufferSize = Math.floor(ctx.sampleRate * 0.3);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + 0.3);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.32);
  }

  /**
   * Hyper-speed sector warp arpeggio
   */
  public playSectorWarp(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const freqs = [330, 440, 554, 659, 880];
    const now = ctx.currentTime;

    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.05;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      osc.stop(t + 0.13);
    });
  }

  /**
   * Grand Victory Fanfare
   */
  public playVictory(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const fanfare: [number, number][] = [
      [440, 0.12],
      [440, 0.12],
      [440, 0.12],
      [554, 0.3],
      [659, 0.2],
      [880, 0.5],
    ];

    let t = ctx.currentTime;
    fanfare.forEach(([freq, dur]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur - 0.01);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      osc.stop(t + dur);

      t += dur + 0.03;
    });
  }

  // --- Background Synthwave Music Loop ---

  public isMusicActive(): boolean {
    return this.isMusicPlaying;
  }

  public toggleMusic(): boolean {
    if (this.isMusicPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  public startMusic(): void {
    if (this.isMuted || this.isMusicPlaying) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.isMusicPlaying = true;
    this.currentNoteIndex = 0;
    this.scheduleNextNote();
  }

  public stopMusic(): void {
    this.isMusicPlaying = false;
    if (this.musicTimer !== null) {
      window.clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private scheduleNextNote(): void {
    if (!this.isMusicPlaying || this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.musicGain) return;

    const [freq, duration16ths] = this.melodyNotes[this.currentNoteIndex];
    // 16th note at ~130 BPM is approx 115ms
    const stepDuration = 0.115;
    const durationSeconds = duration16ths * stepDuration;

    if (freq > 0) {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds * 0.88);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + durationSeconds * 0.9);
    }

    this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melodyNotes.length;
    this.musicTimer = window.setTimeout(() => {
      this.scheduleNextNote();
    }, durationSeconds * 1000);
  }
}

export const pixelRunAudio = new PixelRunAudioEngine();
