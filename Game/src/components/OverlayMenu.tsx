import React from 'react';
import { Play, RotateCcw, Award, Zap, Compass } from 'lucide-react';
import type { GameState } from '../types/game';

interface OverlayMenuProps {
  gameState: GameState;
  score: number;
  highScore: number;
  onStartGame: () => void;
}

export const OverlayMenu: React.FC<OverlayMenuProps> = ({
  gameState,
  score,
  highScore,
  onStartGame,
}) => {
  if (gameState === 'PLAYING') return null;

  const isStart = gameState === 'START';
  const isNewHighScore = !isStart && score > 0 && score >= highScore;

  return (
    <div className="absolute inset-0 w-full h-full z-20 flex items-center justify-center bg-[rgba(3,3,10,0.65)] backdrop-filter backdrop-blur-md p-6 font-sans">
      
      {/* Decorative Grid Corners */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-cyan-400 opacity-40" />
      <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-cyan-400 opacity-40" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-cyan-400 opacity-40" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-cyan-400 opacity-40" />

      {/* Main Container */}
      <div className="glass-panel w-full max-w-lg p-8 md:p-12 text-center border-2 border-[rgba(0,240,255,0.25)] cyan-neon flex flex-col items-center relative overflow-hidden bg-[rgba(10,11,30,0.8)]">
        
        {/* Animated Cyber-Decors inside card */}
        <div className="absolute -right-20 -top-20 w-40 h-40 bg-pink-500 rounded-full filter blur-[80px] opacity-20 pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-cyan-500 rounded-full filter blur-[80px] opacity-20 pointer-events-none" />

        {isStart ? (
          /* ==========================================
             START GAME SCREEN
             ========================================== */
          <>
            {/* Cyber Logo / Header */}
            <div className="mb-2 text-[0.65rem] tracking-[0.4em] font-mono text-cyan-400 flex items-center gap-1-5 justify-center">
              <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              PILOT INTERFACE INITIATED
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-[0.15em] font-display neon-text-cyan glitch-text mb-2">
              CYBERGLIDE
            </h1>
            
            <p className="text-slate-400 font-mono text-xs tracking-wider max-w-sm mx-auto mb-10 border-y border-slate-800 py-3">
              GUIDE THE FUTURISTIC ENERGY CORE THROUGH NEON BARRIERS. AVOID SECTORS CORRUPTION & KEEP STABILITY AT 100%.
            </p>

            {/* Jump Instruction Box */}
            <div className="mb-10 w-full max-w-xs p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-slate-800 font-mono text-left">
              <div className="text-[0.6rem] text-slate-500 tracking-wider mb-2 uppercase">CONTROL INPUTS:</div>
              <div className="flex justify-between items-center text-xs text-slate-300 mb-1.5">
                <span>[SPACEBAR] / [ARROW_UP]</span>
                <span className="text-cyan-400">THRUST</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>[MOUSE_LEFT_CLICK]</span>
                <span className="text-cyan-400">THRUST</span>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={onStartGame}
              className="btn-cyber w-full max-w-xs py-4 text-base font-extrabold cursor-pointer group"
            >
              <Play className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              LAUNCH ENGINE
            </button>
          </>
        ) : (
          /* ==========================================
             GAME OVER SCREEN
             ========================================== */
          <>
            {/* Warning Message */}
            <div className="mb-2 text-[0.65rem] tracking-[0.4em] font-mono text-pink-500 flex items-center gap-1-5 justify-center">
              <Zap className="w-3.5 h-3.5 animate-bounce" />
              SYSTEM CRITICAL CRASH
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-[0.12em] font-display neon-text-pink mb-6">
              SYSTEM OFFLINE
            </h1>

            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
              
              {/* Final Score Block */}
              <div className="glass-panel p-4 border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)]">
                <span className="text-[0.65rem] uppercase tracking-wider text-slate-400 font-mono block mb-1">
                  NODES PASSED
                </span>
                <span className="text-3xl font-bold text-white font-display">
                  {score}
                </span>
              </div>
              
              {/* Max Score Block */}
              <div className="glass-panel p-4 border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)]">
                <span className="text-[0.65rem] uppercase tracking-wider text-slate-400 font-mono block mb-1">
                  RECORD CACHE
                </span>
                <span className="text-3xl font-bold text-slate-300 font-display">
                  {Math.max(score, highScore)}
                </span>
              </div>
            </div>

            {/* New High Score Alert Badge */}
            {isNewHighScore && (
              <div className="mb-8 p-3 rounded-lg border border-[rgba(255,215,0,0.3)] bg-[rgba(255,215,0,0.05)] w-full max-w-sm flex items-center justify-center gap-2 animate-pulse">
                <Award className="w-5 h-5 text-yellow-400" />
                <span className="font-display font-extrabold text-[0.8rem] text-yellow-400 tracking-[0.15em] uppercase">
                  NEW RECORD DATA RECORDED
                </span>
              </div>
            )}

            {/* Restart Button */}
            <button
              onClick={onStartGame}
              className="btn-cyber pink w-full max-w-xs py-4 text-base font-extrabold cursor-pointer group"
            >
              <RotateCcw className="w-5 h-5 text-white group-hover:rotate-180 transition-transform duration-500" />
              SYSTEM REBOOT
            </button>
          </>
        )}

        {/* Diagnostic decorative tags */}
        <div className="mt-8 pt-4 border-t border-slate-900 w-full flex justify-between text-[0.55rem] font-mono text-slate-600">
          <span>PORT: 8080 // DEV_MODE: ACTIVE</span>
          <span>CYBERGLIDE NETWORK MODULE</span>
        </div>
      </div>
    </div>
  );
};
