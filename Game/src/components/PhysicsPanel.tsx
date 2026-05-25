import React from 'react';
import { X, RotateCcw, Sliders, Info, ShieldAlert } from 'lucide-react';
import type { PhysicsConfig } from '../types/game';

interface PhysicsPanelProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  config: PhysicsConfig;
  onChange: (newConfig: PhysicsConfig) => void;
  defaultConfig: PhysicsConfig;
}

export const PhysicsPanel: React.FC<PhysicsPanelProps> = ({
  isOpen,
  setIsOpen,
  config,
  onChange,
  defaultConfig,
}) => {
  const updateConfigVal = (key: keyof PhysicsConfig, value: number) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 glass-panel border-l border-[rgba(0,240,255,0.25)] rounded-none rounded-l-2xl z-40 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] p-6 bg-[rgba(5,5,15,0.85)] flex flex-col justify-between ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{
        boxShadow: isOpen ? '-10px 0 30px rgba(0, 0, 0, 0.7)' : 'none',
      }}
    >
      <div>
        {/* Header section */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
          <h3 className="font-display text-sm tracking-[0.15em] text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            PHYSICS DEVEVAL
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-cyan-400 hover:shadow-glow transition-all duration-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative message */}
        <div className="mb-6 p-3 bg-[rgba(255,0,127,0.1)] border border-[rgba(255,0,127,0.2)] rounded-md flex gap-2 items-start">
          <ShieldAlert className="w-4.5 h-4.5 text-pink-500 shrink-0 mt-0.5" />
          <p className="text-[0.7rem] font-mono text-pink-300 leading-relaxed">
            WARN: Live modifications compile in hot-loops instantly. Higher gravity/speeds require precise thrusting response!
          </p>
        </div>

        {/* Sliders Area */}
        <div className="flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-290px)] pr-1">
          
          {/* Gravity Slider */}
          <div className="cyber-slider-container">
            <div className="cyber-slider-label">
              <span>GRAV_ACCEL</span>
              <span className="cyber-slider-value">{config.gravity.toFixed(2)} px</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.2"
              step="0.05"
              value={config.gravity}
              onChange={(e) => updateConfigVal('gravity', parseFloat(e.target.value))}
              className="cyber-slider"
            />
          </div>

          {/* Jump Force Slider */}
          <div className="cyber-slider-container">
            <div className="cyber-slider-label">
              <span>THRUST_IMPULSE</span>
              <span className="cyber-slider-value">{config.jumpForce.toFixed(1)} px</span>
            </div>
            <input
              type="range"
              min="3.0"
              max="13.0"
              step="0.2"
              value={config.jumpForce}
              onChange={(e) => updateConfigVal('jumpForce', parseFloat(e.target.value))}
              className="cyber-slider pink"
            />
          </div>

          {/* Horizontal Speed Slider */}
          <div className="cyber-slider-container">
            <div className="cyber-slider-label">
              <span>CORE_SPEED</span>
              <span className="cyber-slider-value">{config.horizontalSpeed.toFixed(1)} px</span>
            </div>
            <input
              type="range"
              min="2.0"
              max="9.0"
              step="0.5"
              value={config.horizontalSpeed}
              onChange={(e) => updateConfigVal('horizontalSpeed', parseFloat(e.target.value))}
              className="cyber-slider"
            />
          </div>

          {/* Obstacle Spawn Interval Slider */}
          <div className="cyber-slider-container">
            <div className="cyber-slider-label">
              <span>GATE_FREQUENCY</span>
              <span className="cyber-slider-value">{config.obstacleSpawnInterval} ms</span>
            </div>
            <input
              type="range"
              min="800"
              max="2400"
              step="50"
              value={config.obstacleSpawnInterval}
              onChange={(e) => updateConfigVal('obstacleSpawnInterval', parseInt(e.target.value))}
              className="cyber-slider pink"
            />
          </div>

          {/* Gap Height Slider */}
          <div className="cyber-slider-container">
            <div className="cyber-slider-label">
              <span>GATE_GAP_SIZE</span>
              <span className="cyber-slider-value">{config.gapHeight} px</span>
            </div>
            <input
              type="range"
              min="110"
              max="230"
              step="5"
              value={config.gapHeight}
              onChange={(e) => updateConfigVal('gapHeight', parseInt(e.target.value))}
              className="cyber-slider"
            />
          </div>

          {/* Particle Density Slider */}
          <div className="cyber-slider-container">
            <div className="cyber-slider-label">
              <span>PARTICLE_EMISSION</span>
              <span className="cyber-slider-value">{config.particleDensity} nodes</span>
            </div>
            <input
              type="range"
              min="4"
              max="25"
              step="1"
              value={config.particleDensity}
              onChange={(e) => updateConfigVal('particleDensity', parseInt(e.target.value))}
              className="cyber-slider pink"
            />
          </div>

        </div>
      </div>

      {/* Panel Bottom controls */}
      <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
        <button
          onClick={() => onChange(defaultConfig)}
          className="btn-cyber w-full py-2-5 text-xs flex justify-center items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          RESET DEFAULTS
        </button>
        <div className="flex items-center gap-1-5 justify-center text-[0.6rem] font-mono text-slate-500">
          <Info className="w-3 h-3 text-cyan-400" />
          <span>REAL-TIME ENGINE TUNING CORE</span>
        </div>
      </div>
    </div>
  );
};
