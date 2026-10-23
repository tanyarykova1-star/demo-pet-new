// src/sounds.js
let audioCtx;
let masterGain;
let isMuted = false;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Создаем общий регулятор громкости
    masterGain = audioCtx.createGain();
    masterGain.gain.value = isMuted ? 0 : 1; 
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

// Функция для включения/выключения звука
export const setMute = (mute) => {
  isMuted = mute;
  if (masterGain && audioCtx) {
    masterGain.gain.setTargetAtTime(mute ? 0 : 1, audioCtx.currentTime, 0.1);
  }
};

export const playFeedSound = () => {
  initAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(masterGain);

  osc.type = 'square';
  osc.frequency.setValueAtTime(300, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);

  gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.15);
};

export const playGameOverSound = () => {
  initAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(masterGain);

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(100, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 1.5);

  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 2);

  osc.start();
  osc.stop(audioCtx.currentTime + 2);
};

export const playRoarSound = () => {
  initAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(masterGain);

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(80, audioCtx.currentTime);
  osc.frequency.linearRampToValueAtTime(150, audioCtx.currentTime + 0.2);
  osc.frequency.linearRampToValueAtTime(60, audioCtx.currentTime + 0.4);

  gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.5);
};

let ambientOsc1, ambientOsc2;

export const startAmbientHum = () => {
  initAudio();
  if (ambientOsc1) return;

  ambientOsc1 = audioCtx.createOscillator();
  ambientOsc2 = audioCtx.createOscillator();
  const ambientGain = audioCtx.createGain();

  ambientOsc1.type = 'sine';
  ambientOsc1.frequency.value = 50; 
  
  ambientOsc2.type = 'sine';
  ambientOsc2.frequency.value = 50.5; 

  ambientGain.gain.value = 0.05;

  ambientOsc1.connect(ambientGain);
  ambientOsc2.connect(ambientGain);
  ambientGain.connect(masterGain);

  ambientOsc1.start();
  ambientOsc2.start();
};

export const stopAmbientHum = () => {
  if (ambientOsc1) {
    try {
      ambientOsc1.stop();
      ambientOsc2.stop();
    } catch (e) {
      // Игнорируем ошибку, если звук уже остановлен
    }
    ambientOsc1 = null;
    ambientOsc2 = null;
  }
};

export const playAnomalySound = () => {
  initAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(masterGain);

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(200, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
  osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);

  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.4);
};