class TetrisAudioEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMusicPlaying = false;
  private isMuted = false;
  private musicTimer: number | null = null;
  private currentNoteIndex = 0;

  // Iconic Tetris Theme A (Korobeiniki) Melody
  // [frequency in Hz, duration in 16th notes]
  // 659.25 = E5, 493.88 = B4, 523.25 = C5, 587.33 = D5, 440 = A4, 415.3 = G#4
  private melodyNotes: [number, number][] = [
    [659.25, 4], // E5
    [493.88, 2], // B4
    [523.25, 2], // C5
    [587.33, 4], // D5
    [523.25, 2], // C5
    [493.88, 2], // B4
    [440.0, 4],  // A4
    [440.0, 2],  // A4
    [523.25, 2], // C5
    [659.25, 4], // E5
    [587.33, 2], // D5
    [523.25, 2], // C5
    [493.88, 6], // B4
    [523.25, 2], // C5
    [587.33, 4], // D5
    [659.25, 4], // E5
    [523.25, 4], // C5
    [440.0, 4],  // A4
    [440.0, 4],  // A4
    [0, 2],      // rest
    [587.33, 4], // D5
    [698.46, 2], // F5
    [880.0, 4],  // A5
    [783.99, 2], // G5
    [698.46, 2], // F5
    [659.25, 6], // E5
    [523.25, 2], // C5
    [659.25, 4], // E5
    [587.33, 2], // D5
    [523.25, 2], // C5
    [493.88, 4], // B4
    [493.88, 2], // B4
    [523.25, 2], // C5
    [587.33, 4], // D5
    [659.25, 4], // E5
    [523.25, 4], // C5
    [440.0, 4],  // A4
    [440.0, 4],  // A4
    [0, 4],      // rest
  ];

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
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

  // --- Sound Effects ---

  public playMove(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = "square";
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.035);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.035);
  }

  public playRotate(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = "triangle";
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.06);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playHold(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playSoftDrop(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = "triangle";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.03);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  public playHardDrop(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;

    // Sub-bass thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.12);

    // Click attack
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.type = "square";
    click.frequency.setValueAtTime(800, now);
    click.frequency.exponentialRampToValueAtTime(200, now + 0.02);

    clickGain.gain.setValueAtTime(0.2, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    click.connect(clickGain);
    clickGain.connect(this.sfxGain);

    click.start(now);
    click.stop(now + 0.02);
  }

  public playLineClear(lines: number): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    const notes: number[] =
      lines === 1
        ? [523.25] // C5
        : lines === 2
        ? [523.25, 659.25] // C5, E5
        : lines === 3
        ? [523.25, 659.25, 783.99] // C5, E5, G5
        : [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (TETRIS!)

    const stepDuration = lines === 4 ? 0.08 : 0.06;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * stepDuration;
      const duration = lines === 4 ? 0.22 : 0.14;

      osc.type = lines === 4 ? "square" : "triangle";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  public playLevelUp(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51]; // A major triumphant run
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.05;

      osc.type = "square";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(startTime);
      osc.stop(startTime + 0.12);
    });
  }

  public playGameOver(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    const notes = [440, 415.3, 392.0, 369.99, 349.23, 293.66, 220.0];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.08;

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.22, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.16);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(startTime);
      osc.stop(startTime + 0.16);
    });
  }

  // --- Background Chiptune Music (Theme A) ---

  public startMusic(): void {
    if (this.isMusicPlaying) return;
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

  public toggleMusic(): boolean {
    if (this.isMusicPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  public isPlayingMusic(): boolean {
    return this.isMusicPlaying;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(muted ? 0 : 0.12, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  private scheduleNextNote(): void {
    if (!this.isMusicPlaying) return;
    const ctx = this.getContext();
    if (!ctx || !this.musicGain) return;

    const sixteenthNoteMs = 125; // 120 BPM
    const [freq, sixteenths] = this.melodyNotes[this.currentNoteIndex];
    const durationSec = (sixteenths * sixteenthNoteMs) / 1000;
    const now = ctx.currentTime;

    if (freq > 0 && !this.isMuted) {
      // Lead melodic voice
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec * 0.92);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + durationSec * 0.92);

      // Warm bass accompaniment (sub-octave triangle wave)
      const bass = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bass.type = "triangle";
      bass.frequency.setValueAtTime(freq / 2, now);

      bassGain.gain.setValueAtTime(0.1, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + durationSec * 0.88);

      bass.connect(bassGain);
      bassGain.connect(this.musicGain);

      bass.start(now);
      bass.stop(now + durationSec * 0.88);
    }

    this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melodyNotes.length;
    this.musicTimer = window.setTimeout(() => {
      this.scheduleNextNote();
    }, sixteenths * sixteenthNoteMs);
  }
}

export const tetrisAudio = new TetrisAudioEngine();
