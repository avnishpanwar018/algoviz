/**
 * sound.js
 * Singleton SoundController utilizing the Web Audio API for tone synthesis.
 */

class SoundController {
  constructor() {
    this.ctx = null;
    this.enabled = false;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playTone(value, maxVal, delayMs = 35, pan = 0) {
    if (!this.enabled) return;
    this.init();

    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      // Normalize value to frequency (160Hz to 1000Hz)
      const minFreq = 160;
      const maxFreq = 1000;
      const freq = minFreq + (value / maxVal) * (maxFreq - minFreq);

      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.type = 'triangle';

      if (this.ctx.createStereoPanner) {
        const panner = this.ctx.createStereoPanner();
        panner.pan.setValueAtTime(pan, this.ctx.currentTime);
        osc.connect(gainNode);
        gainNode.connect(panner);
        panner.connect(this.ctx.destination);
      } else {
        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
      }

      const duration = Math.max(0.015, Math.min(0.08, delayMs / 1000));
      
      gainNode.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 0.003);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("AudioContext playback blocked:", e);
    }
  }

  playSuccessChime(pan = 0) {
    if (!this.enabled) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 arpeggio
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        if (this.ctx.createStereoPanner) {
          const panner = this.ctx.createStereoPanner();
          panner.pan.setValueAtTime(pan, now);
          osc.connect(gainNode);
          gainNode.connect(panner);
          panner.connect(this.ctx.destination);
        } else {
          osc.connect(gainNode);
          gainNode.connect(this.ctx.destination);
        }

        gainNode.gain.setValueAtTime(0.0001, now + idx * 0.08);
        gainNode.gain.linearRampToValueAtTime(0.08, now + idx * 0.08 + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.2);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.2);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  playFailureChime(pan = 0) {
    if (!this.enabled) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const notes = [311.13, 261.63]; // Eb4, C4 sad descending interval
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        if (this.ctx.createStereoPanner) {
          const panner = this.ctx.createStereoPanner();
          panner.pan.setValueAtTime(pan, now);
          osc.connect(gainNode);
          gainNode.connect(panner);
          panner.connect(this.ctx.destination);
        } else {
          osc.connect(gainNode);
          gainNode.connect(this.ctx.destination);
        }

        gainNode.gain.setValueAtTime(0.0001, now + idx * 0.12);
        gainNode.gain.linearRampToValueAtTime(0.08, now + idx * 0.12 + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.35);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.35);
      });
    } catch (e) {
      console.warn(e);
    }
  }
}

export const soundController = new SoundController();
