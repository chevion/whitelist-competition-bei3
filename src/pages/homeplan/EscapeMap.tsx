import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MousePointer2, Square, DoorOpen, AppWindow, Sofa, Bed, Table,
  Flame, Eraser, Trash2, Route, Sparkles, Download, ArrowLeft, X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { generateEscapeGuide } from '@/services/aiService';
import { exportAsImage } from '@/utils/exportImage';
import AILoading from '@/components/AILoading';

type ToolType = 'select' | 'wall' | 'door' | 'window' | 'sofa' | 'bed' | 'table' | 'extinguisher' | 'eraser';

interface DrawElement {
  id: string;
  type: Exclude<ToolType, 'select' | 'eraser'>;
  x: number;
  y: number;
  width: number;
  height: number;
  isEscapeExit: boolean;
}

interface Point {
  x: number;
  y: number;
}

const GRID = 20;
const CANVAS_W = 800;
const CANVAS_H = 600;

const toolConfig: { type: ToolType; icon: typeof MousePointer2; label: string }[] = [
  { type: 'select', icon: MousePointer2, label: '选择' },
  { type: 'wall', icon: Square, label: '墙壁' },
  { type: 'door', icon: DoorOpen, label: '门' },
  { type: 'window', icon: AppWindow, label: '窗户' },
  { type: 'sofa', icon: Sofa, label: '沙发' },
  { type: 'bed', icon: Bed, label: '床' },
  { type: 'table', icon: Table, label: '桌子' },
  { type: 'extinguisher', icon: Flame, label: '灭火器' },
  { type: 'eraser', icon: Eraser, label: '橡皮擦' },
];

const defaultSizes: Record<string, { w: number; h: number }> = {
  wall: { w: GRID, h: GRID },
  door: { w: GRID, h: GRID },
  window: { w: GRID, h: GRID },
  sofa: { w: GRID, h: GRID },
  bed: { w: GRID, h: GRID },
  table: { w: GRID, h: GRID },
  extinguisher: { w: GRID, h: GRID },
};

const typeLabels: Record<string, string> = {
  wall: '墙壁',
  door: '门',
  window: '窗户',
  sofa: '沙发',
  bed: '床',
  table: '桌子',
  extinguisher: '灭火器',
};

function snap(v: number) {
  return Math.round(v / GRID) * GRID;
}

let idCounter = 0;
function nextId() {
  return `el_${++idCounter}`;
}

function aStarProper(start: Point, goals: Point[], gridW: number, gridH: number, obstacles: boolean[][]): Point[] {
  const key = (p: Point) => `${p.x},${p.y}`;
  const heuristic = (a: Point, b: Point) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

  const minGoalH = (p: Point) => Math.min(...goals.map((g) => heuristic(p, g)));

  interface Node {
    pos: Point;
    g: number;
    f: number;
    parent: string | null;
  }

  const openMap = new Map<string, Node>();
  const closedSet = new Set<string>();

  const startNode: Node = { pos: start, g: 0, f: minGoalH(start), parent: null };
  openMap.set(key(start), startNode);

  const dirs = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];

  while (openMap.size > 0) {
    let curKey = '';
    let curNode = startNode;
    let minF = Infinity;
    for (const [k, n] of openMap) {
      if (n.f < minF) { minF = n.f; curKey = k; curNode = n; }
    }

    if (goals.some((g) => g.x === curNode.pos.x && g.y === curNode.pos.y)) {
      const path: Point[] = [];
      let k: string | null = curKey;
      while (k) {
        const n = openMap.get(k);
        if (!n) break;
        path.unshift(n.pos);
        k = n.parent;
      }
      return path;
    }

    openMap.delete(curKey);
    closedSet.add(curKey);

    for (const d of dirs) {
      const nx = curNode.pos.x + d.x;
      const ny = curNode.pos.y + d.y;
      if (nx < 0 || ny < 0 || nx >= gridW || ny >= gridH) continue;
      const nk = key({ x: nx, y: ny });
      if (closedSet.has(nk)) continue;
      if (obstacles[ny]?.[nx]) continue;

      const g = curNode.g + 1;
      const existing = openMap.get(nk);
      if (existing && g >= existing.g) continue;

      openMap.set(nk, { pos: { x: nx, y: ny }, g, f: g + minGoalH({ x: nx, y: ny }), parent: curKey });
    }
  }

  return [];
}

export default function EscapeMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<ToolType>('select');
  const [elements, setElements] = useState<DrawElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [escapePath, setEscapePath] = useState<Point[]>([]);
  const [guideText, setGuideText] = useState('');
  const [loadingGuide, setLoadingGuide] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [drawing, setDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<Point | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<Point | null>(null);

  const selected = elements.find((e) => e.id === selectedId) || null;

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= CANVAS_W; x += GRID) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_H);
      ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_H; y += GRID) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_W, y);
      ctx.stroke();
    }

    for (const el of elements) {
      drawElement(ctx, el, el.id === selectedId);
    }

    if (drawing && drawStart && drawCurrent && (tool === 'wall')) {
      const x = Math.min(drawStart.x, drawCurrent.x);
      const y = Math.min(drawStart.y, drawCurrent.y);
      const w = Math.abs(drawCurrent.x - drawStart.x);
      const h = Math.abs(drawCurrent.y - drawStart.y);
      ctx.strokeStyle = '#4B5563';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);
    }

    if (escapePath.length > 1) {
      ctx.strokeStyle = '#22C55E';
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(escapePath[0].x * GRID + GRID / 2, escapePath[0].y * GRID + GRID / 2);
      for (let i = 1; i < escapePath.length; i++) {
        ctx.lineTo(escapePath[i].x * GRID + GRID / 2, escapePath[i].y * GRID + GRID / 2);
      }
      ctx.stroke();

      ctx.fillStyle = '#22C55E';
      for (let i = 1; i < escapePath.length; i++) {
        const prev = escapePath[i - 1];
        const cur = escapePath[i];
        const dx = cur.x - prev.x;
        const dy = cur.y - prev.y;
        const cx = cur.x * GRID + GRID / 2;
        const cy = cur.y * GRID + GRID / 2;
        const angle = Math.atan2(dy, dx);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(6, 0);
        ctx.lineTo(-4, -5);
        ctx.lineTo(-4, 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
  }, [elements, selectedId, escapePath, drawing, drawStart, drawCurrent, tool]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const hitTest = (x: number, y: number): DrawElement | null => {
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      if (x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height) {
        return el;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasPos(e);

    if (tool === 'select') {
      const hit = hitTest(pos.x, pos.y);
      if (hit) {
        setSelectedId(hit.id);
        setDragging(true);
        setDragOffset({ x: pos.x - hit.x, y: pos.y - hit.y });
      } else {
        setSelectedId(null);
      }
      return;
    }

    if (tool === 'eraser') {
      const hit = hitTest(pos.x, pos.y);
      if (hit) {
        setElements((prev) => prev.filter((el) => el.id !== hit.id));
        if (selectedId === hit.id) setSelectedId(null);
        setEscapePath([]);
      }
      return;
    }

    if (tool === 'wall') {
      setDrawing(true);
      setDrawStart({ x: snap(pos.x), y: snap(pos.y) });
      setDrawCurrent({ x: snap(pos.x), y: snap(pos.y) });
      return;
    }

    const size = defaultSizes[tool];
    if (size) {
      const newEl: DrawElement = {
        id: nextId(),
        type: tool as DrawElement['type'],
        x: snap(pos.x - size.w / 2),
        y: snap(pos.y - size.h / 2),
        width: size.w,
        height: size.h,
        isEscapeExit: false,
      };
      setElements((prev) => [...prev, newEl]);
      setSelectedId(newEl.id);
      setEscapePath([]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasPos(e);

    if (dragging && selectedId) {
      setElements((prev) =>
        prev.map((el) =>
          el.id === selectedId
            ? { ...el, x: snap(pos.x - dragOffset.x), y: snap(pos.y - dragOffset.y) }
            : el,
        ),
      );
      setEscapePath([]);
      return;
    }

    if (drawing && drawStart) {
      setDrawCurrent({ x: snap(pos.x), y: snap(pos.y) });
    }
  };

  const handleMouseUp = () => {
    if (drawing && drawStart && drawCurrent) {
      const x1 = Math.min(drawStart.x, drawCurrent.x);
      const y1 = Math.min(drawStart.y, drawCurrent.y);
      const x2 = Math.max(drawStart.x, drawCurrent.x);
      const y2 = Math.max(drawStart.y, drawCurrent.y);
      
      const startCol = Math.floor(x1 / GRID);
      const startRow = Math.floor(y1 / GRID);
      const endCol = Math.floor(x2 / GRID);
      const endRow = Math.floor(y2 / GRID);
      
      const newElements: DrawElement[] = [];
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const newEl: DrawElement = {
            id: nextId(),
            type: 'wall',
            x: col * GRID,
            y: row * GRID,
            width: GRID,
            height: GRID,
            isEscapeExit: false,
          };
          newElements.push(newEl);
        }
      }
      
      if (newElements.length > 0) {
        setElements((prev) => [...prev, ...newElements]);
        setSelectedId(newElements[newElements.length - 1].id);
        setEscapePath([]);
      }
    }
    setDragging(false);
    setDrawing(false);
    setDrawStart(null);
    setDrawCurrent(null);
  };

  const handleClear = () => {
    setElements([]);
    setSelectedId(null);
    setEscapePath([]);
    setGuideText('');
  };

  const handleCalcPath = () => {
    const exits = elements.filter((e) => e.isEscapeExit);
    if (exits.length === 0) {
      alert('请先标记至少一个逃生出口');
      return;
    }

    const cols = CANVAS_W / GRID;
    const rows = CANVAS_H / GRID;
    const obstacles: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));

    const obstacleTypes = new Set(['wall', 'sofa', 'bed', 'table']);
    for (const el of elements) {
      if (!obstacleTypes.has(el.type)) continue;
      const gx1 = Math.floor(el.x / GRID);
      const gy1 = Math.floor(el.y / GRID);
      const gx2 = Math.ceil((el.x + el.width) / GRID);
      const gy2 = Math.ceil((el.y + el.height) / GRID);
      for (let gy = gy1; gy < gy2; gy++) {
        for (let gx = gx1; gx < gx2; gx++) {
          if (gy >= 0 && gy < rows && gx >= 0 && gx < cols) {
            obstacles[gy][gx] = true;
          }
        }
      }
    }

    const goals: Point[] = [];
    for (const ex of exits) {
      const cx = Math.floor((ex.x + ex.width / 2) / GRID);
      const cy = Math.floor((ex.y + ex.height / 2) / GRID);
      goals.push({ x: cx, y: cy });
      if (cy > 0 && !obstacles[cy - 1][cx]) goals.push({ x: cx, y: cy - 1 });
      if (cy < rows - 1 && !obstacles[cy + 1][cx]) goals.push({ x: cx, y: cy + 1 });
      if (cx > 0 && !obstacles[cy][cx - 1]) goals.push({ x: cx - 1, y: cy });
      if (cx < cols - 1 && !obstacles[cy][cx + 1]) goals.push({ x: cx + 1, y: cy });
    }

    const startX = Math.floor(CANVAS_W / 2 / GRID);
    const startY = Math.floor(CANVAS_H / 2 / GRID);

    for (const g of goals) {
      obstacles[g.y][g.x] = false;
    }
    obstacles[startY][startX] = false;

    const path = aStarProper({ x: startX, y: startY }, goals, cols, rows, obstacles);
    if (path.length === 0) {
      alert('未找到逃生路径，请检查布局是否合理');
    }
    setEscapePath(path);
  };

  const handleGenerateGuide = async () => {
    if (elements.length === 0) return;
    setLoadingGuide(true);
    try {
      const desc = elements.map((el) => {
        const label = typeLabels[el.type];
        const exitMark = el.isEscapeExit ? '（逃生出口）' : '';
        return `${label}${exitMark} 位于 (${el.x}, ${el.y})，尺寸 ${el.width}×${el.height}`;
      }).join('；');
      const exits = elements.filter((e) => e.isEscapeExit);
      const features = `共有${elements.length}个元素，${exits.length}个逃生出口。画布尺寸${CANVAS_W}×${CANVAS_H}。`;
      const res = await generateEscapeGuide(desc, features);
      if (res.parsedJSON) {
        const data = res.parsedJSON as Record<string, unknown>;
        let text = '';
        if (Array.isArray(data.routes)) {
          text = (data.routes as Record<string, unknown>[]).map((r, i) => {
            const name = r.name || `路线${i + 1}`;
            const nodes = Array.isArray(r.nodes) ? r.nodes.join(' → ') : '';
            const notes = Array.isArray(r.notes) ? r.notes.join('\n') : (r.notes as string || '');
            return `【${name}】\n路径：${nodes}\n${notes}`;
          }).join('\n\n');
        }
        if (data.meetingPoint) text += `\n\n集合点：${data.meetingPoint}`;
        if (Array.isArray(data.generalNotes)) text += `\n\n注意事项：\n${(data.generalNotes as string[]).join('\n')}`;
        setGuideText(text || res.content);
      } else {
        setGuideText(res.content);
      }
      setShowGuide(true);
    } finally {
      setLoadingGuide(false);
    }
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = '家庭逃生图.png';
    link.href = dataUrl;
    link.click();
  };

  const handleExportWithGuide = async () => {
    const container = document.getElementById('escape-export-container');
    if (!container) return;
    await exportAsImage('escape-export-container', '家庭逃生图_含指南');
  };

  const toggleEscapeExit = () => {
    if (!selectedId) return;
    setElements((prev) =>
      prev.map((el) =>
        el.id === selectedId ? { ...el, isEscapeExit: !el.isEscapeExit } : el,
      ),
    );
    setEscapePath([]);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setElements((prev) => prev.filter((el) => el.id !== selectedId));
    setSelectedId(null);
    setEscapePath([]);
  };

  return (
    <div className="pb-20 md:pb-0">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/home-plan" className="p-2 rounded-lg hover:bg-gray-100 text-dark-text/60 hover:text-dark-text transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-title text-2xl text-brand-orange">家庭逃生图</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex lg:flex-col gap-1 bg-white rounded-xl p-2 shadow-sm border border-gray-100">
          {toolConfig.map((t) => {
            const Icon = t.icon;
            const isActive = tool === t.type;
            return (
              <button
                key={t.type}
                onClick={() => { setTool(t.type); setSelectedId(null); }}
                className={`p-2.5 rounded-lg transition-colors ${
                  isActive ? 'bg-brand-orange text-white' : 'text-dark-text/60 hover:bg-gray-100 hover:text-dark-text'
                }`}
                title={t.label}
              >
                <Icon size={20} />
              </button>
            );
          })}
          <div className="border-t border-gray-200 my-1 lg:my-1" />
          <button onClick={handleClear} className="p-2.5 rounded-lg text-danger-red/70 hover:bg-red-50 hover:text-danger-red transition-colors" title="清空画布">
            <Trash2 size={20} />
          </button>
        </div>

        <div className="flex-1 min-w-0" ref={containerRef}>
          <div id="escape-export-container" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="w-full cursor-crosshair"
              style={{ maxHeight: '70vh' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
            {guideText && (
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <h4 className="font-medium text-dark-text mb-2">逃生行动指南</h4>
                <p className="text-sm text-dark-text/80 whitespace-pre-wrap">{guideText}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleCalcPath} className="flex items-center gap-1.5 px-4 py-2 bg-safety-green text-white rounded-lg text-sm hover:bg-green-600 transition">
              <Route size={16} />
              计算逃生路径
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleGenerateGuide} disabled={loadingGuide} className="flex items-center gap-1.5 px-4 py-2 bg-brand-orange text-white rounded-lg text-sm hover:bg-orange-600 disabled:opacity-50 transition">
              <Sparkles size={16} />
              生成行动指南
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleExport} className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition">
              <Download size={16} />
              导出图片
            </motion.button>
            {guideText && (
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleExportWithGuide} className="flex items-center gap-1.5 px-4 py-2 bg-dark-text text-white rounded-lg text-sm hover:bg-gray-800 transition">
                <Download size={16} />
                导出含指南
              </motion.button>
            )}
          </div>
          {loadingGuide && <AILoading text="正在生成逃生行动指南..." />}
        </div>

        <div className="w-full lg:w-56 bg-white rounded-xl p-4 shadow-sm border border-gray-100 h-fit">
          <h3 className="font-medium text-dark-text mb-3 text-sm">属性面板</h3>
          {selected ? (
            <div className="space-y-3">
              <div>
                <span className="text-xs text-dark-text/50">类型</span>
                <p className="text-sm font-medium text-dark-text">{typeLabels[selected.type]}</p>
              </div>
              <div>
                <span className="text-xs text-dark-text/50">位置</span>
                <p className="text-sm text-dark-text">({selected.x}, {selected.y})</p>
              </div>
              {(selected.type === 'door' || selected.type === 'window') && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.isEscapeExit}
                    onChange={toggleEscapeExit}
                    className="w-4 h-4 rounded border-gray-300 text-safety-green focus:ring-safety-green"
                  />
                  <span className="text-sm text-dark-text">这是逃生出口</span>
                </label>
              )}
              {selected.isEscapeExit && (
                <div className="flex items-center gap-1.5 text-xs text-safety-green">
                  <Route size={14} />
                  <span>已标记为逃生出口</span>
                </div>
              )}
              <button onClick={deleteSelected} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-danger-red rounded-lg text-sm hover:bg-red-100 transition">
                <Eraser size={14} />
                删除元素
              </button>
            </div>
          ) : (
            <p className="text-xs text-dark-text/40">
              {tool === 'select' ? '点击画布上的元素查看属性' : `点击画布放置${typeLabels[tool] || '元素'}`}
            </p>
          )}

          <div className="mt-4 pt-3 border-t border-gray-100">
            <h4 className="text-xs text-dark-text/50 mb-2">画布信息</h4>
            <p className="text-xs text-dark-text/60">元素数量：{elements.length}</p>
            <p className="text-xs text-dark-text/60">逃生出口：{elements.filter((e) => e.isEscapeExit).length}</p>
            <p className="text-xs text-dark-text/60">路径：{escapePath.length > 0 ? `${escapePath.length}步` : '未计算'}</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showGuide && guideText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setShowGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-title text-lg text-brand-orange">逃生行动指南</h3>
                <button onClick={() => setShowGuide(false)} className="p-1 rounded-lg hover:bg-gray-100 text-dark-text/60">
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-dark-text/80 whitespace-pre-wrap leading-relaxed">{guideText}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function drawElement(ctx: CanvasRenderingContext2D, el: DrawElement, isSelected: boolean) {
  ctx.save();

  switch (el.type) {
    case 'wall':
      ctx.fillStyle = '#4B5563';
      ctx.fillRect(el.x, el.y, GRID, GRID);
      break;

    case 'door':
      ctx.fillStyle = '#92400E';
      ctx.fillRect(el.x, el.y, GRID, GRID);
      ctx.fillStyle = '#D97706';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('门', el.x + GRID / 2, el.y + GRID / 2);
      break;

    case 'window':
      ctx.fillStyle = '#ADD8E6';
      ctx.fillRect(el.x, el.y, GRID, GRID);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('窗', el.x + GRID / 2, el.y + GRID / 2);
      break;

    case 'sofa':
      ctx.fillStyle = '#166534';
      ctx.fillRect(el.x, el.y, GRID, GRID);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('沙', el.x + GRID / 2, el.y + GRID / 2);
      break;

    case 'bed':
      ctx.fillStyle = '#DBEAFE';
      ctx.fillRect(el.x, el.y, GRID, GRID);
      ctx.fillStyle = '#3B82F6';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('床', el.x + GRID / 2, el.y + GRID / 2);
      break;

    case 'table':
      ctx.fillStyle = '#92400E';
      ctx.fillRect(el.x, el.y, GRID, GRID);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('桌', el.x + GRID / 2, el.y + GRID / 2);
      break;

    case 'extinguisher':
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(el.x, el.y, GRID, GRID);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('灭', el.x + GRID / 2, el.y + GRID / 2);
      break;
  }

  if (el.isEscapeExit) {
    ctx.strokeStyle = '#22C55E';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(el.x - 2, el.y - 2, GRID + 4, GRID + 4);
    ctx.setLineDash([]);
    ctx.fillStyle = '#22C55E';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('出口', el.x + GRID / 2, el.y - 4);
  }

  if (isSelected) {
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeRect(el.x - 3, el.y - 3, el.width + 6, el.height + 6);
    const hs = 6;
    ctx.fillStyle = '#3B82F6';
    const handles = [
      { x: el.x - 3, y: el.y - 3 },
      { x: el.x + el.width + 3 - hs, y: el.y - 3 },
      { x: el.x - 3, y: el.y + el.height + 3 - hs },
      { x: el.x + el.width + 3 - hs, y: el.y + el.height + 3 - hs },
    ];
    for (const h of handles) {
      ctx.fillRect(h.x, h.y, hs, hs);
    }
  }

  ctx.restore();
}
