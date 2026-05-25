import React from 'react';
import { Trophy, Activity, Cpu, Shield } from 'lucide-react';

interface HUDProps {
  score: number;
  highScore: number;
  stabilityIndex: number;
  gameState: 'START' | 'PLAYING' | 'GAMEOVER';
}

export const HUD: React.FC<HUDProps> = ({
  score,
  highScore,
  stabilityIndex,
  gameState,
}) => {
  if (gameState !== 'PLAYING') return null;

  // Determine warning levels for the stability index
  const isUnstable = stabilityIndex < 35;
  const isCritical = stabilityIndex < 15;
  
  let stabilityStatus = 'STABLE';
  let statusColorClass = 'neon-text-cyan';
  
  if (isCritical) {
    stabilityStatus = 'CRITICAL CORRUPTION';
    statusColorClass = 'neon-text-pink';
  } else if (isUnstable) {
    stabilityStatus = 'UNSTABLE TRACE';
    statusColorClass = 'neon-text-yellow';
  }

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 p-6 flex flex-col justify-between font-sans">
      
      {/* Top Bar: Scores and Core HUD Info */}
      <div className="w-full flex justify-between items-start">
        
        {/* Left Side: Score Board */}
        <div className="glass-panel px-5 py-3 border border-[rgba(0,240,255,0.2)] flex items-center gap-4 bg-[rgba(10,11,30,0.5)]">
          <div className="flex flex-col">
            <span className="text-[0.7rem] uppercase tracking-[0.2em] text-cyan-400 font-mono flex items-center gap-1">
              <Cpu className="w-3 h-3 text-cyan-400 animate-pulse" />
              TRACTOR NODE
            </span>
            <span className="text-4xl font-extrabold text-white tracking-wider font-display neon-text-cyan">
              {score.toString().padStart(4, '0')}
            </span>
          </div>
        </div>

        {/* Center: System Header Decors */}
        <div className="hidden md-flex flex-col items-center glass-panel px-4 py-1 text-[0.65rem] tracking-[0.3em] font-mono text-slate-500 border border-slate-800">
          <span>CYBERGLIDE CORE v1.0.0</span>
          <span className="text-cyan-500 animate-pulse">SYSTEM LINK ACTIVE</span>
        </div>

        {/* Right Side: High Score */}
        <div className="glass-panel px-5 py-3 border border-[rgba(255,0,127,0.2)] flex items-center gap-4 bg-[rgba(10,11,30,0.5)]">
          <div className="flex flex-col items-end">
            <span className="text-[0.7rem] uppercase tracking-[0.2em] text-pink-500 font-mono flex items-center gap-1">
              <Trophy className="w-3 h-3 text-pink-500" />
              MAX RECORD
            </span>
            <span className="text-2xl font-bold text-white tracking-wider font-display neon-text-pink">
              {highScore.toString().padStart(4, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar: System Stability Index */}
      <div className="w-full flex justify-center items-end">
        <div className="glass-panel w-full max-w-md p-4 border border-[rgba(0,240,255,0.15)] bg-[rgba(10,11,30,0.6)]">
          <div className="flex justify-between items-center mb-2 font-mono text-[0.75rem] tracking-wider">
            <span className="flex items-center gap-1-5 text-slate-400">
              <Activity className={`w-3.5 h-3.5 ${isCritical ? 'text-rose-500 animate-ping' : 'text-cyan-400'}`} />
              STABILITY INDEX
            </span>
            <span className={`font-bold transition-colors duration-200 ${statusColorClass}`}>
              {stabilityStatus} ({stabilityIndex}%)
            </span>
          </div>
          
          {/* Stability progress bar wrapper */}
          <div className="hud-indicator-bar">
            <div 
              className={`hud-indicator-fill ${isUnstable ? 'warning' : ''}`}
              style={{ width: `${stabilityIndex}%` }}
            />
          </div>

          {/* Decorative Corner Markers */}
          <div className="flex justify-between mt-1 text-[0.55rem] font-mono text-slate-600">
            <span>[SYS_ERR: 0.0%]</span>
            <span className="flex items-center gap-1">
              <Shield className="w-2.5 h-2.5" />
              SECURE DEEPNET LINK
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
