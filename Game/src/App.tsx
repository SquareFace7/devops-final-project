import { useState, useEffect } from 'react';
import { Sliders, RefreshCcw } from 'lucide-react';
import type { GameState, PhysicsConfig } from './types/game';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { OverlayMenu } from './components/OverlayMenu';
import { PhysicsPanel } from './components/PhysicsPanel';

const DEFAULT_PHYSICS: PhysicsConfig = {
  gravity: 0.13,                 // Gravity pull (px/frame^2) - very floaty controls
  jumpForce: 3.6,                // Vertical jump impulse speed (px/frame) - balanced with new gravity
  horizontalSpeed: 2.2,          // Scroller speed (px/frame) - relaxed, slower pace
  obstacleSpawnInterval: 2600,     // Time in ms between laser spawns - spaced for slower scroll
  gapHeight: 155,                // Vertical opening clearance for drone (px)
  maxVerticalSpeed: 5.0,         // Velocity limit (px/frame) - scaled down to match
  particleDensity: 12,           // Particle emissions rate
  screenShakeDuration: 15,       // Screen shake frame cycles on collision
};

const LOCAL_STORAGE_HIGH_SCORE_KEY = 'cyberglide_high_score';

function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [stabilityIndex, setStabilityIndex] = useState<number>(100);
  const [physicsConfig, setPhysicsConfig] = useState<PhysicsConfig>(() => {
    // Attempt to load customized physics config if previously tweaked, otherwise use defaults
    return DEFAULT_PHYSICS;
  });
  const [isPhysicsOpen, setIsPhysicsOpen] = useState<boolean>(false);

  // Load High Score from LocalStorage on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem(LOCAL_STORAGE_HIGH_SCORE_KEY);
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // Update Game State handlers
  const handleStartGame = () => {
    setGameState('PLAYING');
    setScore(0);
    setStabilityIndex(100);
  };

  const handleGameOver = (finalScore: number) => {
    // If beat record, save to high scores
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem(LOCAL_STORAGE_HIGH_SCORE_KEY, finalScore.toString());
    }
    setGameState('GAMEOVER');
  };

  // Reset physics tuning back to default configs
  const handlePhysicsChange = (newConfig: PhysicsConfig) => {
    setPhysicsConfig(newConfig);
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#020205] flex flex-col justify-center items-center">
      
      {/* 1. Main Canvas Render */}
      <GameCanvas
        gameState={gameState}
        physicsConfig={physicsConfig}
        score={score}
        setScore={setScore}
        stabilityIndex={stabilityIndex}
        setStabilityIndex={setStabilityIndex}
        onGameOver={handleGameOver}
        onStartGame={handleStartGame}
      />

      {/* 2. In-Game HUD overlay */}
      <HUD
        score={score}
        highScore={highScore}
        stabilityIndex={stabilityIndex}
        gameState={gameState}
      />

      {/* 3. Start & Gameover Overlays */}
      <OverlayMenu
        gameState={gameState}
        score={score}
        highScore={highScore}
        onStartGame={handleStartGame}
      />

      {/* 4. Live Physics Customization Panel */}
      <PhysicsPanel
        isOpen={isPhysicsOpen}
        setIsOpen={setIsPhysicsOpen}
        config={physicsConfig}
        onChange={handlePhysicsChange}
        defaultConfig={DEFAULT_PHYSICS}
      />

      {/* 5. Floating Dev Control Button */}
      <div className="absolute bottom-6 left-6 pointer-events-auto z-30 flex gap-2">
        <button
          onClick={() => setIsPhysicsOpen(!isPhysicsOpen)}
          className={`glass-panel p-3 cursor-pointer flex items-center justify-center border transition-all duration-300 hover:shadow-glow ${
            isPhysicsOpen
              ? 'border-cyan-400 text-cyan-400 bg-[rgba(0,240,255,0.1)]'
              : 'border-[rgba(255,255,255,0.1)] text-slate-400 hover:border-cyan-400 hover:text-cyan-400'
          }`}
          title="Open Developer Console"
        >
          <Sliders className="w-5 h-5" />
        </button>

        {/* Quick Reset State Button (Only visible on GameOver/Start) */}
        {gameState !== 'PLAYING' && (
          <button
            onClick={() => {
              if (window.confirm('Reset local leaderboard high score?')) {
                setHighScore(0);
                localStorage.removeItem(LOCAL_STORAGE_HIGH_SCORE_KEY);
              }
            }}
            className="glass-panel p-3 cursor-pointer flex items-center justify-center border border-[rgba(255,255,255,0.1)] text-slate-400 hover:border-pink-500 hover:text-pink-500 transition-all duration-300 hover:shadow-glow"
            title="Reset Score Cache"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
