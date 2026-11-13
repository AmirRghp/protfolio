import { getAssetUrl } from "@/core/utils/assetUrl";
export interface CatAudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  bassEnergy: number; // 0.0 to 1.0 (reactive kick pulse)
  overallEnergy: number; // 0.0 to 1.0
  isDrop: boolean; // True during drop phases (33s-57s, 106s-132s)
  isMuted: boolean;
  volume: number;
}

export interface OiiaAudioOptions {
  src?: string;
  duration?: number;
  bpm?: number;
}

/**
 * Oiia Cat audio engine and choreography coordinator.
 * 
 * Manages playback of the looping track, Web Audio API graph routing
 * (`MediaElementSourceNode -> AnalyserNode -> GainNode -> destination`),
 * real-time FFT spectrum analysis for kick/bass reactivity (bins 1–4, 0–250Hz),
 * and musical drop detection windows (33s–57s and 106s–132s).
 */
export class OiiaAudioManager {
  private src: string;
  private duration: number;
  private bpm: number;
  private isPlaying = false;
  private isMuted = false;
  private volume = 0.85;
  private currentTime = 0;
  private bassEnergy = 0;
  private overallEnergy = 0;
  private isDrop = false;

  private audio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private frequencyData: Uint8Array<ArrayBuffer> | null = null;
  private audioSourceNode: MediaElementAudioSourceNode | null = null;

  private lastSimulatedTime = 0;
  private listeners = new Set<(state: CatAudioState) => void>();

  constructor(options: OiiaAudioOptions = {}) {
    this.src = options.src ?? getAssetUrl("assets/audio/oiia-spinning-cat.mp3");
    this.duration = options.duration ?? 134.0;
    this.bpm = options.bpm ?? 160;
  }

  /**
   * Determines whether the specified playback timestamp falls inside an EDM drop window.
   * Drop window 1: 33.0s – 57.0s (First high-energy chorus drop: 00:33 – 00:57)
   * Drop window 2: 106.0s – 132.0s (Second climactic drop: 01:46 – 02:12)
   *
   * @param time Playback time in seconds
   * @returns Boolean indicating whether current playback is inside a drop window
   */
  private static isDropWindow(time: number): boolean {
    return (time >= 33.0 && time <= 57.0) || (time >= 106.0 && time <= 132.0);
  }

  /**
   * Initializes the HTMLAudioElement fallback element with looping, auto-preload,
   * and timeupdate listeners that synchronize drop phase changes.
   */
  private initAudio() {
    if (this.audio || typeof window === "undefined" || typeof Audio === "undefined") {
      return;
    }

    try {
      this.audio = new Audio(this.src);
      this.audio.loop = true;
      this.audio.volume = this.volume;
      this.audio.muted = this.isMuted;
      this.audio.preload = "none";

      this.audio.addEventListener("timeupdate", () => {
        if (this.audio && !Number.isNaN(this.audio.currentTime)) {
          this.currentTime = this.audio.currentTime;
          const inDrop = OiiaAudioManager.isDropWindow(this.currentTime);
          if (this.isDrop !== inDrop) {
            this.isDrop = inDrop;
            this.notifyListeners();
          }
        }
      });

      this.audio.addEventListener("loadedmetadata", () => {
        if (this.audio && !Number.isNaN(this.audio.duration) && this.audio.duration > 0) {
          this.duration = this.audio.duration;
        }
      });
    } catch (err) {
      console.warn("Could not instantiate HTMLAudioElement:", err);
    }
  }

  /**
   * Initializes the Web Audio API graph routing for live FFT spectrum analysis:
   * `MediaElementAudioSourceNode -> AnalyserNode (fftSize=64) -> GainNode -> destination`.
   * Frequency bins 1–4 are sampled during animation frames to compute real-time bass energy (0–250Hz).
   */
  private initWebAudio() {
    if (
      this.audioContext ||
      !this.audio ||
      typeof window === "undefined" ||
      typeof window.AudioContext === "undefined"
    ) {
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      this.frequencyData = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));

      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = this.isMuted ? 0 : 1;

      this.audioSourceNode = this.audioContext.createMediaElementSource(this.audio);
      this.audioSourceNode.connect(this.analyser);
      this.analyser.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);
    } catch {
      // Some browsers or test runners disallow MediaElementAudioSourceNode on cross-origin or mocked elements
    }
  }

  /**
   * Begins audio playback, initializing audio graph routing and resuming suspended AudioContext.
   * If browser autoplay policy blocks audio element playback, gracefully falls back to a simulated clock.
   */
  public async play(): Promise<void> {
    this.initAudio();
    this.initWebAudio();

    this.isPlaying = true;
    this.lastSimulatedTime = typeof performance !== "undefined" ? performance.now() : Date.now();

    if (this.audioContext && this.audioContext.state === "suspended") {
      try {
        await this.audioContext.resume();
      } catch {
        // Ignored
      }
    }

    if (this.audio) {
      try {
        await this.audio.play();
      } catch {
        // Fallback simulated clock handles playback when browser blocks autoplay
      }
    }

    this.notifyListeners();
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.audio) {
      try {
        this.audio.pause();
      } catch {
        // Ignored
      }
    }
    this.notifyListeners();
  }

  public async toggle(): Promise<void> {
    if (this.isPlaying) {
      this.pause();
    } else {
      await this.play();
    }
  }

  /**
   * Complete reset: Stops audio, rewinds to 0s, clears energy and resets dance state.
   * Invoked whenever camera navigates away from room overview (destination !== "room").
   */
  public reset(): void {
    this.isPlaying = false;
    this.currentTime = 0;
    this.bassEnergy = 0;
    this.overallEnergy = 0;
    this.isDrop = false;

    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
      } catch {
        // Ignored
      }
    }

    this.lastSimulatedTime = 0;
    this.notifyListeners();
  }

  public seek(time: number): void {
    this.currentTime = Math.max(0, Math.min(this.duration, time));
    this.isDrop = OiiaAudioManager.isDropWindow(this.currentTime);
    if (this.audio) {
      try {
        this.audio.currentTime = this.currentTime;
      } catch {
        // Ignored
      }
    }
    this.notifyListeners();
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
    this.notifyListeners();
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.audio) {
      this.audio.muted = this.isMuted;
    }
    if (this.gainNode) {
      this.gainNode.gain.value = this.isMuted ? 0 : 1;
    }
    this.notifyListeners();
  }

  public toggleMute(): void {
    this.setMuted(!this.isMuted);
  }

  public updateTime(deltaSeconds: number): void {
    if (!this.isPlaying) return;
    this.currentTime = (this.currentTime + deltaSeconds) % this.duration;
    this.lastSimulatedTime = typeof performance !== "undefined" ? performance.now() : Date.now();
  }

  public getState(): CatAudioState {
    if (this.isPlaying) {
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      if (this.audio && !Number.isNaN(this.audio.currentTime)) {
        const audioTime = this.audio.currentTime;
        if (this.lastSimulatedTime > 0) {
          const delta = (now - this.lastSimulatedTime) / 1000;
          this.currentTime = (this.currentTime + delta) % this.duration;
          if (Math.abs(this.currentTime - audioTime) > 0.2) {
            this.currentTime = audioTime;
          }
        } else {
          this.currentTime = audioTime;
        }
        this.lastSimulatedTime = now;
      } else {
        if (this.lastSimulatedTime > 0) {
          const delta = (now - this.lastSimulatedTime) / 1000;
          this.currentTime = (this.currentTime + delta) % this.duration;
        }
        this.lastSimulatedTime = now;
      }

      // Check drop sections: 33s-57s and 106s-132s
      const inDrop = OiiaAudioManager.isDropWindow(this.currentTime);
      const dropChanged = this.isDrop !== inDrop;
      this.isDrop = inDrop;
      if (dropChanged) {
        this.notifyListeners();
      }

      // Extract real audio frequency if analyser is active
      let realBass = 0;
      let realOverall = 0;
      if (this.analyser && this.frequencyData) {
        this.analyser.getByteFrequencyData(this.frequencyData);
        // Low bins (indices 1 to 4) capture kick drum / sub-bass
        let bassSum = 0;
        let totalSum = 0;
        const binCount = Math.min(this.frequencyData.length, 32);
        for (let i = 0; i < binCount; i++) {
          totalSum += this.frequencyData[i];
          if (i >= 1 && i <= 4) {
            bassSum += this.frequencyData[i];
          }
        }
        realBass = bassSum / (4 * 255);
        realOverall = totalSum / (binCount * 255);
      }

      // 160 BPM mathematical pulse fallback
      const beatPeriod = 60 / this.bpm; // 0.375s
      const beatPhase = (this.currentTime % beatPeriod) / beatPeriod;
      const kickCurve = Math.pow(Math.max(0, 1 - beatPhase * 2.8), 2);

      if (realBass > 0.05) {
        this.bassEnergy = inDrop ? Math.min(1, realBass * 1.35) : realBass;
        this.overallEnergy = realOverall;
      } else {
        // Fallback pulse
        this.bassEnergy = inDrop ? Math.min(1, kickCurve * 1.0 + 0.25) : kickCurve * 0.75;
        this.overallEnergy = inDrop ? 0.85 : 0.45;
      }
    } else {
      this.bassEnergy = 0;
      this.overallEnergy = 0;
      this.isDrop = false;
    }

    return {
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      duration: this.duration,
      bassEnergy: this.bassEnergy,
      overallEnergy: this.overallEnergy,
      isDrop: this.isDrop,
      isMuted: this.isMuted,
      volume: this.volume,
    };
  }

  public subscribe(listener: (state: CatAudioState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const state = this.getState();
    for (const listener of this.listeners) {
      listener(state);
    }
  }
}

export const oiiaAudio = new OiiaAudioManager();

if (typeof window !== "undefined") {
  (window as unknown as { __oiiaAudio: OiiaAudioManager }).__oiiaAudio = oiiaAudio;
}

