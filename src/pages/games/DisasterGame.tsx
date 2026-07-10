import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, RotateCcw, Home, Trophy } from 'lucide-react';
import ElephantMascot from '@/components/ElephantMascot';

interface GameConfig {
  id: string;
  title: string;
  bgGradient: string;
  groundColor: string;
  hazardColor: string;
  hazardType: 'fire' | 'mud' | 'water' | 'wind';
  speed: number;
  gravity: number;
  jumpForce: number;
  chaseSpeed: number;
}

const gameConfigs: Record<string, GameConfig> = {
  mudslide: {
    id: 'mudslide',
    title: '泥石流逃生',
    bgGradient: 'from-amber-50 via-orange-50 to-yellow-50',
    groundColor: '#D2B48C',
    hazardColor: '#CD853F',
    hazardType: 'mud',
    speed: 2.5,
    gravity: 0.55,
    jumpForce: -16,
    chaseSpeed: 2.5,
  },
  fire: {
    id: 'fire',
    title: '火灾逃生',
    bgGradient: 'from-red-50 via-orange-50 to-amber-50',
    groundColor: '#A9A9A9',
    hazardColor: '#FF4500',
    hazardType: 'fire',
    speed: 2.8,
    gravity: 0.55,
    jumpForce: -16,
    chaseSpeed: 2.8,
  },
  flood: {
    id: 'flood',
    title: '洪水逃生',
    bgGradient: 'from-blue-50 via-cyan-50 to-teal-50',
    groundColor: '#87CEEB',
    hazardColor: '#00CED1',
    hazardType: 'water',
    speed: 2.0,
    gravity: 0.5,
    jumpForce: -15,
    chaseSpeed: 2.0,
  },
  typhoon: {
    id: 'typhoon',
    title: '台风逃生',
    bgGradient: 'from-indigo-50 via-purple-50 to-gray-100',
    groundColor: '#D3D3D3',
    hazardColor: '#9370DB',
    hazardType: 'wind',
    speed: 3.0,
    gravity: 0.6,
    jumpForce: -17,
    chaseSpeed: 3.0,
  },
};

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'rock' | 'fire' | 'water' | 'wind' | 'building';
  passed: boolean;
}

interface FallingRock {
  x: number;
  y: number;
  width: number;
  height: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
}

interface ChasingWave {
  x: number;
  height: number;
  amplitude: number;
  phase: number;
  isDashing: boolean;
  dashTimer: number;
}

interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Building {
  x: number;
  y: number;
  width: number;
  height: number;
  windows: { x: number; y: number; lit: boolean }[];
}

interface Raindrop {
  x: number;
  y: number;
  length: number;
  speed: number;
}

export default function DisasterGame() {
  const { id } = useParams<{ id: string }>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'lost'>('start');
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [skillCooldown, setSkillCooldown] = useState(0);
  const [skillReady, setSkillReady] = useState(true);
  const gameLoopRef = useRef<number | null>(null);
  const gameOverRef = useRef(false);
  const frameCountRef = useRef(0);
  const gameConfig = gameConfigs[id || 'mudslide'];

  const birdRef = useRef({
    x: 80,
    y: 200,
    width: 35,
    height: 35,
    velocityY: 0,
    isJumping: false,
    jumpCount: 0,
    isDashing: false,
    isInvincible: false,
  });

  const skillRef = useRef({
    dashDistance: 0,
    maxDashDistance: 0,
    lastUseTime: -20000,
    cooldown: 20000,
    isReady: true,
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const fallingRocksRef = useRef<FallingRock[]>([]);
  const chasingWaveRef = useRef<ChasingWave | null>(null);
  const platformsRef = useRef<Platform[]>([]);
  const buildingsRef = useRef<Building[]>([]);
  const raindropsRef = useRef<Raindrop[]>([]);
  const keysRef = useRef<Set<string>>(new Set());
  const distanceRef = useRef(0);
  const scoreRef = useRef(0);
  const lastObstacleTimeRef = useRef(0);
  const lastRockTimeRef = useRef(0);
  const canvasWidthRef = useRef(1200);
  const canvasHeightRef = useRef(600);

  const generateBuildings = useCallback(() => {
    const buildings: Building[] = [];
    let x = 0;
    while (x < canvasWidthRef.current * 2) {
      const height = 80 + Math.random() * 200;
      const width = 60 + Math.random() * 80;
      const windows: { x: number; y: number; lit: boolean }[] = [];
      
      for (let wy = 0; wy < height - 20; wy += 25) {
        for (let wx = 5; wx < width - 10; wx += 20) {
          windows.push({
            x: wx,
            y: wy,
            lit: Math.random() > 0.3,
          });
        }
      }

      buildings.push({
        x,
        y: canvasHeightRef.current - 60 - height,
        width,
        height,
        windows,
      });
      x += width + Math.random() * 20;
    }
    buildingsRef.current = buildings;
  }, []);

  const drawBuildings = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const groundY = canvasHeightRef.current - 60;
      const offset = distanceRef.current * 0.3 % canvasWidthRef.current;

      buildingsRef.current.forEach((building) => {
        const screenX = building.x - offset;
        if (screenX + building.width < -100 || screenX > canvasWidthRef.current + 100) return;

        ctx.fillStyle = '#CBD5E0';
        ctx.fillRect(screenX, building.y, building.width, building.height);

        ctx.fillStyle = '#E2E8F0';
        ctx.fillRect(screenX + 2, building.y + 2, building.width - 4, building.height - 4);

        building.windows.forEach((window) => {
          ctx.fillStyle = window.lit ? '#FFF3B0' : '#E2E8F0';
          ctx.fillRect(screenX + window.x, building.y + window.y, 12, 15);
          if (window.lit) {
            ctx.fillStyle = '#FFE082';
            ctx.fillRect(screenX + window.x + 2, building.y + window.y + 2, 8, 11);
          }
        });

        ctx.fillStyle = '#A0AEC0';
        ctx.fillRect(screenX + building.width / 2 - 5, building.y - 10, 10, 15);
      });
    },
    [],
  );

  const drawBird = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const bird = birdRef.current;
      const cx = bird.x + bird.width / 2;
      const cy = bird.y + bird.height / 2;
      const size = bird.width / 1.5;
      const twinkle = Math.sin(frameCountRef.current * 0.15) * 0.15 + 0.9;
      const glowIntensity = Math.sin(frameCountRef.current * 0.1) * 5 + 15;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(twinkle, twinkle);

      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = glowIntensity;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.fillStyle = '#ADD8E6';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const x = Math.cos(angle) * size;
        const y = Math.sin(angle) * size;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        const innerAngle = angle + Math.PI / 5;
        const innerX = Math.cos(innerAngle) * size * 0.4;
        const innerY = Math.sin(innerAngle) * size * 0.4;
        ctx.lineTo(innerX, innerY);
      }
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#E0F4FF';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const x = Math.cos(angle) * size * 0.5;
        const y = Math.sin(angle) * size * 0.5;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        const innerAngle = angle + Math.PI / 5;
        const innerX = Math.cos(innerAngle) * size * 0.2;
        const innerY = Math.sin(innerAngle) * size * 0.2;
        ctx.lineTo(innerX, innerY);
      }
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    },
    [],
  );

  const drawAnimatedFire = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
      const flames = 5;
      const baseHeight = height;

      for (let i = 0; i < flames; i++) {
        const flameX = x + (i * width) / flames;
        const flameWidth = width / flames + 5;
        const flicker = Math.sin(frameCountRef.current * 0.2 + i) * 10 + Math.sin(frameCountRef.current * 0.3 + i * 2) * 5;
        const currentHeight = baseHeight + flicker;

        const gradient = ctx.createLinearGradient(flameX + flameWidth / 2, y + currentHeight, flameX + flameWidth / 2, y);
        gradient.addColorStop(0, '#333');
        gradient.addColorStop(0.2, '#FF4500');
        gradient.addColorStop(0.5, '#FFA500');
        gradient.addColorStop(0.8, '#FFFF00');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(flameX, y + currentHeight);
        ctx.lineTo(flameX + flameWidth / 2, y);
        ctx.lineTo(flameX + flameWidth, y + currentHeight);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(x + width / 2, y + height / 2, width, 0, Math.PI * 2);
      ctx.fill();
    },
    [],
  );

  const drawObstacle = useCallback(
    (ctx: CanvasRenderingContext2D, obstacle: Obstacle) => {
      if (obstacle.type === 'rock') {
        const colors = ['#555', '#666', '#777', '#888'];
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.beginPath();
        ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
        ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y);
        ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.moveTo(obstacle.x + 5, obstacle.y + obstacle.height);
        ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y + 5);
        ctx.lineTo(obstacle.x + obstacle.width - 5, obstacle.y + obstacle.height);
        ctx.closePath();
        ctx.fill();
      } else if (obstacle.type === 'fire') {
        drawAnimatedFire(ctx, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      } else if (obstacle.type === 'water') {
        const gradient = ctx.createLinearGradient(obstacle.x, obstacle.y, obstacle.x, obstacle.y + obstacle.height);
        gradient.addColorStop(0, '#00CED1');
        gradient.addColorStop(0.5, '#1E90FF');
        gradient.addColorStop(1, '#006994');
        ctx.fillStyle = gradient;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        const waveOffset = frameCountRef.current * 0.5;
        for (let i = 0; i < obstacle.width; i += 10) {
          const waveY = obstacle.y + Math.sin((i + waveOffset) * 0.3) * 3;
          ctx.fillStyle = '#87CEEB';
          ctx.fillRect(obstacle.x + i, waveY, 8, 3);
        }
      } else if (obstacle.type === 'wind') {
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 4;
        for (let i = 0; i < 4; i++) {
          const xOffset = Math.sin(frameCountRef.current * 0.1 + i) * 5;
          ctx.beginPath();
          ctx.moveTo(obstacle.x + i * 20 + xOffset, obstacle.y);
          ctx.lineTo(obstacle.x + i * 20 + 20 + xOffset, obstacle.y + obstacle.height / 2);
          ctx.lineTo(obstacle.x + i * 20 + xOffset, obstacle.y + obstacle.height);
          ctx.stroke();
        }

        for (let i = 0; i < 8; i++) {
          const debrisX = obstacle.x + Math.sin(frameCountRef.current * 0.05 + i * 0.5) * 30;
          const debrisY = obstacle.y + obstacle.height / 2 + Math.cos(frameCountRef.current * 0.08 + i) * 20;
          ctx.fillStyle = '#999';
          ctx.fillRect(debrisX, debrisY, 3, 8);
        }
      } else if (obstacle.type === 'building') {
        ctx.fillStyle = '#4A5568';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        ctx.fillStyle = '#2D3748';
        ctx.fillRect(obstacle.x + 5, obstacle.y + 5, obstacle.width - 10, obstacle.height - 10);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(obstacle.x + obstacle.width / 2 - 3, obstacle.y + 10, 6, 8);
      }
    },
    [drawAnimatedFire],
  );

  const drawFallingRock = useCallback(
    (ctx: CanvasRenderingContext2D, rock: FallingRock) => {
      ctx.save();
      ctx.translate(rock.x + rock.width / 2, rock.y + rock.height / 2);
      ctx.rotate(rock.rotation);

      const colors = ['#555', '#666', '#777', '#8B4513'];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.beginPath();
      ctx.moveTo(-rock.width / 2, rock.height / 2);
      ctx.lineTo(0, -rock.height / 2);
      ctx.lineTo(rock.width / 2, rock.height / 2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.moveTo(-rock.width / 2 + 3, rock.height / 2);
      ctx.lineTo(0, -rock.height / 2 + 3);
      ctx.lineTo(rock.width / 2 - 3, rock.height / 2);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    },
    [],
  );

  const drawChasingWave = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!chasingWaveRef.current) return;
      const wave = chasingWaveRef.current;

      if (gameConfig.hazardType === 'water') {
        for (let waveIdx = 0; waveIdx < 5; waveIdx++) {
          const offsetX = wave.x + waveIdx * 200;
          const gradient = ctx.createLinearGradient(offsetX, 0, offsetX + 100, 0);
          gradient.addColorStop(0, 'rgba(30, 144, 255, 0)');
          gradient.addColorStop(0.5, 'rgba(30, 144, 255, 0.5)');
          gradient.addColorStop(1, 'rgba(0, 206, 209, 0.8)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(offsetX, canvasHeightRef.current);
          for (let y = canvasHeightRef.current; y > canvasHeightRef.current - wave.height; y -= 10) {
            const waveX = offsetX + Math.sin((y + wave.phase + waveIdx * 2) * 0.05) * wave.amplitude;
            ctx.lineTo(waveX, y);
          }
          ctx.lineTo(offsetX + wave.amplitude + 50, canvasHeightRef.current);
          ctx.closePath();
          ctx.fill();
        }

        for (let i = 0; i < 15; i++) {
          const bubbleX = wave.x + Math.random() * 800;
          const bubbleY = canvasHeightRef.current - 20 - Math.random() * (wave.height - 40);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.beginPath();
          ctx.arc(bubbleX, bubbleY, 2 + Math.random() * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (gameConfig.hazardType === 'wind') {
        for (let waveIdx = 0; waveIdx < 3; waveIdx++) {
          const offsetX = wave.x + waveIdx * 250;
          const gradient = ctx.createLinearGradient(offsetX, 0, offsetX + 150, 0);
          gradient.addColorStop(0, 'rgba(100, 100, 150, 0)');
          gradient.addColorStop(0.5, 'rgba(100, 100, 150, 0.3)');
          gradient.addColorStop(1, 'rgba(147, 112, 219, 0.6)');

          ctx.fillStyle = gradient;
          ctx.fillRect(offsetX, 0, 150, canvasHeightRef.current);
        }

        for (let i = 0; i < 20; i++) {
          const debrisX = wave.x + Math.random() * 600;
          const debrisY = Math.random() * canvasHeightRef.current;
          const debrisSize = 2 + Math.random() * 6;
          
          ctx.fillStyle = Math.random() > 0.5 ? '#999' : '#777';
          ctx.fillRect(debrisX, debrisY, debrisSize, debrisSize);
        }
      } else if (gameConfig.hazardType === 'mud') {
        for (let waveIdx = 0; waveIdx < 4; waveIdx++) {
          const offsetX = wave.x + waveIdx * 180;
          const gradient = ctx.createLinearGradient(offsetX, 0, offsetX + 120, 0);
          gradient.addColorStop(0, 'rgba(139, 69, 19, 0)');
          gradient.addColorStop(0.5, 'rgba(139, 69, 19, 0.5)');
          gradient.addColorStop(1, 'rgba(205, 133, 63, 0.7)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(offsetX, canvasHeightRef.current);
          for (let y = canvasHeightRef.current; y > canvasHeightRef.current - wave.height; y -= 15) {
            const waveX = offsetX + Math.sin((y + wave.phase + waveIdx * 3) * 0.03) * wave.amplitude;
            ctx.lineTo(waveX, y);
          }
          ctx.lineTo(offsetX + wave.amplitude + 80, canvasHeightRef.current);
          ctx.closePath();
          ctx.fill();
        }
      } else if (gameConfig.hazardType === 'fire') {
        for (let waveIdx = 0; waveIdx < 3; waveIdx++) {
          const offsetX = wave.x + waveIdx * 220;
          const gradient = ctx.createLinearGradient(offsetX, 0, offsetX + 100, 0);
          gradient.addColorStop(0, 'rgba(255, 100, 0, 0)');
          gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.3)');
          gradient.addColorStop(1, 'rgba(255, 69, 0, 0.5)');

          ctx.fillStyle = gradient;
          ctx.fillRect(offsetX, 0, 100, canvasHeightRef.current);
        }

        for (let i = 0; i < 12; i++) {
          const emberX = wave.x + Math.random() * 500;
          const emberY = Math.random() * canvasHeightRef.current;
          const emberSize = 2 + Math.random() * 4;
          
          ctx.fillStyle = '#FFA500';
          ctx.beginPath();
          ctx.arc(emberX, emberY, emberSize, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FF4500';
          ctx.beginPath();
          ctx.arc(emberX, emberY, emberSize / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    [gameConfig.hazardType],
  );

  const drawPlatform = useCallback(
    (ctx: CanvasRenderingContext2D, platform: Platform) => {
      ctx.fillStyle = '#228B22';
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      ctx.fillStyle = '#32CD32';
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height / 3);

      ctx.fillStyle = '#006400';
      ctx.fillRect(platform.x + 5, platform.y + platform.height - 3, platform.width - 10, 3);

      ctx.fillStyle = '#90EE90';
      for (let i = 0; i < platform.width; i += 15) {
        ctx.beginPath();
        ctx.moveTo(platform.x + i + 5, platform.y + platform.height);
        ctx.lineTo(platform.x + i + 8, platform.y + platform.height + 8);
        ctx.lineTo(platform.x + i + 12, platform.y + platform.height);
        ctx.closePath();
        ctx.fill();
      }
    },
    [],
  );

  const drawRain = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.strokeStyle = 'rgba(174, 194, 224, 0.6)';
      ctx.lineWidth = 2;

      raindropsRef.current.forEach((raindrop) => {
        ctx.beginPath();
        ctx.moveTo(raindrop.x, raindrop.y);
        ctx.lineTo(raindrop.x + 2, raindrop.y + raindrop.length);
        ctx.stroke();
      });
    },
    [],
  );

  const drawGround = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const groundY = canvasHeightRef.current - 60;

      ctx.fillStyle = gameConfig.groundColor;
      ctx.fillRect(0, groundY, canvasWidthRef.current, 60);

      ctx.fillStyle = '#333';
      ctx.fillRect(0, groundY, canvasWidthRef.current, 5);

      for (let i = 0; i < 30; i++) {
        const x = (i * 50 - distanceRef.current * 0.8) % canvasWidthRef.current;
        ctx.fillStyle = '#444';
        ctx.fillRect(x, groundY + 10, 30, 3);
      }

      for (let i = 0; i < 15; i++) {
        const x = (i * 80 - distanceRef.current * 0.6) % canvasWidthRef.current;
        ctx.fillStyle = '#90EE90';
        ctx.beginPath();
        ctx.moveTo(x + 15, groundY + 5);
        ctx.lineTo(x + 20, groundY + 5 - 20 - Math.sin(frameCountRef.current * 0.1 + i) * 3);
        ctx.lineTo(x + 25, groundY + 5);
        ctx.closePath();
        ctx.fill();
      }
    },
    [gameConfig.groundColor],
  );

  const spawnObstacle = useCallback(() => {
    const groundY = canvasHeightRef.current - 60;
    const types: Obstacle['type'][] = ['rock', 'fire', 'water', 'wind'];
    const type = types[Math.floor(Math.random() * types.length)];

    const obstacle: Obstacle = {
      x: canvasWidthRef.current + 100,
      y: type === 'water' ? groundY - 25 : groundY - 50,
      width: type === 'water' ? 80 : 35 + Math.random() * 20,
      height: type === 'water' ? 25 : 40 + Math.random() * 20,
      type,
      passed: false,
    };

    obstaclesRef.current.push(obstacle);
  }, []);

  const spawnFallingRock = useCallback(() => {
    const rock: FallingRock = {
      x: canvasWidthRef.current + 50 + Math.random() * 200,
      y: -30,
      width: 20 + Math.random() * 25,
      height: 20 + Math.random() * 25,
      speedY: 3 + Math.random() * 3,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
    };
    fallingRocksRef.current.push(rock);
  }, []);

  const spawnPlatform = useCallback(() => {
    const groundY = canvasHeightRef.current - 60;

    const platform: Platform = {
      x: canvasWidthRef.current + 50,
      y: groundY - 120 - Math.random() * 100,
      width: 100 + Math.random() * 80,
      height: 15,
    };

    platformsRef.current.push(platform);
  }, []);

  const checkCollision = useCallback(
    (rect1: { x: number; y: number; width: number; height: number }, rect2: { x: number; y: number; width: number; height: number }) => {
      return (
        rect1.x + 5 < rect2.x + rect2.width &&
        rect1.x + rect1.width - 5 > rect2.x &&
        rect1.y + 5 < rect2.y + rect2.height &&
        rect1.y + rect1.height - 5 > rect2.y
      );
    },
    [],
  );

  const gameLoop = useCallback(() => {
    if (gameOverRef.current) return;

    frameCountRef.current++;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasWidthRef.current, canvasHeightRef.current);

    const bird = birdRef.current;
    const groundY = canvasHeightRef.current - 60;

    if (keysRef.current.has(' ') || keysRef.current.has('ArrowUp') || keysRef.current.has('KeyW')) {
      if (bird.jumpCount < 2) {
        bird.velocityY = gameConfig.jumpForce;
        bird.isJumping = true;
        bird.jumpCount++;
      }
    }

    const skill = skillRef.current;
    const now = Date.now();
    
    if (keysRef.current.has('Enter') && skill.isReady && !bird.isDashing) {
      bird.isDashing = true;
      bird.isInvincible = true;
      skill.dashDistance = 0;
      skill.maxDashDistance = canvasWidthRef.current * 2;
      skill.lastUseTime = now;
      skill.isReady = false;
    }

    if (bird.isDashing) {
      const dashSpeed = 30;
      bird.x += dashSpeed;
      skill.dashDistance += dashSpeed;
      
      if (skill.dashDistance >= skill.maxDashDistance) {
        bird.isDashing = false;
        bird.isInvincible = false;
      }
    }

    if (!skill.isReady && now - skill.lastUseTime >= skill.cooldown) {
      skill.isReady = true;
      setSkillReady(true);
      setSkillCooldown(0);
    } else if (!skill.isReady) {
      const remaining = Math.ceil((skill.cooldown - (now - skill.lastUseTime)) / 1000);
      setSkillCooldown(remaining);
    }

    bird.velocityY += gameConfig.gravity;
    bird.y += bird.velocityY;

    if (bird.y + bird.height >= groundY) {
      bird.y = groundY - bird.height;
      bird.velocityY = 0;
      bird.isJumping = false;
      bird.jumpCount = 0;
    }

    platformsRef.current.forEach((platform) => {
      platform.x -= gameConfig.speed;
      if (
        bird.velocityY >= 0 &&
        bird.y + bird.height <= platform.y + 15 &&
        bird.y + bird.height >= platform.y - bird.velocityY &&
        bird.x + bird.width > platform.x &&
        bird.x < platform.x + platform.width
      ) {
        bird.y = platform.y - bird.height;
        bird.velocityY = 0;
        bird.isJumping = false;
        bird.jumpCount = 0;
      }
    });

    platformsRef.current = platformsRef.current.filter((p) => p.x + p.width > -50);

    if (gameConfig.hazardType === 'water') {
      for (let i = 0; i < 5; i++) {
        raindropsRef.current.push({
          x: Math.random() * canvasWidthRef.current,
          y: -20,
          length: 15 + Math.random() * 20,
          speed: 8 + Math.random() * 6,
        });
      }
    }

    raindropsRef.current.forEach((raindrop) => {
      raindrop.y += raindrop.speed;
      raindrop.x += 1;
    });

    raindropsRef.current = raindropsRef.current.filter((r) => r.y < canvasHeightRef.current);

    const obstacleNow = Date.now();
    if (obstacleNow - lastObstacleTimeRef.current > 2000 + Math.random() * 1500) {
      spawnObstacle();
      lastObstacleTimeRef.current = obstacleNow;
    }

    if (gameConfig.hazardType === 'mud') {
      const rockNow = Date.now();
      if (rockNow - lastRockTimeRef.current > 800 + Math.random() * 1000) {
        spawnFallingRock();
        lastRockTimeRef.current = rockNow;
      }
    }

    if (Math.random() < 0.01) {
      spawnPlatform();
    }

    obstaclesRef.current.forEach((obstacle) => {
      obstacle.x -= gameConfig.speed;
      if (!bird.isInvincible && checkCollision(bird, obstacle)) {
        gameOverRef.current = true;
        setGameState('lost');
        return;
      }
      if (obstacle.x + obstacle.width < bird.x && !obstacle.passed) {
        obstacle.passed = true;
        scoreRef.current += 10;
        setScore(scoreRef.current);
      }
    });

    obstaclesRef.current = obstaclesRef.current.filter((o) => o.x + o.width > -100);

    fallingRocksRef.current.forEach((rock) => {
      rock.y += rock.speedY;
      rock.speedY += 0.2;
      rock.rotation += rock.rotationSpeed;

      const rockRect = {
        x: rock.x,
        y: rock.y,
        width: rock.width,
        height: rock.height,
      };

      if (!bird.isInvincible && checkCollision(bird, rockRect)) {
        gameOverRef.current = true;
        setGameState('lost');
        return;
      }
    });

    fallingRocksRef.current = fallingRocksRef.current.filter((r) => r.y < canvasHeightRef.current + 50);

    if (chasingWaveRef.current) {
      const wave = chasingWaveRef.current;
      wave.x += gameConfig.chaseSpeed;
      wave.phase += 0.1;
      
      if (wave.x > canvasWidthRef.current + 200) {
        wave.x = -1000;
      }
    }

    distanceRef.current += gameConfig.speed;
    setDistance(Math.floor(distanceRef.current / 10));

    drawBuildings(ctx);
    drawGround(ctx);
    platformsRef.current.forEach((platform) => drawPlatform(ctx, platform));
    drawChasingWave(ctx);
    obstaclesRef.current.forEach((obstacle) => drawObstacle(ctx, obstacle));
    fallingRocksRef.current.forEach((rock) => drawFallingRock(ctx, rock));
    drawBird(ctx);
    drawRain(ctx);

    if (distanceRef.current >= 8000) {
      gameOverRef.current = true;
      setGameState('won');
      return;
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameConfig.gravity, gameConfig.jumpForce, gameConfig.speed, gameConfig.chaseSpeed, checkCollision, drawBird, drawBuildings, drawChasingWave, drawFallingRock, drawGround, drawObstacle, drawPlatform, spawnFallingRock, spawnObstacle, spawnPlatform]);

  const startGame = useCallback(() => {
    gameOverRef.current = false;
    frameCountRef.current = 0;
    birdRef.current = {
      x: 80,
      y: canvasHeightRef.current - 150,
      width: 35,
      height: 35,
      velocityY: 0,
      isJumping: false,
      jumpCount: 0,
      isDashing: false,
      isInvincible: false,
    };
    obstaclesRef.current = [];
    fallingRocksRef.current = [];
    platformsRef.current = [];
    raindropsRef.current = [];
    distanceRef.current = 0;
    scoreRef.current = 0;
    lastObstacleTimeRef.current = 0;
    lastRockTimeRef.current = 0;
    
    skillRef.current = {
      dashDistance: 0,
      maxDashDistance: 0,
      lastUseTime: -20000,
      cooldown: 20000,
      isReady: true,
    };
    setSkillReady(true);
    setSkillCooldown(0);

    chasingWaveRef.current = {
      x: -200,
      height: 100 + Math.random() * 50,
      amplitude: 30,
      phase: 0,
      isDashing: false,
      dashTimer: 0,
    };

    generateBuildings();

    setDistance(0);
    setScore(0);
    setGameState('playing');
  }, [generateBuildings]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const maxWidth = window.innerWidth;
      const maxHeight = window.innerHeight - 120;
      
      canvasWidthRef.current = Math.min(1400, maxWidth);
      canvasHeightRef.current = Math.min(700, maxHeight);
      
      canvas.width = canvasWidthRef.current;
      canvas.height = canvasHeightRef.current;

      if (gameState !== 'playing') {
        generateBuildings();
      }
    };

    resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [gameState, generateBuildings]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code);
      if (e.code === ' ') {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleJump = useCallback(() => {
    if (gameState === 'playing') {
      const bird = birdRef.current;
      if (bird.jumpCount < 2) {
        bird.velocityY = gameConfig.jumpForce;
        bird.isJumping = true;
        bird.jumpCount++;
      }
    }
  }, [gameState, gameConfig.jumpForce]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.button === 2) {
      e.preventDefault();
      const skill = skillRef.current;
      const bird = birdRef.current;
      if (skill.isReady && !bird.isDashing && gameState === 'playing') {
        bird.isDashing = true;
        bird.isInvincible = true;
        skill.dashDistance = 0;
        skill.maxDashDistance = canvasWidthRef.current * 2;
        skill.lastUseTime = Date.now();
        skill.isReady = false;
      }
    } else {
      handleJump();
    }
  }, [handleJump, gameState]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-2">
      <div className="flex items-center justify-between mb-2">
        <Link
          to="/games/escape"
          className="flex items-center gap-2 text-dark-text/60 hover:text-dark-text transition-colors"
        >
          <ArrowLeft size={20} />
          <span>返回游戏选择</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-dark-text/60">得分:</span>
            <span className="font-bold text-brand-orange">{score}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-dark-text/60">距离:</span>
            <span className="font-bold text-dark-text">{distance}m</span>
          </div>
          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${skillReady ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            <span className="text-sm font-medium">{skillReady ? '冲刺就绪' : `${skillCooldown}s`}</span>
          </div>
        </div>
      </div>

      <div className="text-center mb-2">
        <h1 className="font-title text-xl text-dark-text">{gameConfig.title}</h1>
        <p className="text-sm text-dark-text/50">点击屏幕或按空格键跳跃，躲避障碍物！</p>
      </div>

      <div className={`w-full max-w-none rounded-xl overflow-hidden shadow-xl border-2 border-gray-200 ${gameState === 'playing' ? 'cursor-pointer' : ''} relative flex-1`}
        onClick={handleCanvasClick}
        onTouchStart={(e) => {
          e.preventDefault();
          handleJump();
        }}
      >
        <canvas
          ref={canvasRef}
          className={`w-full h-full bg-gradient-to-b ${gameConfig.bgGradient}`}
        />

        <AnimatePresence>
          {gameState === 'start' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <ElephantMascot mood="excited" size="lg" message="准备好开始逃生了吗？" />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    startGame();
                  }}
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-orange to-orange-500 text-white font-bold rounded-xl text-lg mt-4"
                >
                  <Play size={24} />
                  开始游戏
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {gameState === 'won' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Trophy size={48} className="text-white" />
                </motion.div>
                <h2 className="font-title text-3xl text-white mb-2">恭喜你赢了！</h2>
                <p className="text-white/80 mb-4">你成功逃离了{gameConfig.title}！</p>
                <div className="flex justify-center gap-8 mb-6">
                  <div>
                    <p className="text-3xl font-bold text-brand-orange">{score}</p>
                    <p className="text-sm text-white/60">得分</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{distance}m</p>
                    <p className="text-sm text-white/60">距离</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      startGame();
                    }}
                    className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-brand-orange to-orange-500 text-white font-bold rounded-xl"
                  >
                    <RotateCcw size={20} />
                    再玩一次
                  </motion.button>
                  <Link
                    to="/games/escape"
                    className="flex items-center justify-center gap-2 px-8 py-3 bg-white/20 text-white font-medium rounded-xl hover:bg-white/30 transition-colors"
                  >
                    <Home size={20} />
                    选择其他灾害
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}

          {gameState === 'lost' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <ElephantMascot mood="sad" size="lg" message="哎呀，撞到障碍物了！" />
                <h2 className="font-title text-3xl text-white mb-2">游戏结束</h2>
                <p className="text-white/80 mb-4">别灰心，再来一次！</p>
                <div className="flex justify-center gap-8 mb-6">
                  <div>
                    <p className="text-3xl font-bold text-brand-orange">{score}</p>
                    <p className="text-sm text-white/60">得分</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{distance}m</p>
                    <p className="text-sm text-white/60">距离</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      startGame();
                    }}
                    className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-brand-orange to-orange-500 text-white font-bold rounded-xl"
                  >
                    <RotateCcw size={20} />
                    重试
                  </motion.button>
                  <Link
                    to="/games/escape"
                    className="flex items-center justify-center gap-2 px-8 py-3 bg-white/20 text-white font-medium rounded-xl hover:bg-white/30 transition-colors"
                  >
                    <Home size={20} />
                    返回选择
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-2 text-center">
        <p className="text-sm text-dark-text/50">
          <strong>操作方式：</strong>点击屏幕或按空格键/↑键/W键跳跃
        </p>
      </div>
    </div>
  );
}
