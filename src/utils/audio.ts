/**
 * Web Audio API Ambient Soundscape & UI Sound Effects (uisfx.com style)
 * Generates tactile, crisp, modern micro-interactions & ambient audio.
 */

class UISoundEffects {
  private ctx: AudioContext | null = null;
  private lastHoverTime: number = 0;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * uisfx Tactile Click / Tap
   */
  public playClick() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const now = ctx.currentTime;
      osc.type = 'sine';

      // Pitch drop for a solid tactile click
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.035);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Audio context silenced or blocked
    }
  }

  /**
   * uisfx Soft Hover Tick
   */
  public playHover() {
    const nowMs = Date.now();
    // Throttle hover sounds so rapid mouse moves don't overwhelm
    if (nowMs - this.lastHoverTime < 60) return;
    this.lastHoverTime = nowMs;

    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const now = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1250, now);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.025);
    } catch {
      // Audio blocked
    }
  }

  /**
   * uisfx Springy Pop (for menu toggles & filter selection)
   */
  public playPop() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const now = ctx.currentTime;
      osc.type = 'sine';

      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.065);
    } catch {
      // Audio blocked
    }
  }

  /**
   * uisfx Page Transition Chime
   */
  public playSwitch() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Note 1 (E5 - 659Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.085);

      // Note 2 (B5 - 987Hz) slightly delayed
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, now + 0.04);
      gain2.gain.setValueAtTime(0.07, now + 0.04);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.04);
      osc2.stop(now + 0.125);
    } catch {
      // Audio blocked
    }
  }
}

export const uiSfx = new UISoundEffects();

/**
 * Global listener setup for automatically playing uisfx sound effects on buttons and links
 */
export function setupGlobalUISFX() {
  if (typeof window === 'undefined') return;

  const handlePointerOver = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const interactive = target.closest('button, a, [role="button"], input, select, textarea, .cursor-pointer');
    if (interactive) {
      uiSfx.playHover();
    }
  };

  const handlePointerDown = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const interactive = target.closest('button, a, [role="button"], input[type="submit"], .cursor-pointer');
    if (interactive) {
      uiSfx.playClick();
    }
  };

  window.addEventListener('mouseover', handlePointerOver, { passive: true });
  window.addEventListener('mousedown', handlePointerDown, { passive: true });
}

/**
 * Web Audio API Ambient Soundscape Generator
 * Produces a warm, minimal, relaxing drone/pad with subtle harmonic movement.
 */
class AmbientSoundscape {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private filter: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }

  private start() {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 2.5);

      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(420, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

      // Low frequency modulation for organic breathing
      this.lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      this.lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(140, this.ctx.currentTime);
      this.lfo.connect(lfoGain);
      lfoGain.connect(this.filter.frequency);
      this.lfo.start();

      // Ambient warm chord frequencies (Dmaj9 warm chord voicing: D2, A2, F#3, C#4, E4)
      const chord = [73.42, 110.00, 185.00, 277.18, 329.63];

      this.oscillators = chord.map((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const oscGain = this.ctx!.createGain();

        // Slight detune for analog warmth
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq + (Math.random() * 0.4 - 0.2), this.ctx!.currentTime);

        const volume = i === 0 ? 0.25 : 0.15;
        oscGain.gain.setValueAtTime(volume, this.ctx!.currentTime);

        osc.connect(oscGain);
        oscGain.connect(this.filter!);
        osc.start();
        return osc;
      });

      this.filter.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
      this.isPlaying = true;
    } catch (e) {
      console.warn('AudioContext not allowed or failed:', e);
      this.isPlaying = false;
    }
  }

  private stop() {
    if (!this.ctx || !this.masterGain) return;
    try {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);

      setTimeout(() => {
        this.oscillators.forEach(osc => {
          try { osc.stop(); osc.disconnect(); } catch { }
        });
        if (this.lfo) {
          try { this.lfo.stop(); this.lfo.disconnect(); } catch { }
        }
        if (this.ctx && this.ctx.state !== 'closed') {
          this.ctx.close();
        }
        this.ctx = null;
        this.isPlaying = false;
      }, 1200);
    } catch {
      this.isPlaying = false;
    }
  }
}

export const ambientSound = new AmbientSoundscape();
