// Comical and satisfying sound effects synthesized using browser's Web Audio API.
// Wrapped in try/catch to maintain resilience on older browsers or early user click requirements.

class ComicalAudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      } catch (e) {
        console.warn("Failed to initialize Web Audio Context", e);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted() {
    return this.isMuted;
  }

  private createOscillator(type: OscillatorType, freq: number, duration: number, gainValues: number[]): { osc: OscillatorNode, gainNode: GainNode } | null {
    this.initContext();
    if (!this.ctx || this.isMuted) return null;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    // Set custom gain curve
    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    const step = duration / Math.max(1, gainValues.length - 1);
    gainValues.forEach((val, idx) => {
      gainNode.gain.linearRampToValueAtTime(val, this.ctx.currentTime + idx * step);
    });

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    return { osc, gainNode };
  }

  // A sharp swoosh/slash noise + frequency sweep
  public playSlice() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      
      // Sweep oscillator
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
      
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      
      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);

      // White Noise crack
      const bufferSize = this.ctx.sampleRate * 0.08;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;
      
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1200, now);
      noiseFilter.Q.setValueAtTime(4, now);
      
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.15, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      
      noiseSource.start(now);
      noiseSource.stop(now + 0.08);
    } catch (e) {
      // Fail silent
    }
  }

  // A cartoonish pop sound (short pitch sweep up)
  public playPop() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(250, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);

      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {}
  }

  // Wet bubble pop sound
  public playBubble() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(650, now + 0.06);

      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {}
  }

  // Vortex suction wind effect (vacuum sweep)
  public playSuction() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      
      // Sweep down frequency
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.35);

      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.linearRampToValueAtTime(0.25, now + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch (e) {}
  }

  // A glistening sparkling bell sequence (clean reveal!)
  public playShine() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const playPitchedBell = (freq: number, delay: number, vol: number) => {
        if (!this.ctx) return;
        const o1 = this.ctx.createOscillator();
        const o2 = this.ctx.createOscillator(); // overtone
        const g = this.ctx.createGain();

        o1.type = 'sine';
        o1.frequency.setValueAtTime(freq, now + delay);

        o2.type = 'triangle';
        o2.frequency.setValueAtTime(freq * 1.5, now + delay);

        g.gain.setValueAtTime(0, now + delay);
        g.gain.linearRampToValueAtTime(vol, now + delay + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.3);

        o1.connect(g);
        o2.connect(g);
        g.connect(this.ctx.destination);

        o1.start(now + delay);
        o1.stop(now + delay + 0.35);
        o2.start(now + delay);
        o2.stop(now + delay + 0.35);
      };

      // Play arpeggio
      playPitchedBell(523.25, 0, 0.12);     // C5
      playPitchedBell(659.25, 0.08, 0.10);  // E5
      playPitchedBell(783.99, 0.16, 0.10);  // G5
      playPitchedBell(987.77, 0.24, 0.14);  // B5
    } catch (e) {}
  }

  // Level / Game Clear Fanfare!
  public playWinFanfare() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const playNote = (freq: number, start: number, dur: number, type: OscillatorType = 'triangle') => {
        if (!this.ctx) return;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();

        o.type = type;
        o.frequency.setValueAtTime(freq, now + start);

        g.gain.setValueAtTime(0, now + start);
        g.gain.linearRampToValueAtTime(0.12, now + start + 0.02);
        g.gain.setValueAtTime(0.12, now + start + dur - 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

        o.connect(g);
        g.connect(this.ctx.destination);

        o.start(now + start);
        o.stop(now + start + dur + 0.05);
      };

      // Uplifting visual gaming fanfare! 
      playNote(261.63, 0.0, 0.12); // C4
      playNote(329.63, 0.12, 0.12); // E4
      playNote(392.00, 0.24, 0.12); // G4
      playNote(523.25, 0.36, 0.3);  // C5 (long hold)

      // Sparkles in background
      setTimeout(() => {
        this.playShine();
      }, 400);

    } catch (e) {}
  }
}

export const audio = new ComicalAudioManager();
