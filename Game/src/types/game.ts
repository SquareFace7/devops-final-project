// TypeScript interfaces and types for CyberGlide (Neon Cyberpunk Flappy Game)

export type GameState = 'START' | 'PLAYING' | 'GAMEOVER';

export interface PhysicsConfig {
  gravity: number;             // Acceleration pulling player downward (px/frame^2)
  jumpForce: number;           // Instant upward velocity applied on jump (px/frame)
  horizontalSpeed: number;     // Speed at which obstacles and background move (px/frame)
  obstacleSpawnInterval: number; // Interval between spawning new obstacles (in milliseconds)
  gapHeight: number;           // Size of the gap between top and bottom lasers (px)
  maxVerticalSpeed: number;    // Terminal velocity limit to avoid excessive falling speeds (px/frame)
  particleDensity: number;     // Number of particles emitted on jump or explosion
  screenShakeDuration: number; // Length of screen shake in frames upon collision
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;      // Current opacity (1.0 to 0.0)
  decay: number;      // Opacity reduction rate per frame (e.g., 0.015)
  glow: boolean;      // Whether to apply shadowBlur neon glow rendering
  type: 'trail' | 'explosion';
}

export interface Obstacle {
  id: string;
  x: number;          // Left x-coordinate
  width: number;      // Column width
  topHeight: number;  // Y-coordinate of bottom edge of top column
  bottomY: number;    // Y-coordinate of top edge of bottom column
  passed: boolean;    // True if player has successfully flown past this obstacle
  pulsePhase: number; // Phase multiplier for animating the laser thickness/glow
}

export interface PlayerState {
  y: number;          // Vertical center position (px)
  vy: number;         // Vertical velocity (px/frame)
  radius: number;     // Colliding circle size (px)
  rotation: number;   // Angle in radians representing drone/orb tilt
  trailHue: number;   // Color-shifting hue index for jump trails
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
}
