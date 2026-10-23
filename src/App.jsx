// src/App.jsx
import { useState, useEffect } from 'react';
import DemogorgonScene from './DemogorgonScene';
import { 
  playFeedSound, 
  playGameOverSound, 
  startAmbientHum, 
  stopAmbientHum, 
  playAnomalySound,
  setMute 
} from './sounds';
import './App.css';

const translations = {
  ru: {
    title: "Demogorgon Tamagotchi",
    hunger: "Сытость",
    energy: "Энергия",
    feed: "🍖 Покормить",
    sleep: "💤 Дать отдохнуть",
    restart: "Попробовать снова",
    gameOverHungerTitle: "ОН ПРОСНУЛСЯ",
    gameOverEnergyTitle: "ВЕЧНЫЙ СОН",
    deadHunger: "Демогоргон ушел в Наизнанку... 💀",
    deadHungerDesc: "Ты не покормил его вовремя.",
    deadEnergy: "Демогоргон впал в спячку... 💤",
    deadEnergyDesc: "Он слишком долго не спал и обессилел.",
    langBtn: "EN",
    helpBtn: "?",
    score: "Время выживания:",
    highScore: "Рекорд:",
    sec: "сек",
    clickHint: "Кликни по Демогоргону!",
    howToPlayTitle: "Как играть",
    howToPlayRules: [
      "Следи за шкалами Сытости и Энергии.",
      "Корми Демогоргона, чтобы он не злился.",
      "Давай ему отдохнуть, иначе он уснет навсегда.",
      "Чем дольше ты играешь, тем быстрее падают шкалы!",
      "Остерегайся случайных аномалий из Наизнанку!",
      "Кликай по самому монстру, чтобы его разозлить."
    ],
    close: "Понятно",
    anomaly: "АНОМАЛИЯ!"
  },
  en: {
    title: "Demogorgon Tamagotchi",
    hunger: "Satiety",
    energy: "Energy",
    feed: "🍖 Feed",
    sleep: "💤 Let rest",
    restart: "Try again",
    gameOverHungerTitle: "HE WOKE UP",
    gameOverEnergyTitle: "ETERNAL SLEEP",
    deadHunger: "Demogorgon went to the Upside Down... 💀",
    deadHungerDesc: "You didn't feed him in time.",
    deadEnergy: "Demogorgon fell into hibernation... 💤",
    deadEnergyDesc: "He stayed awake for too long and lost all his strength.",
    langBtn: "RU",
    helpBtn: "?",
    score: "Survival time:",
    highScore: "Best:",
    sec: "sec",
    clickHint: "Click the Demogorgon!",
    howToPlayTitle: "How to play",
    howToPlayRules: [
      "Watch the Satiety and Energy bars.",
      "Feed the Demogorgon so he doesn't get angry.",
      "Let him rest, or he will fall asleep forever.",
      "The longer you play, the faster the bars drop!",
      "Beware of random anomalies from the Upside Down!",
      "Click on the monster itself to make him roar."
    ],
    close: "Got it",
    anomaly: "ANOMALY!"
  }
};

function App() {
  const [hunger, setHunger] = useState(50); 
  const [energy, setEnergy] = useState(100); 
  const [gameOverReason, setGameOverReason] = useState(null); 
  const [score, setScore] = useState(0); 
  
  const [lang, setLang] = useState('ru');
  const [showHelp, setShowHelp] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Стейт для звука
  
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('demogorgonHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [isAnomaly, setIsAnomaly] = useState(false);

  const t = translations[lang];

  // Включаем фоновый гул при старте
  useEffect(() => {
    startAmbientHum();
    return () => stopAmbientHum();
  }, []);

  // Синхронизируем состояние звука с аудио-движком
  useEffect(() => {
    setMute(isMuted);
  }, [isMuted]);

  useEffect(() => {
    if (gameOverReason) {
      stopAmbientHum(); 
    }
  }, [gameOverReason]);

  // --- ИГРОВОЙ ЦИКЛ ---
  useEffect(() => {
    if (gameOverReason) return;

    const interval = setInterval(() => {
      if (isAnomaly) return; 

      const difficultyMultiplier = 1 + Math.floor(score / 30); 
      setHunger((prev) => Math.max(0, prev - (2 * difficultyMultiplier)));
      setEnergy((prev) => Math.max(0, prev - (1 * difficultyMultiplier)));
      setScore((prev) => prev + 1); 
    }, 1000);

    return () => clearInterval(interval);
  }, [gameOverReason, score, isAnomaly]);

  // --- РАНДОМНЫЕ АНОМАЛИИ ---
  useEffect(() => {
    if (gameOverReason) return;

    const triggerAnomaly = () => {
      setIsAnomaly(true);
      playAnomalySound();
      
      setHunger((prev) => Math.max(0, prev - 15));
      setEnergy((prev) => Math.max(0, prev - 10));

      setTimeout(() => {
        setIsAnomaly(false);
      }, 1000);
    };

    const anomalyInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        triggerAnomaly();
      }
    }, 15000); 

    return () => clearInterval(anomalyInterval);
  }, [gameOverReason]);

  // --- ПРОВЕРКА ПРОИГРЫША ---
  useEffect(() => {
    if (hunger <= 0) setGameOverReason('hunger');
    else if (energy <= 0) setGameOverReason('energy');
  }, [hunger, energy]);

  useEffect(() => {
    if (gameOverReason) {
      playGameOverSound();
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('demogorgonHighScore', score.toString());
      }
    }
  }, [gameOverReason, score, highScore]);

  // --- ДЕЙСТВИЯ ---
  const feedPet = () => {
    if (gameOverReason || isAnomaly) return; 
    playFeedSound();
    setHunger((prev) => Math.min(100, prev + 15));
  };

  const restPet = () => {
    if (gameOverReason || isAnomaly) return;
    setEnergy((prev) => Math.min(100, prev + 25)); 
    setHunger((prev) => Math.max(0, prev - 5)); 
  };

  const restartGame = () => {
    setHunger(50);
    setEnergy(100);
    setGameOverReason(null);
    setScore(0);
    startAmbientHum(); 
  };

  const toggleLang = () => setLang(lang === 'ru' ? 'en' : 'ru');

  let mood = 'calm';
  if (gameOverReason) mood = 'gameover';
  else if (isAnomaly || hunger < 30) mood = 'angry'; 
  else if (energy < 25) mood = 'sleepy'; 

  const isDead = !!gameOverReason;

  const renderSpores = () => {
    return Array.from({ length: 25 }).map((_, i) => {
      const size = Math.random() * 8 + 4;
      const left = Math.random() * 100;
      const duration = Math.random() * 10 + 10;
      const delay = Math.random() * 10;
      return (
        <div 
          key={i} 
          className="spore" 
          style={{ 
            width: size, height: size, left: `${left}%`, 
            animationDuration: `${duration}s`, animationDelay: `-${delay}s`
          }} 
        />
      );
    });
  };

  return (
    <>
      <div className="crt-overlay"></div>
      <div className="spores">{renderSpores()}</div>
      
      <div className={`app-container ${isDead ? 'game-over' : ''} ${mood === 'sleepy' ? 'sleepy-mode' : ''} ${isAnomaly ? 'anomaly-flash' : ''}`}>
        
        <div className="top-controls">
          {/* Кнопка выключения звука */}
          <button className="btn-icon" onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? '🔇' : '🔊'}
          </button>
          
          <button className="btn-icon" onClick={() => setShowHelp(true)}>{t.helpBtn}</button>
          <button className="btn-icon" onClick={toggleLang}>{t.langBtn}</button>
        </div>

        <h1 className={isDead ? 'glitch' : ''}>
          {isDead ? (gameOverReason === 'hunger' ? t.gameOverHungerTitle : t.gameOverEnergyTitle) : t.title}
        </h1>
        
        {isDead ? (
          <div className="dead-screen">
            {gameOverReason === 'hunger' ? (
              <><h2>{t.deadHunger}</h2><p>{t.deadHungerDesc}</p></>
            ) : (
              <><h2>{t.deadEnergy}</h2><p>{t.deadEnergyDesc}</p></>
            )}
            
            <div style={{ margin: '20px 0', fontSize: '18px' }}>
              <p style={{ color: '#e50914', fontWeight: 'bold' }}>{t.score} {score} {t.sec}</p>
              <p style={{ color: '#fff' }}>{t.highScore} {highScore} {t.sec}</p>
            </div>

            <button onClick={restartGame} className="btn restart">{t.restart}</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#888' }}>
              <span>{t.score} {score} {t.sec}</span>
              <span style={{ color: '#e50914' }}>{t.highScore} {highScore} {t.sec}</span>
            </div>
            
            <div className="stats">
              <div className="stat-bar">
                <span>{t.hunger}: {hunger}%</span>
                <div className="bar-bg">
                  <div className={`bar-fill hunger ${hunger < 30 ? 'critical' : ''}`} style={{ width: `${hunger}%` }}></div>
                </div>
              </div>
              <div className="stat-bar">
                <span>{t.energy}: {energy}%</span>
                <div className="bar-bg">
                  <div className={`bar-fill energy ${energy < 25 ? 'critical' : ''}`} style={{ width: `${energy}%` }}></div>
                </div>
              </div>
            </div>

            <div className="scene-wrapper" style={{ position: 'relative' }}>
               <DemogorgonScene mood={mood} />
               {mood === 'sleepy' && <div className="zzz">Z z Z</div>}
               
               {isAnomaly && (
                 <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#ff0000', fontSize: '40px', fontWeight: 'bold', textShadow: '0 0 20px red', pointerEvents: 'none', animation: 'glitch-anim 0.2s infinite' }}>
                   {t.anomaly}
                 </div>
               )}

               <div style={{ position: 'absolute', bottom: '10px', left: '0', right: '0', color: 'rgba(255,255,255,0.3)', fontSize: '12px', pointerEvents: 'none', textAlign: 'center' }}>
                 {t.clickHint}
               </div>
            </div>

            <div className="controls">
              <button onClick={feedPet} className="btn feed" disabled={isAnomaly}>{t.feed}</button>
              <button onClick={restPet} className="btn sleep" disabled={isAnomaly}>{t.sleep}</button>
            </div>
          </>
        )}
      </div>

      {showHelp && (
        <div className="modal-overlay" onClick={() => setShowHelp(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{t.howToPlayTitle}</h2>
            <ul>
              {t.howToPlayRules.map((rule, idx) => <li key={idx}>{rule}</li>)}
            </ul>
            <button className="btn feed" onClick={() => setShowHelp(false)}>{t.close}</button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;