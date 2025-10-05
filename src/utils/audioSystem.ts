export type SoundType = 'move' | 'capture' | 'check' | 'checkmate' | 'castle' | 'illegal';

class AudioSystem {
  private context: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.context = new AudioContext();
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  isMutedState(): boolean {
    return this.isMuted;
  }

  private playTone(frequency: number, duration: number, volume: number = 0.3) {
    if (!this.context || this.isMuted) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + duration);
  }

  playSound(type: SoundType) {
    if (this.isMuted) return;

    switch (type) {
      case 'move':
        this.playTone(440, 0.1, 0.2);
        break;
      case 'capture':
        this.playTone(330, 0.15, 0.3);
        setTimeout(() => this.playTone(220, 0.1, 0.2), 50);
        break;
      case 'check':
        this.playTone(550, 0.2, 0.3);
        setTimeout(() => this.playTone(660, 0.15, 0.25), 100);
        break;
      case 'checkmate':
        this.playTone(440, 0.15, 0.3);
        setTimeout(() => this.playTone(330, 0.15, 0.3), 100);
        setTimeout(() => this.playTone(220, 0.3, 0.35), 200);
        break;
      case 'castle':
        this.playTone(523, 0.1, 0.2);
        setTimeout(() => this.playTone(659, 0.15, 0.25), 80);
        break;
      case 'illegal':
        this.playTone(200, 0.15, 0.15);
        break;
    }
  }
}

export const audioSystem = new AudioSystem();
