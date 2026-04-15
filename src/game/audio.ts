import type { Settings } from './types';

export function speak(text: string, settings: Settings) {
  if (!settings.voicePrompts || !('speechSynthesis' in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.88;
  utter.pitch = 1.18;
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

export function beep(success: boolean, settings: Settings) {
  const ac = new AudioContext();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = success ? 'triangle' : 'square';
  osc.frequency.value = success ? 680 : 210;
  gain.gain.value = 0.03 * (settings.musicVolume / 100);
  osc.connect(gain).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + 0.2);
}
