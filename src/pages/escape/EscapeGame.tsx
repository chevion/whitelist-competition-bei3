import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/stores/gameStore';
import type { MapCell, MapTemplate, MapObstacle, MapItem } from '@/types';

const CELL = 40;
const PLAYER_SIZE = 28;
const TICK_MS = 1000;
const FIRE_SPREAD_INTERVAL = 8000;

type CellType = 'empty' | 'wall' | 'fire' | 'debris' | 'locked-door' | 'flood';

interface FallingObject {
  x: number;
  y: number;
  targetY: number;
  speed: number;
  active: boolean;
}

interface FireParticle {
  x: number;
  y: number;
  size: number;
  life: number;
  maxLife: number;
  vx: number;
  vy: number;
}

export default function EscapeGame() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);
  const lastFireSpreadRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());

  const {
    currentMap,
    playerPosition,
    playerDirection,
    health,
    timeRemaining,
    collectedItems,
    errors,
    setPlayerPosition,
    setPlayerDirection,
    setHealth,
    setTimeRemaining,
    collectItem,
    addError,
    completeGame,
  } = useGameStore();

  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [fallingObjects, setFallingObjects] = useState<FallingObject[]>([]);
  const [fireParticles, setFireParticles] = useState<FireParticle[]>([]);
  const [grid, setGrid] = useState<CellType[][]>([]);
  const [itemMap, setItemMap] = useState<Map<string, MapItem>>(new Map());
  const [collectedSet, setCollectedSet] = useState<Set<string>>(new Set());
  const [showMobileControls, setShowMobileControls] = useState(false);

  const startTimeRef = useRef<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    setShowMobileControls('ontouchstart' in window);
  }, []);

  const initGame = useCallback(() => {
    if (!currentMap) return;

    const g: CellType[][] = [];
    for (let r = 0; r < currentMap.gridSize.rows; r++) {
      const row: CellType[] = [];
      for (let c = 0; c < currentMap.gridSize.cols; c++) {
        row.push('empty');
      }
      g.push(row);
    }

    for (const obs of currentMap.obstacles) {
      const { x, y } = obs.position;
      if (y >= 0 && y < currentMap.gridSize.rows && x >= 0 && x < currentMap.gridSize.cols) {
        g[y][x] = obs.type as CellType;
      }
    }

    setGrid(g);

    const im = new Map<string, MapItem>();
    for (const item of currentMap.items) {
      im.set(`${item.position.x},${item.position.y}`, item);
    }
    setItemMap(im);
    setCollectedSet(new Set());

    setPlayerPosition(currentMap.startPoint);
    setPlayerDirection('up');
    setHealth(100);
    setTimeRemaining(120);
    setGameOver(false);
    setGameWon(false);
    setFallingObjects([]);
    setFireParticles([]);
    startTimeRef.current = Date.now();
    setElapsedTime(0);
  }, [currentMap, setPlayerPosition, setPlayerDirection, setHealth, setTimeRemaining]);

  useEffect(() => {
    if (!currentMap) {
      navigate('/escape');
      return;
    }
    initGame();
  }, [currentMap, navigate, initGame]);

  const tryMove = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver || gameWon) return;

    const delta = { up: { dx: 0, dy: -1 }, down: { dx: 0, dy: 1 }, left: { dx: -1, dy: 0 }, right: { dx: 1, dy: 0 } };
    const d = delta[dir];
    if (!d) return;

    setPlayerDirection(dir);

    const newPos: MapCell = { x: playerPosition.x + d.dx, y: playerPosition.y + d.dy };

    if (!currentMap) return;
    if (newPos.x < 0 || newPos.y < 0 || newPos.x >= currentMap.gridSize.cols || newPos.y >= currentMap.gridSize.rows) return;

    const cellType = grid[newPos.y]?.[newPos.x];
    if (cellType === 'wall') return;

    if (cellType === 'fire') {
      addError('走进了火焰区域！');
      setHealth(Math.max(0, health - 15));
      return;
    }

    if (cellType === 'locked-door') {
      const hasKey = collectedItems.includes('教室钥匙') || collectedItems.includes('药房钥匙') || collectedItems.includes('侧门钥匙');
      if (!hasKey) {
        addError('门被锁住了，需要找到钥匙！');
        return;
      }
    }

    if (cellType === 'debris') {
      addError('碰到了障碍物：' + (currentMap.obstacles.find(o => o.position.x === newPos.x && o.position.y === newPos.y)?.name || '碎片'));
      setHealth(Math.max(0, health - 5));
    }

    setPlayerPosition(newPos);

    const itemKey = `${newPos.x},${newPos.y}`;
    const item = itemMap.get(itemKey);
    if (item && !collectedSet.has(itemKey)) {
      collectItem(item.name);
      setCollectedSet(prev => new Set(prev).add(itemKey));
    }

    if (newPos.x === currentMap.endPoint.x && newPos.y === currentMap.endPoint.y) {
      setGameWon(true);
      completeGame();
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }
  }, [gameOver, gameWon, playerPosition, currentMap, grid, itemMap, collectedSet, collectedItems, health, setPlayerDirection, setPlayerPosition, addError, setHealth, collectItem, completeGame]);

  useEffect(() => {
    if (gameOver || gameWon) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap: Record<string, 'up' | 'down' | 'left' | 'right'> = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', W: 'up', s: 'down', S: 'down', a: 'left', A: 'left', d: 'right', D: 'right',
      };
      const dir = keyMap[e.key];
      if (dir) {
        e.preventDefault();
        keysRef.current.add(e.key);
        tryMove(dir);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [tryMove, gameOver, gameWon]);

  useEffect(() => {
    if (gameOver || gameWon || !currentMap) return;

    const interval = setInterval(() => {
      const newTime = timeRemaining - 1;
      setTimeRemaining(newTime);
      if (newTime <= 0) {
        setGameOver(true);
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [timeRemaining, gameOver, gameWon, currentMap, setTimeRemaining]);

  useEffect(() => {
    if (health <= 0 && !gameOver && !gameWon) {
      setGameOver(true);
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }
  }, [health, gameOver, gameWon]);

  useEffect(() => {
    if (gameOver || gameWon || !currentMap) return;
    if (currentMap.disasterType !== '地震') return;

    const interval = setInterval(() => {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);

      const cols = currentMap.gridSize.cols;
      const rows = currentMap.gridSize.rows;
      const fx = Math.floor(Math.random() * cols);
      const fy = Math.floor(Math.random() * rows);

      if (fx === playerPosition.x && fy === playerPosition.y) {
        addError('被坠落物砸中！');
        setHealth(Math.max(0, health - 10));
      }

      setFallingObjects(prev => [
        ...prev,
        { x: fx * CELL + CELL / 2, y: 0, targetY: fy * CELL + CELL / 2, speed: 200 + Math.random() * 100, active: true },
      ]);
    }, 4000 + Math.random() * 3000);

    return () => clearInterval(interval);
  }, [currentMap, gameOver, gameWon, playerPosition, health, addError, setHealth]);

  useEffect(() => {
    if (gameOver || gameWon || !currentMap) return;
    if (currentMap.disasterType !== '火灾') return;

    const interval = setInterval(() => {
      setGrid(prevGrid => {
        const newGrid = prevGrid.map(row => [...row]);
        const fireCells: MapCell[] = [];

        for (let r = 0; r < newGrid.length; r++) {
          for (let c = 0; c < newGrid[r].length; c++) {
            if (newGrid[r][c] === 'fire') {
              fireCells.push({ x: c, y: r });
            }
          }
        }

        const dirs = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];
        for (const fc of fireCells) {
          if (Math.random() > 0.35) continue;
          const d = dirs[Math.floor(Math.random() * dirs.length)];
          const nx = fc.x + d.dx;
          const ny = fc.y + d.dy;
          if (ny >= 0 && ny < newGrid.length && nx >= 0 && nx < newGrid[0].length) {
            if (newGrid[ny][nx] === 'empty') {
              newGrid[ny][nx] = 'fire';
            }
          }
        }

        if (newGrid[playerPosition.y]?.[playerPosition.x] === 'fire') {
          addError('被蔓延的火焰包围！');
          setHealth(Math.max(0, health - 10));
        }

        return newGrid;
      });
    }, FIRE_SPREAD_INTERVAL);

    return () => clearInterval(interval);
  }, [currentMap, gameOver, gameWon, playerPosition, health, addError, setHealth]);

  useEffect(() => {
    if (gameOver || gameWon) return;

    const canvas = canvasRef.current;
    if (!canvas || !currentMap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cols = currentMap.gridSize.cols;
    const rows = currentMap.gridSize.rows;
    const canvasW = cols * CELL;
    const canvasH = rows * CELL;

    const render = () => {
      ctx.clearRect(0, 0, canvasW, canvasH);

      ctx.fillStyle = '#F9FAFB';
      ctx.fillRect(0, 0, canvasW, canvasH);

      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= canvasW; x += CELL) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasH);
        ctx.stroke();
      }
      for (let y = 0; y <= canvasH; y += CELL) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasW, y);
        ctx.stroke();
      }

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cellType = grid[r]?.[c];
          const cx = c * CELL;
          const cy = r * CELL;

          if (cellType === 'wall') {
            ctx.fillStyle = '#374151';
            ctx.fillRect(cx + 1, cy + 1, CELL - 2, CELL - 2);
          } else if (cellType === 'fire') {
            ctx.fillStyle = '#FEE2E2';
            ctx.fillRect(cx, cy, CELL, CELL);
            const time = Date.now() / 200;
            for (let i = 0; i < 3; i++) {
              const fx = cx + 10 + Math.sin(time + i * 2) * 8;
              const fy = cy + 10 + Math.cos(time + i * 1.5) * 8;
              const fs = 6 + Math.sin(time + i) * 3;
              const gradient = ctx.createRadialGradient(fx, fy, 0, fx, fy, fs);
              gradient.addColorStop(0, '#FF4500');
              gradient.addColorStop(0.5, '#FF6B35');
              gradient.addColorStop(1, 'rgba(255,69,0,0)');
              ctx.fillStyle = gradient;
              ctx.beginPath();
              ctx.arc(fx, fy, fs, 0, Math.PI * 2);
              ctx.fill();
            }
          } else if (cellType === 'debris') {
            ctx.fillStyle = '#9CA3AF';
            ctx.fillRect(cx + 2, cy + 2, CELL - 4, CELL - 4);
            ctx.strokeStyle = '#6B7280';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx + 5, cy + 5);
            ctx.lineTo(cx + CELL - 5, cy + CELL - 5);
            ctx.moveTo(cx + CELL - 5, cy + 5);
            ctx.lineTo(cx + 5, cy + CELL - 5);
            ctx.stroke();
          } else if (cellType === 'locked-door') {
            ctx.fillStyle = '#92400E';
            ctx.fillRect(cx + 4, cy + 4, CELL - 8, CELL - 8);
            ctx.fillStyle = '#FCD34D';
            ctx.beginPath();
            ctx.arc(cx + CELL - 12, cy + CELL / 2, 3, 0, Math.PI * 2);
            ctx.fill();
          } else if (cellType === 'flood') {
            ctx.fillStyle = '#93C5FD';
            ctx.fillRect(cx, cy, CELL, CELL);
            const wave = Math.sin(Date.now() / 300 + c) * 3;
            ctx.strokeStyle = '#60A5FA';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx, cy + CELL / 2 + wave);
            ctx.quadraticCurveTo(cx + CELL / 2, cy + CELL / 2 + wave - 5, cx + CELL, cy + CELL / 2 + wave);
            ctx.stroke();
          }
        }
      }

      for (const item of currentMap.items) {
        const key = `${item.position.x},${item.position.y}`;
        if (collectedSet.has(key)) continue;

        const ix = item.position.x * CELL + CELL / 2;
        const iy = item.position.y * CELL + CELL / 2;
        const pulse = Math.sin(Date.now() / 300) * 2;

        ctx.fillStyle = '#FEF3C7';
        ctx.beginPath();
        ctx.arc(ix, iy, 12 + pulse, 0, Math.PI * 2);
        ctx.fill();

        const itemColors: Record<string, string> = {
          flashlight: '#F59E0B',
          mask: '#3B82F6',
          firstaid: '#EF4444',
          'exit-sign': '#22C55E',
          key: '#FCD34D',
          phone: '#8B5CF6',
        };
        ctx.fillStyle = itemColors[item.type] || '#6B7280';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const itemIcons: Record<string, string> = {
          flashlight: '🔦',
          mask: '😷',
          firstaid: '➕',
          'exit-sign': '🚪',
          key: '🔑',
          phone: '📞',
        };
        ctx.fillText(itemIcons[item.type] || '?', ix, iy);
      }

      const epx = currentMap.endPoint.x * CELL;
      const epy = currentMap.endPoint.y * CELL;
      const exitPulse = Math.sin(Date.now() / 400) * 3;
      ctx.fillStyle = '#D1FAE5';
      ctx.fillRect(epx + 2, epy + 2, CELL - 4, CELL - 4);
      ctx.strokeStyle = '#22C55E';
      ctx.lineWidth = 2;
      ctx.strokeRect(epx + 2 + exitPulse, epy + 2 + exitPulse, CELL - 4 - exitPulse * 2, CELL - 4 - exitPulse * 2);
      ctx.fillStyle = '#22C55E';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('出口', epx + CELL / 2, epy + CELL / 2);

      const px = playerPosition.x * CELL + CELL / 2;
      const py = playerPosition.y * CELL + CELL / 2;

      ctx.save();
      ctx.translate(px, py);

      const dirAngles: Record<string, number> = { up: 0, right: 90, down: 180, left: 270 };
      ctx.rotate((dirAngles[playerDirection] || 0) * Math.PI / 180);

      ctx.fillStyle = '#CFD8DC';
      ctx.beginPath();
      ctx.arc(0, 0, PLAYER_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#90A4AE';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#FF6B35';
      ctx.fillRect(-8, -PLAYER_SIZE / 2 - 4, 16, 6);
      ctx.fillRect(-10, -PLAYER_SIZE / 2 + 1, 20, 3);

      ctx.fillStyle = '#2C3E50';
      ctx.beginPath();
      ctx.arc(-4, -3, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(4, -3, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(-3.5, -3.5, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(4.5, -3.5, 1, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#90A4AE';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 4);
      ctx.quadraticCurveTo(5, 10, 3, 14);
      ctx.stroke();

      ctx.restore();

      for (const fo of fallingObjects) {
        if (!fo.active) continue;
        ctx.fillStyle = '#EF4444';
        ctx.globalAlpha = 0.8;
        ctx.fillRect(fo.x - 6, fo.y - 6, 12, 12);
        ctx.globalAlpha = 1;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [currentMap, grid, playerPosition, playerDirection, collectedSet, fallingObjects, gameOver, gameWon]);

  useEffect(() => {
    if (fallingObjects.length === 0) return;

    const interval = setInterval(() => {
      setFallingObjects(prev =>
        prev
          .map(fo => ({
            ...fo,
            y: fo.y + fo.speed * 0.05,
            active: fo.y < fo.targetY,
          }))
          .filter(fo => fo.active || fo.y < fo.targetY + 50)
      );
    }, 50);

    return () => clearInterval(interval);
  }, [fallingObjects.length]);

  useEffect(() => {
    if (gameOver || gameWon) {
      const timer = setTimeout(() => {
        useGameStore.setState({
          timeRemaining: elapsedTime || (120 - timeRemaining),
        });
        navigate('/escape/report');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameOver, gameWon, navigate, elapsedTime, timeRemaining]);

  if (!currentMap) return null;

  const canvasW = currentMap.gridSize.cols * CELL;
  const canvasH = currentMap.gridSize.rows * CELL;
  const healthPercent = health;
  const healthColor = health > 60 ? '#22C55E' : health > 30 ? '#F59E0B' : '#EF4444';

  return (
    <div className="pb-20 md:pb-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center">
            <span className="text-lg">🐘</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-dark-text/50">生命值</span>
              <div className="w-24 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${healthPercent}%`, backgroundColor: healthColor }}
                />
              </div>
              <span className="text-xs font-medium" style={{ color: healthColor }}>{health}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-dark-text/50">倒计时</span>
            <span className={`font-title text-lg ${timeRemaining <= 30 ? 'text-danger-red animate-pulse' : 'text-dark-text'}`}>
              {timeRemaining}s
            </span>
          </div>

          <div className="flex items-center gap-1">
            {collectedItems.map((item, i) => (
              <span key={i} className="w-6 h-6 rounded bg-amber-100 flex items-center justify-center text-xs" title={item}>
                {item.includes('手电') ? '🔦' : item.includes('口罩') || item.includes('面罩') ? '😷' : item.includes('急救') ? '➕' : item.includes('钥匙') ? '🔑' : item.includes('电话') ? '📞' : '🚪'}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={`relative ${shaking ? 'animate-shake' : ''}`}>
        {(gameOver || gameWon) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 rounded-xl">
            <div className="text-center">
              {gameWon ? (
                <>
                  <p className="text-4xl mb-2">🎉</p>
                  <p className="font-title text-2xl text-white">逃生成功！</p>
                </>
              ) : (
                <>
                  <p className="text-4xl mb-2">😢</p>
                  <p className="font-title text-2xl text-white">{health <= 0 ? '生命值耗尽' : '时间到'}</p>
                </>
              )}
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={canvasW}
          height={canvasH}
          className="w-full rounded-xl border border-gray-200 shadow-sm"
          style={{ maxHeight: '65vh', imageRendering: 'auto' }}
        />
      </div>

      {showMobileControls && !gameOver && !gameWon && (
        <div className="mt-4 flex justify-center">
          <div className="grid grid-cols-3 gap-1.5 w-40">
            <div />
            <button
              onTouchStart={() => tryMove('up')}
              className="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-200 flex items-center justify-center text-dark-text active:bg-brand-orange active:text-white transition-colors"
            >
              ▲
            </button>
            <div />
            <button
              onTouchStart={() => tryMove('left')}
              className="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-200 flex items-center justify-center text-dark-text active:bg-brand-orange active:text-white transition-colors"
            >
              ◀
            </button>
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
              <span className="text-lg">🐘</span>
            </div>
            <button
              onTouchStart={() => tryMove('right')}
              className="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-200 flex items-center justify-center text-dark-text active:bg-brand-orange active:text-white transition-colors"
            >
              ▶
            </button>
            <div />
            <button
              onTouchStart={() => tryMove('down')}
              className="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-200 flex items-center justify-center text-dark-text active:bg-brand-orange active:text-white transition-colors"
            >
              ▼
            </button>
            <div />
          </div>
        </div>
      )}

      <div className="mt-3 text-center">
        <p className="text-xs text-dark-text/40">
          {currentMap.disasterType === '地震' ? '地震模式：注意躲避坠落物！' : '火灾模式：火焰会蔓延，远离火区！'}
          {' · '}使用 WASD 或方向键移动
        </p>
      </div>
    </div>
  );
}
