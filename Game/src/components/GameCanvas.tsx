import React, { useEffect, useRef } from 'react';
import type { GameState, PhysicsConfig, Particle, Obstacle, PlayerState } from '../types/game';

const DEBUG_MODE = true; // Visual Collision Debugger flag

interface GameCanvasProps {
  gameState: GameState;
  physicsConfig: PhysicsConfig;
  score: number;
  setScore: (score: number) => void;
  stabilityIndex: number;
  setStabilityIndex: (stability: number) => void;
  onGameOver: (finalScore: number) => void;
  onStartGame: () => void;
}

const VIRTUAL_HEIGHT = 500;

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  physicsConfig,
  score,
  setScore,
  stabilityIndex,
  setStabilityIndex,
  onGameOver,
  onStartGame,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Use refs for hot loop physics and variables to ensure 60fps and avoid stale React states
  const gameStateRef = useRef<GameState>(gameState);
  const physicsConfigRef = useRef<PhysicsConfig>(physicsConfig);
  const animationFrameIdRef = useRef<number | null>(null);
  
  // Game Entities Refs
  const playerRef = useRef<PlayerState>({
    y: 250,
    vy: 0,
    radius: 16,
    rotation: 0,
    trailHue: 180, // Cyan default
  });
  const obstaclesRef = useRef<Obstacle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  
  // Background Scroll Positions
  const scrollRef = useRef({
    grid: 0,
    skyline: 0,
    highway: 0,
  });

  // Gameplay tracking refs
  const scoreRef = useRef<number>(score);
  const stabilityRef = useRef<number>(stabilityIndex);
  const lastSpawnTimeRef = useRef<number>(0);
  const shakeFramesLeftRef = useRef<number>(0);
  const isDeadRef = useRef<boolean>(false);
  const finalScoreCalledRef = useRef<boolean>(false);

  // Procedural skyline building generator (built once on load to support wide screens)
  const skylineRef = useRef<{ x: number; width: number; height: number; lights: { x: number; y: number; on: boolean }[] }[]>([]);

  // Sync props to refs
  useEffect(() => {
    gameStateRef.current = gameState;
    if (gameState === 'PLAYING') {
      // Focus canvas when transitioning to playing state
      canvasRef.current?.focus();
      // Reset game parameters when transition to PLAYING
      playerRef.current = {
        y: 250,
        vy: 0,
        radius: 16,
        rotation: 0,
        trailHue: 180,
      };
      obstaclesRef.current = [];
      particlesRef.current = [];
      scoreRef.current = 0;
      stabilityRef.current = 100;
      lastSpawnTimeRef.current = performance.now();
      shakeFramesLeftRef.current = 0;
      isDeadRef.current = false;
      finalScoreCalledRef.current = false;
      setScore(0);
      setStabilityIndex(100);
    }
  }, [gameState, setScore, setStabilityIndex]);

  useEffect(() => {
    physicsConfigRef.current = physicsConfig;
  }, [physicsConfig]);

  // Generate procedural buildings for the parallax background (up to 3000px horizontally)
  useEffect(() => {
    const buildings: typeof skylineRef.current = [];
    let curX = 0;
    while (curX < 3000) {
      const width = Math.floor(Math.random() * 50) + 40;
      const height = Math.floor(Math.random() * 150) + 120;
      
      // Generate some windows for each building
      const lights: { x: number; y: number; on: boolean }[] = [];
      const cols = Math.floor(width / 12);
      const rows = Math.floor(height / 15);
      for (let r = 2; r < rows - 1; r++) {
        for (let c = 1; c < cols - 1; c++) {
          lights.push({
            x: c * 12 + 4,
            y: r * 15,
            on: Math.random() > 0.45,
          });
        }
      }

      buildings.push({ x: curX, width, height, lights });
      curX += width + (Math.random() * 15 - 5);
    }
    skylineRef.current = buildings;
  }, []);

  // Jump control
  const triggerJump = () => {
    if (gameStateRef.current !== 'PLAYING' || isDeadRef.current) return;
    
    // Set upwards velocity
    playerRef.current.vy = -physicsConfigRef.current.jumpForce;
    
    // Spawn flight trail particle burst at player's tail position (relative to fixed X: 180)
    const density = physicsConfigRef.current.particleDensity;
    const player = playerRef.current;
    
    for (let i = 0; i < density; i++) {
      const angle = Math.PI + (Math.random() * 0.4 - 0.2); // Squirting backwards
      const speed = Math.random() * 3 + 2;
      const spreadY = Math.random() * 10 - 5;
      
      particlesRef.current.push({
        x: 180 - 10,
        y: player.y + spreadY,
        vx: Math.cos(angle) * speed - physicsConfigRef.current.horizontalSpeed * 0.5,
        vy: Math.sin(angle) * speed + player.vy * 0.2,
        radius: Math.random() * 4 + 2,
        color: `hsla(${(player.trailHue + Math.random() * 40 - 20) % 360}, 100%, 65%, 1)`,
        alpha: 1.0,
        decay: Math.random() * 0.02 + 0.015,
        glow: true,
        type: 'trail',
      });
    }
    
    // Rotate slightly upward
    player.rotation = -0.3;
    // Cycle trail color hue
    player.trailHue = (player.trailHue + 15) % 360;
  };

  // Keyboard, Click & Touch handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault(); // Stop page scrolling
        if (gameStateRef.current === 'PLAYING') {
          triggerJump();
        } else {
          onStartGame();
        }
      }
    };

    const handleTouch = (e: TouchEvent) => {
      // Only jump or start if clicking directly on the canvas area
      if (e.target === canvasRef.current) {
        e.preventDefault();
        if (gameStateRef.current === 'PLAYING') {
          triggerJump();
        } else {
          onStartGame();
        }
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.target === canvasRef.current) {
        if (gameStateRef.current === 'PLAYING') {
          triggerJump();
        } else {
          onStartGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouch, { passive: false });
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [onStartGame]);

  // Main Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas scaling to match container size dynamically
    const resizeCanvas = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      // Full viewport coordinates without letterboxing
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Frame runner
    const updateAndRender = (timestamp: number) => {
      if (!ctx || !canvas) return;

      const currentScale = canvas.height / VIRTUAL_HEIGHT;
      const virtualWidth = canvas.width / currentScale;
      
      const config = physicsConfigRef.current;
      const player = playerRef.current;

      // -------------------------------------------------------
      // GAME MECHANICS UPDATE (Only when PLAYING)
      // -------------------------------------------------------
      if (gameStateRef.current === 'PLAYING') {
        if (!isDeadRef.current) {
          const activeRadius = player.radius - 5;
          // Physics: Gravitational Pull
          player.vy += config.gravity;
          // Clamp velocity to terminal speed limit
          if (player.vy > config.maxVerticalSpeed) player.vy = config.maxVerticalSpeed;
          if (player.vy < -config.maxVerticalSpeed) player.vy = -config.maxVerticalSpeed;
          
          player.y += player.vy;
          
          // Rotation: Tilt dynamically based on speed
          player.rotation = player.vy * 0.04;

          // Parallax Scroll calculations
          scrollRef.current.grid = (scrollRef.current.grid + config.horizontalSpeed * 0.2) % 40;
          scrollRef.current.skyline = (scrollRef.current.skyline + config.horizontalSpeed * 0.1) % 3000;
          scrollRef.current.highway = (scrollRef.current.highway + config.horizontalSpeed * 0.6) % 80;

          // Obstacle Generation Timer
          if (timestamp - lastSpawnTimeRef.current > config.obstacleSpawnInterval) {
            // Generate neon laser pillars
            const pipeWidth = 65;
            const minHeight = 60;
            const maxHeight = VIRTUAL_HEIGHT - config.gapHeight - minHeight;
            const topHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
            const bottomY = topHeight + config.gapHeight;

            obstaclesRef.current.push({
              id: Math.random().toString(36).substr(2, 9),
              x: virtualWidth + 50,
              width: pipeWidth,
              topHeight,
              bottomY,
              passed: false,
              pulsePhase: Math.random() * Math.PI,
            });

            lastSpawnTimeRef.current = timestamp;
          }

          // Move Obstacles
          let minDistanceToLaser = Infinity;
          const px = 180; // Fixed player horizontal position relative to left screen edge
          
          obstaclesRef.current.forEach((obs) => {
            obs.x -= config.horizontalSpeed;
            obs.pulsePhase += 0.05; // speed of glowing pulse animation
            
            // Proximity scoring: check if player is currently overlapping the horizontal span of obstacle
            const inRangeX = px + player.radius >= obs.x && px - player.radius <= obs.x + obs.width;
            if (inRangeX) {
              // Calculate distance for Stability Index
              const vertDist = Math.min(
                Math.abs((player.y - player.radius) - obs.topHeight),
                Math.abs(obs.bottomY - (player.y + player.radius))
              );
              
              if (vertDist < minDistanceToLaser) {
                minDistanceToLaser = vertDist;
              }
            }

            // --- COLLISION SECTION ---
            // Only perform collision checks for obstacles close to the player to save performance and avoid phantom hits
            const playerX = 180;
            const isNear = obs.x < playerX + 150 && obs.x + obs.width > playerX - 150;
            
            if (isNear) {
              // 1. Sync Widths with exact visually rendered pulsating column
              const obstacleWidth = obs.width + Math.sin(obs.pulsePhase) * 2.5;
              const obstacleX = obs.x + (obs.width - obstacleWidth) / 2;
              
              // Surgical Narrowing: Hitbox is only 60% of the visual width, centered
              const collisionWidth = obstacleWidth * 0.6;
              const collisionStartX = obstacleX + (obstacleWidth * 0.2);
              
              const playerY = player.y;
              
              // 2. Check X-axis overlap using narrowed hitbox bounds
              const overlapsX = (playerX + activeRadius > collisionStartX) && 
                                (playerX - activeRadius < collisionStartX + collisionWidth);

              // 3. IF player is within horizontal bounds, THEN check Y-axis (Safe Zone Check)
              if (overlapsX) {
                const gapTopY = obs.topHeight;
                const gapBottomY = obs.bottomY;

                // Player is ONLY safe if they are inside the gap vertically with 2px extra padding
                const isSafeTop = (playerY - activeRadius > gapTopY + 2);
                const isSafeBottom = (playerY + activeRadius < gapBottomY - 2);

                if (!isSafeTop || !isSafeBottom) {
                  triggerCrash();
                }
              }
            }

            // Score Incrementing
            if (!obs.passed && obs.x + obs.width < playerX - player.radius) {
              obs.passed = true;
              scoreRef.current += 1;
              setScore(scoreRef.current);
            }
          });

          // Filter out off-screen obstacles
          obstaclesRef.current = obstaclesRef.current.filter((obs) => obs.x + obs.width > -100);

          // Boundaries crash check (Ground/Ceiling) using the activeRadius and visible ground
          const groundY = VIRTUAL_HEIGHT - 35; // actual visible ground level
          if (player.y + activeRadius > groundY || player.y - activeRadius < 0) {
            triggerCrash();
          }

          // Stability Index Logic: Decay index if extremely close to lasers (warning under 45px), regenerate if safe
          if (minDistanceToLaser < 45) {
            // Decays faster the closer the player is to the hazard bounds
            const penalty = Math.max(0.3, (45 - minDistanceToLaser) * 0.08);
            stabilityRef.current = Math.max(0, stabilityRef.current - penalty);
          } else {
            stabilityRef.current = Math.min(100, stabilityRef.current + 0.30); // fast regen
          }
          
          // Truncate stability digits for rendering and update hook
          const nextStability = Math.floor(stabilityRef.current);
          if (nextStability !== stabilityIndex) {
            setStabilityIndex(nextStability);
          }
        } else {
          // Dead state: fall to ground
          player.vy += config.gravity * 1.2;
          player.y += player.vy;
          player.rotation += 0.15; // rotate frantically on fall
          
          if (player.y + player.radius >= VIRTUAL_HEIGHT) {
            player.y = VIRTUAL_HEIGHT - player.radius;
            player.vy = 0;
            
            // Finish and dispatch Game Over State
            if (!finalScoreCalledRef.current) {
              finalScoreCalledRef.current = true;
              setTimeout(() => {
                onGameOver(scoreRef.current);
              }, 600);
            }
          }
        }
      }

      // Update Particles (Trails and Death Sparks)
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
      });
      particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0);

      // -------------------------------------------------------
      // RENDERING PIPELINE
      // -------------------------------------------------------
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Save canvas state
      ctx.save();
      // Apply aspect scaling factor
      ctx.scale(currentScale, currentScale);

      // Apply screen shake translate matrix if active
      if (shakeFramesLeftRef.current > 0) {
        const shakeIntensity = 6;
        const dx = (Math.random() - 0.5) * shakeIntensity;
        const dy = (Math.random() - 0.5) * shakeIntensity;
        ctx.translate(dx, dy);
        shakeFramesLeftRef.current--;
      }

      // Draw Layers
      drawDeepGrid(ctx, virtualWidth);
      drawSkyline(ctx);
      drawHighway(ctx, virtualWidth);
      drawObstacles(ctx);
      drawParticles(ctx);
      drawPlayer(ctx);

      // --- DEBUG DRAWING ---
      if (DEBUG_MODE) {
        drawDebugHitboxes(ctx);
      }

      // Restore states
      ctx.restore();

      animationFrameIdRef.current = requestAnimationFrame(updateAndRender);
    };

    const triggerCrash = () => {
      if (isDeadRef.current) return;
      isDeadRef.current = true;
      shakeFramesLeftRef.current = physicsConfigRef.current.screenShakeDuration;

      // Spawn massive explosion particles
      const count = 45;
      const player = playerRef.current;
      const colors = ['#00f0ff', '#ff007f', '#ffffff', '#ffd700', '#9d00ff'];
      const px = 180;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 3;
        
        particlesRef.current.push({
          x: px,
          y: player.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 5 + 1.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1.0,
          decay: Math.random() * 0.02 + 0.01,
          glow: true,
          type: 'explosion',
        });
      }
    };

    // --- VISUAL COLLISION DEBUGGER ---
    const drawDebugHitboxes = (c: CanvasRenderingContext2D) => {
      const activeRadius = playerRef.current.radius - 5;
      const playerX = 180;
      
      c.save();
      c.shadowBlur = 0; // Disable shadows for debug lines
      c.globalAlpha = 1.0;
      
      // Draw Obstacle Hitboxes
      obstaclesRef.current.forEach((obs) => {
        const obstacleWidth = obs.width + Math.sin(obs.pulsePhase) * 2.5;
        const obstacleX = obs.x + (obs.width - obstacleWidth) / 2;
        
        // Surgical Narrowing: Draw the narrowed 60% hitbox centered
        const collisionWidth = obstacleWidth * 0.6;
        const collisionStartX = obstacleX + (obstacleWidth * 0.2);
        
        // 1. Red rectangles for exact narrowed column hitboxes
        c.strokeStyle = '#ff3333';
        c.lineWidth = 2;
        
        // Top pillar
        c.strokeRect(collisionStartX, 0, collisionWidth, obs.topHeight);
        
        // Bottom pillar
        c.strokeRect(collisionStartX, obs.bottomY, collisionWidth, VIRTUAL_HEIGHT - obs.bottomY);
        
        // 2. Yellow lines for strict safe zone buffers (+2/-2 padding) inside the narrowed X bounds
        c.strokeStyle = '#ffff33';
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(collisionStartX, obs.topHeight + 2);
        c.lineTo(collisionStartX + collisionWidth, obs.topHeight + 2);
        c.moveTo(collisionStartX, obs.bottomY - 2);
        c.lineTo(collisionStartX + collisionWidth, obs.bottomY - 2);
        c.stroke();
      });

      // 3. Green circle for exact player core hitbox
      c.strokeStyle = '#33ff33';
      c.lineWidth = 2;
      c.beginPath();
      c.arc(playerX, playerRef.current.y, activeRadius, 0, Math.PI * 2);
      c.stroke();
      
      c.restore();
    };

    // -------------------------------------------------------
    // CANVAS DRAWING HELPER FUNCTIONS
    // -------------------------------------------------------

    // Draw deep-space parallax grid lines
    const drawDeepGrid = (c: CanvasRenderingContext2D, width: number) => {
      c.strokeStyle = 'rgba(15, 20, 60, 0.5)';
      c.lineWidth = 1;
      
      const scroll = scrollRef.current.grid;
      
      // Vertical grid lines
      for (let x = -scroll; x < width; x += 40) {
        c.beginPath();
        c.moveTo(x, 0);
        c.lineTo(x, VIRTUAL_HEIGHT);
        c.stroke();
      }
      
      // Horizontal grid lines
      for (let y = 0; y < VIRTUAL_HEIGHT; y += 40) {
        c.beginPath();
        c.moveTo(0, y);
        c.lineTo(width, y);
        c.stroke();
      }
    };

    // Draw skyline parallax silhouette
    const drawSkyline = (c: CanvasRenderingContext2D) => {
      const scroll = scrollRef.current.skyline;
      c.fillStyle = '#080816';
      
      c.save();
      // Draw first pass
      c.translate(-scroll, 0);
      renderSkylineBuildings(c);
      
      // Draw second wrap-around pass to prevent gaps
      c.translate(3000, 0);
      renderSkylineBuildings(c);
      c.restore();
    };

    const renderSkylineBuildings = (c: CanvasRenderingContext2D) => {
      const buildings = skylineRef.current;
      buildings.forEach((b) => {
        const yPos = VIRTUAL_HEIGHT - b.height - 30; // 30px above bottom highway base
        
        // Base structure
        c.fillStyle = '#080816';
        c.fillRect(b.x, yPos, b.width, b.height);
        
        // Dark metallic building borders
        c.strokeStyle = '#12122c';
        c.lineWidth = 2;
        c.strokeRect(b.x, yPos, b.width, b.height);

        // Cyberpunk glowing windows/lights
        b.lights.forEach((light) => {
          if (light.on) {
            c.fillStyle = Math.random() > 0.02 ? 'rgba(0, 240, 255, 0.45)' : 'rgba(255, 0, 127, 0.45)';
            c.fillRect(b.x + light.x, yPos + light.y, 6, 6);
          }
        });
      });
    };

    // Draw lower glowing energy grid and rails
    const drawHighway = (c: CanvasRenderingContext2D, width: number) => {
      const highwayY = VIRTUAL_HEIGHT - 35;
      
      // Solid bottom block
      c.fillStyle = '#05050f';
      c.fillRect(0, highwayY, width, 35);
      
      // Top neon highway line
      c.shadowBlur = 10;
      c.shadowColor = '#00f0ff';
      c.strokeStyle = '#00f0ff';
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(0, highwayY);
      c.lineTo(width, highwayY);
      c.stroke();
      
      // Glowing secondary indicator lines
      c.strokeStyle = 'rgba(255, 0, 127, 0.6)';
      c.shadowColor = '#ff007f';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(0, highwayY + 12);
      c.lineTo(width, highwayY + 12);
      c.stroke();
      
      // Moving dashes along the highway (creates illusion of speed)
      c.strokeStyle = 'rgba(0, 240, 255, 0.7)';
      c.shadowColor = '#00f0ff';
      c.lineWidth = 3;
      const dashScroll = scrollRef.current.highway;
      c.beginPath();
      for (let x = -dashScroll; x < width + 80; x += 80) {
        c.moveTo(x, highwayY);
        c.lineTo(x + 35, highwayY);
      }
      c.stroke();
      
      // Clear shadow properties
      c.shadowBlur = 0;
    };

    // Draw neon column barriers
    const drawObstacles = (c: CanvasRenderingContext2D) => {
      obstaclesRef.current.forEach((obs) => {
        // Render pulse width animation
        const pulse = Math.sin(obs.pulsePhase) * 2.5;
        const outerWidth = obs.width + pulse;

        // --- DRAW UPPER LASER GATE ---
        drawSingleLaserColumn(c, obs.x + (obs.width - outerWidth) / 2, 0, outerWidth, obs.topHeight, '#ff007f');

        // --- DRAW LOWER LASER GATE ---
        drawSingleLaserColumn(c, obs.x + (obs.width - outerWidth) / 2, obs.bottomY, outerWidth, VIRTUAL_HEIGHT - obs.bottomY - 35, '#ff007f');
      });
    };

    const drawSingleLaserColumn = (
      c: CanvasRenderingContext2D, 
      x: number, 
      y: number, 
      w: number, 
      h: number,
      glowColor: string
    ) => {
      c.save();
      
      // 1. Draw glowing background laser bloom
      c.shadowColor = glowColor;
      c.shadowBlur = 20;
      c.fillStyle = 'rgba(255, 0, 127, 0.15)';
      c.fillRect(x, y, w, h);
      
      // 2. Draw outer glowing casing gradients
      const outerGrad = c.createLinearGradient(x, y, x + w, y);
      outerGrad.addColorStop(0, 'rgba(255, 0, 127, 0.4)');
      outerGrad.addColorStop(0.3, 'rgba(255, 0, 127, 0.85)');
      outerGrad.addColorStop(0.5, '#ffffff'); // bright center highlight
      outerGrad.addColorStop(0.7, 'rgba(255, 0, 127, 0.85)');
      outerGrad.addColorStop(1, 'rgba(255, 0, 127, 0.4)');
      
      c.shadowBlur = 8;
      c.fillStyle = outerGrad;
      c.fillRect(x + w * 0.15, y, w * 0.7, h);

      // 3. Draw white-hot energy core (laser center core)
      c.shadowColor = '#ffffff';
      c.shadowBlur = 4;
      c.fillStyle = '#ffffff';
      c.fillRect(x + w * 0.4, y, w * 0.2, h);

      // 4. Draw metal conduit capping base
      const capHeight = 15;
      const isTopPipe = y === 0;
      const capY = isTopPipe ? h - capHeight : y;
      
      c.shadowBlur = 0;
      // Draw cap base back
      c.fillStyle = '#111124';
      c.fillRect(x - 4, capY, w + 8, capHeight);
      
      // Draw neon indicator border around cap
      c.strokeStyle = '#00f0ff';
      c.lineWidth = 1.5;
      c.shadowColor = '#00f0ff';
      c.shadowBlur = 5;
      c.strokeRect(x - 4, capY, w + 8, capHeight);
      
      // Glowing dot indicators on the laser emitter cap
      c.fillStyle = '#ff007f';
      c.shadowColor = '#ff007f';
      c.beginPath();
      c.arc(x + w / 2, capY + capHeight / 2, 3, 0, Math.PI * 2);
      c.fill();

      c.restore();
    };

    // Draw active particle collections
    const drawParticles = (c: CanvasRenderingContext2D) => {
      c.save();
      particlesRef.current.forEach((p) => {
        c.fillStyle = p.color;
        c.globalAlpha = p.alpha;
        
        if (p.glow) {
          c.shadowColor = p.color;
          c.shadowBlur = p.type === 'explosion' ? 12 : 6;
        } else {
          c.shadowBlur = 0;
        }

        c.beginPath();
        c.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        c.fill();
      });
      c.restore();
    };

    // Draw the glowing hover player flight core
    const drawPlayer = (c: CanvasRenderingContext2D) => {
      const px = 180; // Fixed horizontal position relative to left screen edge
      const player = playerRef.current;

      c.save();
      c.translate(px, player.y);
      c.rotate(player.rotation);

      // Set cyan/neon outer glow
      const ringColor = isDeadRef.current ? '#ff007f' : '#00f0ff';
      c.shadowColor = ringColor;
      c.shadowBlur = 18;
      
      // 1. Draw outer neon shell ring
      c.strokeStyle = ringColor;
      c.lineWidth = 4;
      c.beginPath();
      c.arc(0, 0, player.radius, 0, Math.PI * 2);
      c.stroke();

      // 2. Draw inner generator ring (energy core)
      c.shadowBlur = 8;
      c.strokeStyle = '#ffffff';
      c.lineWidth = 1.5;
      c.beginPath();
      c.arc(0, 0, player.radius * 0.6, 0, Math.PI * 2);
      c.stroke();
      
      // 3. Draw energy turbine spokes inside the player
      c.strokeStyle = 'rgba(0, 240, 255, 0.5)';
      c.lineWidth = 2;
      c.shadowBlur = 0;
      const spokeCount = 4;
      const animationOffset = (performance.now() * 0.005) % (Math.PI * 2);
      for (let i = 0; i < spokeCount; i++) {
        const spokeAngle = (i * (Math.PI * 2)) / spokeCount + animationOffset;
        c.beginPath();
        c.moveTo(Math.cos(spokeAngle) * (player.radius * 0.2), Math.sin(spokeAngle) * (player.radius * 0.2));
        c.lineTo(Math.cos(spokeAngle) * (player.radius * 0.55), Math.sin(spokeAngle) * (player.radius * 0.55));
        c.stroke();
      }

      // 4. Draw central core emitter block
      c.fillStyle = isDeadRef.current ? '#ffffff' : '#ffd700';
      c.shadowColor = isDeadRef.current ? '#ff007f' : '#ffd700';
      c.shadowBlur = 10;
      c.beginPath();
      c.arc(0, 0, player.radius * 0.25, 0, Math.PI * 2);
      c.fill();

      // 5. Draw decorative cyber-thruster flame behind ring
      if (!isDeadRef.current) {
        c.shadowColor = '#ff007f';
        c.shadowBlur = 8;
        c.fillStyle = '#ff007f';
        c.beginPath();
        // Thruster flame scales slightly with downward speed
        const flameLength = Math.max(12, 12 - player.vy * 1.5);
        c.moveTo(-player.radius * 0.9, -4);
        c.lineTo(-player.radius * 0.9 - flameLength, 0);
        c.lineTo(-player.radius * 0.9, 4);
        c.closePath();
        c.fill();
      }

      c.restore();
    };

    // Run animation frames
    animationFrameIdRef.current = requestAnimationFrame(updateAndRender);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [gameState, stabilityIndex, setScore, setStabilityIndex, onGameOver, onStartGame]);

  return (
    <div 
      ref={containerRef} 
      className="w-screen h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-[#060713] to-[#010103]"
    >
      {/* Absolute grid and scanline graphics behind Canvas for maximum CRT cyber arcade glow */}
      <div className="cyber-grid" />
      <div className="scanlines" />

      {/* Primary Game Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full block z-5 bg-transparent"
        style={{
          outline: 'none',
        }}
        tabIndex={0}
      />
    </div>
  );
};
