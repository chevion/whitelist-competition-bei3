import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/stores/gameStore';
import type { MapCell, MapTemplate, MapItem } from '@/types';

const CELL = 40;
const PLAYER_SIZE = 28;
const TICK_MS = 1000;
const FIRE_SPREAD_INTERVAL = 5000;
const BURN_DAMAGE_PER_TICK = 3;
const FIRE_TOUCH_DAMAGE = 15;

type CellType = 'empty' | 'wall' | 'fire' | 'debris' | 'locked-door' | 'flood' | 'door';

export default function EscapeGame() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());
  const fireFrontierRef = useRef<MapCell[]>([]);
  const gridRef = useRef<CellType[][]>([]);
  const itemMapRef = useRef<Map<string, MapItem>>(new Map());
  const collectedSetRef = useRef<Set<string>>(new Set());
  const healthRef = useRef(100);
  const burningRef = useRef(false);
  const playerPosRef = useRef<MapCell>({ x: 0, y: 0 });
  const gameOverRef = useRef(false);
  const gameWonRef = useRef(false);

  const {
    currentMap,
    playerPosition,
    playerDirection,
    health,
    timeRemaining,
    collectedItems,
    burning,
    setPlayerPosition,
    setPlayerDirection,
    setHealth,
    setTimeRemaining,
    collectItem,
    addError,
    completeGame,
    setBurning,
  } = useGameStore();

  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [grid, setGrid] = useState<CellType[][]>([]);
  const [itemMap, setItemMap] = useState<Map<string, MapItem>>(new Map());
  const [collectedSet, setCollectedSet] = useState<Set<string>>(new Set());
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [fireOrigin, setFireOrigin] = useState<MapCell | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const startTimeRef = useRef<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    setShowMobileControls('ontouchstart' in window);
  }, []);

  useEffect(() => {
    healthRef.current = health;
  }, [health]);

  useEffect(() => {
    burningRef.current = burning;
  }, [burning]);

  useEffect(() => {
    playerPosRef.current = playerPosition;
  }, [playerPosition]);

  useEffect(() => {
    gameOverRef.current = gameOver;
    gameWonRef.current = gameWon;
  }, [gameOver, gameWon]);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  useEffect(() => {
    itemMapRef.current = itemMap;
  }, [itemMap]);

  useEffect(() => {
    collectedSetRef.current = collectedSet;
  }, [collectedSet]);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  }, []);

  const parseLayout = useCallback((map: MapTemplate): CellType[][] => {
    const g: CellType[][] = [];
    if (map.layout) {
      for (let r = 0; r < map.layout.length; r++) {
        const row: CellType[] = [];
        for (let c = 0; c < map.layout[r].length; c++) {
          const ch = map.layout[r][c];
          switch (ch) {
            case '#': row.push('wall'); break;
            case 'd': row.push('door'); break;
            case 'D': row.push('locked-door'); break;
            default: row.push('empty'); break;
          }
        }
        g.push(row);
      }
    } else {
      for (let r = 0; r < map.gridSize.rows; r++) {
        const row: CellType[] = [];
        for (let c = 0; c < map.gridSize.cols; c++) {
          row.push('empty');
        }
        g.push(row);
      }
      for (const obs of map.obstacles) {
        const { x, y } = obs.position;
        if (y >= 0 && y < map.gridSize.rows && x >= 0 && x < map.gridSize.cols) {
          g[y][x] = obs.type as CellType;
        }
      }
    }
    return g;
  }, []);

  const initGame = useCallback(() => {
    if (!currentMap) return;

    const g = parseLayout(currentMap);

    const fireStartPositions: MapCell[] = [];
    if (currentMap.id === 'hospital') {
      fireStartPositions.push({ x: 8, y: 2 });
      fireStartPositions.push({ x: 14, y: 5 });
      fireStartPositions.push({ x: 3, y: 8 });
    } else if (currentMap.id === 'school-classroom') {
      fireStartPositions.push({ x: 8, y: 2 });
      fireStartPositions.push({ x: 15, y: 5 });
      fireStartPositions.push({ x: 4, y: 9 });
    } else if (currentMap.id === 'cinema') {
      fireStartPositions.push({ x: 5, y: 3 });
      fireStartPositions.push({ x: 11, y: 3 });
      fireStartPositions.push({ x: 8, y: 4 });
    }

    for (const fp of fireStartPositions) {
      if (fp.y < g.length && fp.x < g[0].length) {
        g[fp.y][fp.x] = 'fire';
      }
    }

    if (fireStartPositions.length > 0) {
      setFireOrigin(fireStartPositions[0]);
      fireFrontierRef.current = [...fireStartPositions];
    }

    setGrid(g);
    gridRef.current = g;

    const im = new Map<string, MapItem>();
    for (const item of currentMap.items) {
      im.set(`${item.position.x},${item.position.y}`, item);
    }
    setItemMap(im);
    itemMapRef.current = im;
    setCollectedSet(new Set());
    collectedSetRef.current = new Set();

    setPlayerPosition(currentMap.startPoint);
    setPlayerDirection('up');
    setHealth(100);
    setTimeRemaining(150);
    setBurning(false);
    setGameOver(false);
    setGameWon(false);
    gameOverRef.current = false;
    gameWonRef.current = false;
    startTimeRef.current = Date.now();
    setElapsedTime(0);
  }, [currentMap, parseLayout, setPlayerPosition, setPlayerDirection, setHealth, setTimeRemaining, setBurning]);

  useEffect(() => {
    if (!currentMap) {
      navigate('/escape');
      return;
    }
    initGame();
  }, [currentMap, navigate, initGame]);

  const tryMove = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    if (gameOverRef.current || gameWonRef.current) return;

    const delta = { up: { dx: 0, dy: -1 }, down: { dx: 0, dy: 1 }, left: { dx: -1, dy: 0 }, right: { dx: 1, dy: 0 } };
    const d = delta[dir];
    if (!d) return;

    setPlayerDirection(dir);

    const curPos = playerPosRef.current;
    const newPos: MapCell = { x: curPos.x + d.dx, y: curPos.y + d.dy };

    if (!currentMap) return;
    if (newPos.x < 0 || newPos.y < 0 || newPos.x >= currentMap.gridSize.cols || newPos.y >= currentMap.gridSize.rows) return;

    const g = gridRef.current;
    const cellType = g[newPos.y]?.[newPos.x];

    if (cellType === 'wall') return;

    if (cellType === 'locked-door') {
      const items = useGameStore.getState().collectedItems;
      const hasKey = items.some(i => i.includes('钥匙'));
      if (!hasKey) {
        addError('门被锁住了，需要找到钥匙！');
        showNotification('🔒 需要钥匙才能打开这扇门！');
        return;
      }
      const newGrid = g.map(row => [...row]);
      newGrid[newPos.y][newPos.x] = 'empty';
      setGrid(newGrid);
      gridRef.current = newGrid;
      showNotification('🔓 用钥匙打开了门！');
    }

    if (cellType === 'fire') {
      const curHealth = healthRef.current;
      setHealth(Math.max(0, curHealth - FIRE_TOUCH_DAMAGE));
      if (!burningRef.current) {
        setBurning(true);
        showNotification('🔥 你被灼烧了！快找创可贴或棉布止血！');
      }
      addError('走进了火焰区域！');
    }

    setPlayerPosition(newPos);

    const itemKey = `${newPos.x},${newPos.y}`;
    const item = itemMapRef.current.get(itemKey);
    if (item && !collectedSetRef.current.has(itemKey)) {
      collectItem(item.name);
      const newSet = new Set(collectedSetRef.current).add(itemKey);
      setCollectedSet(newSet);
      collectedSetRef.current = newSet;

      if (item.type === 'bandage') {
        setBurning(false);
        const curH = useGameStore.getState().health;
        setHealth(Math.min(100, curH + 10));
        showNotification('🩹 使用创可贴，灼烧停止！恢复10点生命');
      } else if (item.type === 'cotton') {
        setBurning(false);
        const curH = useGameStore.getState().health;
        setHealth(Math.min(100, curH + 15));
        showNotification('🧣 使用棉布/湿毛巾，灼烧停止！恢复15点生命');
      } else if (item.type === 'mask') {
        showNotification('😷 戴上防烟面罩，减少火焰伤害！');
      } else if (item.type === 'key') {
        showNotification('🔑 找到钥匙！去打开锁着的门吧！');
      } else if (item.type === 'flashlight') {
        showNotification('🔦 拿到手电筒！');
      } else if (item.type === 'firstaid') {
        const curH = useGameStore.getState().health;
        setHealth(Math.min(100, curH + 20));
        showNotification('➕ 使用急救包，恢复20点生命！');
      } else {
        showNotification(`拾取了 ${item.name}`);
      }
    }

    if (newPos.x === currentMap.endPoint.x && newPos.y === currentMap.endPoint.y) {
      setGameWon(true);
      gameWonRef.current = true;
      completeGame();
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }
  }, [currentMap, setPlayerDirection, setPlayerPosition, setHealth, setBurning, collectItem, addError, completeGame, showNotification]);

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
      const newTime = useGameStore.getState().timeRemaining - 1;
      setTimeRemaining(newTime);
      if (newTime <= 0) {
        setGameOver(true);
        gameOverRef.current = true;
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [timeRemaining, gameOver, gameWon, currentMap, setTimeRemaining]);

  useEffect(() => {
    if (burning && !gameOver && !gameWon) {
      const interval = setInterval(() => {
        const curH = useGameStore.getState().health;
        const hasMask = useGameStore.getState().collectedItems.some(i => i.includes('面罩'));
        const dmg = hasMask ? 1 : BURN_DAMAGE_PER_TICK;
        setHealth(Math.max(0, curH - dmg));
      }, TICK_MS);
      return () => clearInterval(interval);
    }
  }, [burning, gameOver, gameWon, setHealth]);

  useEffect(() => {
    if (health <= 0 && !gameOver && !gameWon) {
      setGameOver(true);
      gameOverRef.current = true;
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }
  }, [health, gameOver, gameWon]);

  useEffect(() => {
    if (gameOverRef.current || gameWonRef.current || !currentMap) return;

    const interval = setInterval(() => {
      const frontier = fireFrontierRef.current;
      if (frontier.length === 0) return;

      const newFrontier: MapCell[] = [];
      const g = gridRef.current;
      const newGrid = g.map(row => [...row]);
      const dirs = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];

      for (const fc of frontier) {
        for (const d of dirs) {
          const nx = fc.x + d.dx;
          const ny = fc.y + d.dy;
          if (ny >= 0 && ny < newGrid.length && nx >= 0 && nx < newGrid[0].length) {
            const cell = newGrid[ny][nx];
            if (cell === 'empty' || cell === 'door') {
              newGrid[ny][nx] = 'fire';
              newFrontier.push({ x: nx, y: ny });
            }
          }
        }
      }

      if (newFrontier.length > 0) {
        fireFrontierRef.current = newFrontier;
        setGrid(newGrid);
        gridRef.current = newGrid;

        const pp = playerPosRef.current;
        if (newGrid[pp.y]?.[pp.x] === 'fire') {
          if (!burningRef.current) {
            setBurning(true);
            showNotification('🔥 火焰蔓延到你身边！快找棉布止血！');
          }
          const curH = healthRef.current;
          setHealth(Math.max(0, curH - 5));
          addError('被蔓延的火焰灼烧！');
        }
      }
    }, FIRE_SPREAD_INTERVAL);

    return () => clearInterval(interval);
  }, [currentMap, setGrid, setBurning, setHealth, addError, showNotification]);

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

      ctx.fillStyle = '#F0F4F8';
      ctx.fillRect(0, 0, canvasW, canvasH);

      const g = gridRef.current;
      const cs = collectedSetRef.current;
      const im = itemMapRef.current;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cellType = g[r]?.[c];
          const cx = c * CELL;
          const cy = r * CELL;

          if (cellType === 'wall') {
            ctx.fillStyle = '#374151';
            ctx.fillRect(cx, cy, CELL, CELL);
            ctx.fillStyle = '#4B5563';
            ctx.fillRect(cx + 1, cy + 1, CELL - 2, 3);
            ctx.fillRect(cx + 1, cy + 1, 3, CELL - 2);
            ctx.fillStyle = '#1F2937';
            ctx.fillRect(cx + CELL - 3, cy + 1, 2, CELL - 1);
            ctx.fillRect(cx + 1, cy + CELL - 3, CELL - 1, 2);
          } else if (cellType === 'door') {
            ctx.fillStyle = '#FEF3C7';
            ctx.fillRect(cx, cy, CELL, CELL);
            ctx.fillStyle = '#92400E';
            ctx.fillRect(cx + 4, cy + 2, CELL - 8, CELL - 4);
            ctx.fillStyle = '#B45309';
            ctx.fillRect(cx + 6, cy + 4, CELL - 12, CELL - 8);
            ctx.fillStyle = '#FCD34D';
            ctx.beginPath();
            ctx.arc(cx + CELL - 12, cy + CELL / 2, 3, 0, Math.PI * 2);
            ctx.fill();
          } else if (cellType === 'locked-door') {
            ctx.fillStyle = '#FEF3C7';
            ctx.fillRect(cx, cy, CELL, CELL);
            ctx.fillStyle = '#7C2D12';
            ctx.fillRect(cx + 4, cy + 2, CELL - 8, CELL - 4);
            ctx.fillStyle = '#991B1B';
            ctx.fillRect(cx + 6, cy + 4, CELL - 12, CELL - 8);
            ctx.fillStyle = '#FCD34D';
            ctx.beginPath();
            ctx.arc(cx + CELL / 2, cy + CELL / 2, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#7C2D12';
            ctx.beginPath();
            ctx.arc(cx + CELL / 2, cy + CELL / 2, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(cx + CELL / 2 - 1.5, cy + CELL / 2 + 2, 3, 6);
          } else if (cellType === 'fire') {
            ctx.fillStyle = '#450A0A';
            ctx.fillRect(cx, cy, CELL, CELL);
            const time = Date.now() / 150;
            for (let i = 0; i < 4; i++) {
              const fx = cx + 8 + Math.sin(time + i * 1.8) * 10;
              const fy = cy + 8 + Math.cos(time + i * 1.3) * 10;
              const fs = 8 + Math.sin(time + i) * 4;
              const gradient = ctx.createRadialGradient(fx, fy, 0, fx, fy, fs);
              gradient.addColorStop(0, '#FDE047');
              gradient.addColorStop(0.3, '#F97316');
              gradient.addColorStop(0.7, '#EF4444');
              gradient.addColorStop(1, 'rgba(239,68,68,0)');
              ctx.fillStyle = gradient;
              ctx.beginPath();
              ctx.arc(fx, fy, fs, 0, Math.PI * 2);
              ctx.fill();
            }
          } else {
            ctx.fillStyle = '#F8FAFC';
            ctx.fillRect(cx, cy, CELL, CELL);
            ctx.strokeStyle = '#E2E8F0';
            ctx.lineWidth = 0.3;
            ctx.strokeRect(cx, cy, CELL, CELL);
          }
        }
      }

      if (fireOrigin) {
        const ox = fireOrigin.x * CELL + CELL / 2;
        const oy = fireOrigin.y * CELL - 6;
        ctx.fillStyle = 'rgba(239,68,68,0.8)';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('🔥起火点', ox, oy);
      }

      for (const item of currentMap.items) {
        const key = `${item.position.x},${item.position.y}`;
        if (cs.has(key)) continue;
        if (g[item.position.y]?.[item.position.x] === 'wall' || g[item.position.y]?.[item.position.x] === 'fire') continue;

        const ix = item.position.x * CELL + CELL / 2;
        const iy = item.position.y * CELL + CELL / 2;
        const pulse = Math.sin(Date.now() / 300) * 2;

        ctx.fillStyle = 'rgba(254,243,199,0.8)';
        ctx.beginPath();
        ctx.arc(ix, iy, 13 + pulse, 0, Math.PI * 2);
        ctx.fill();

        const itemIcons: Record<string, string> = {
          flashlight: '🔦', mask: '😷', firstaid: '➕', 'exit-sign': '🚪',
          key: '🔑', phone: '📞', bandage: '🩹', cotton: '🧣',
        };
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
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
      ctx.fillStyle = '#16A34A';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('出口', epx + CELL / 2, epy + CELL / 2);

      const pp = playerPosRef.current;
      const pd = useGameStore.getState().playerDirection;
      const px = pp.x * CELL + CELL / 2;
      const py = pp.y * CELL + CELL / 2;

      ctx.save();
      ctx.translate(px, py);

      const dirAngles: Record<string, number> = { up: 0, right: 90, down: 180, left: 270 };
      ctx.rotate((dirAngles[pd] || 0) * Math.PI / 180);

      ctx.fillStyle = burningRef.current ? '#FCA5A5' : '#93C5FD';
      ctx.beginPath();
      ctx.arc(0, 0, PLAYER_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = burningRef.current ? '#EF4444' : '#3B82F6';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#1E40AF';
      ctx.beginPath();
      ctx.arc(-5, -4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(5, -4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(-4, -5, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(6, -5, 1.2, 0, Math.PI * 2);
      ctx.fill();

      if (burningRef.current) {
        const ft = Date.now() / 100;
        for (let i = 0; i < 3; i++) {
          const ffx = Math.sin(ft + i * 2) * 6;
          const ffy = -PLAYER_SIZE / 2 - 4 + Math.cos(ft + i) * 3;
          ctx.fillStyle = i === 0 ? '#FDE047' : '#F97316';
          ctx.beginPath();
          ctx.arc(ffx, ffy, 4 - i, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [currentMap, grid, gameOver, gameWon, fireOrigin]);

  useEffect(() => {
    if (gameOver || gameWon) {
      const timer = setTimeout(() => {
        useGameStore.setState({
          timeRemaining: elapsedTime || (150 - timeRemaining),
        });
        navigate('/escape/report');
      }, 2500);
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
              {burning && (
                <span className="text-xs text-red-500 animate-pulse font-bold">🔥灼烧中</span>
              )}
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
              <span key={i} className="w-7 h-7 rounded bg-amber-100 flex items-center justify-center text-sm" title={item}>
                {item.includes('手电') ? '🔦' : item.includes('面罩') ? '😷' : item.includes('急救') ? '➕' : item.includes('钥匙') ? '🔑' : item.includes('创可贴') ? '🩹' : item.includes('棉布') || item.includes('毛巾') ? '🧣' : '📦'}
              </span>
            ))}
          </div>
        </div>
      </div>

      {notification && (
        <div className="mb-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 text-center animate-pulse">
          {notification}
        </div>
      )}

      <div className="relative">
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
              <img src="/elephant-mascot-new.png" alt="安全小象" className="w-8 h-8 object-contain" />
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
          🔥 火焰会从多处起火点蔓延 · 🔑 找到钥匙打开锁住的门 · 🩹🧣 拾取创可贴/棉布停止灼烧
          {' · '}使用 WASD 或方向键移动
        </p>
      </div>
    </div>
  );
}
