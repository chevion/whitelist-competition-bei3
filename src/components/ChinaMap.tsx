import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProvinceRegion {
  name: string;
  path: string;
  cx: number;
  cy: number;
}

const regions: ProvinceRegion[] = [
  { name: '新疆', path: 'M85,75 L140,55 L195,60 L220,80 L230,110 L225,150 L200,170 L160,180 L120,175 L90,155 L70,120 Z', cx: 155, cy: 120 },
  { name: '西藏', path: 'M70,155 L120,175 L160,180 L200,170 L210,200 L200,240 L170,260 L120,265 L75,250 L55,220 L50,185 Z', cx: 130, cy: 215 },
  { name: '青海', path: 'M160,180 L200,170 L225,150 L240,160 L250,185 L240,210 L215,225 L190,220 L170,210 Z', cx: 210, cy: 195 },
  { name: '内蒙古', path: 'M225,30 L270,25 L320,30 L370,40 L400,55 L410,80 L395,100 L370,105 L340,95 L310,100 L280,95 L250,100 L230,110 L220,80 Z', cx: 320, cy: 65 },
  { name: '甘肃', path: 'M240,110 L250,100 L280,95 L310,100 L300,115 L290,130 L275,145 L260,155 L250,185 L240,160 L225,150 Z', cx: 270, cy: 135 },
  { name: '宁夏', path: 'M290,115 L300,115 L305,125 L300,135 L290,130 Z', cx: 297, cy: 125 },
  { name: '陕西', path: 'M290,130 L300,135 L310,145 L315,165 L310,185 L295,195 L280,190 L275,170 L275,145 Z', cx: 293, cy: 165 },
  { name: '山西', path: 'M315,110 L330,105 L345,110 L350,130 L340,150 L325,155 L310,145 L310,130 Z', cx: 330, cy: 130 },
  { name: '河北', path: 'M345,95 L370,90 L385,100 L380,115 L365,120 L350,130 L345,110 L340,100 Z', cx: 363, cy: 110 },
  { name: '北京', path: 'M370,88 L380,85 L388,92 L385,100 L375,100 Z', cx: 380, cy: 93 },
  { name: '天津', path: 'M388,92 L398,95 L400,105 L392,108 L385,100 Z', cx: 393, cy: 100 },
  { name: '山东', path: 'M350,130 L365,120 L380,115 L395,120 L410,130 L415,150 L405,165 L390,170 L370,165 L355,155 L345,145 Z', cx: 383, cy: 145 },
  { name: '河南', path: 'M310,145 L325,155 L345,145 L355,155 L350,175 L335,190 L315,195 L310,185 L315,165 Z', cx: 333, cy: 170 },
  { name: '辽宁', path: 'M395,55 L415,50 L435,60 L440,80 L430,95 L415,100 L400,95 L395,80 Z', cx: 418, cy: 75 },
  { name: '吉林', path: 'M415,30 L440,25 L460,35 L465,55 L450,65 L435,60 L415,50 Z', cx: 440, cy: 45 },
  { name: '黑龙江', path: 'M440,10 L475,5 L505,15 L510,40 L495,55 L470,55 L460,35 L450,25 Z', cx: 475, cy: 30 },
  { name: '江苏', path: 'M370,165 L390,170 L405,165 L410,180 L400,200 L385,210 L370,205 L365,190 Z', cx: 388, cy: 188 },
  { name: '上海', path: 'M405,195 L415,190 L420,200 L415,210 L405,210 Z', cx: 413, cy: 201 },
  { name: '安徽', path: 'M350,175 L365,190 L370,205 L365,225 L350,235 L335,225 L330,205 L335,190 Z', cx: 350, cy: 208 },
  { name: '浙江', path: 'M385,210 L400,200 L410,210 L415,225 L405,245 L390,245 L380,235 L375,220 Z', cx: 395, cy: 228 },
  { name: '福建', path: 'M375,245 L390,245 L405,245 L400,270 L385,280 L370,275 L365,260 Z', cx: 385, cy: 262 },
  { name: '江西', path: 'M335,225 L350,235 L365,260 L360,280 L345,290 L330,280 L325,260 L330,245 Z', cx: 345, cy: 260 },
  { name: '湖北', path: 'M295,195 L315,195 L335,190 L350,175 L355,195 L345,210 L330,215 L310,210 L295,205 Z', cx: 325, cy: 200 },
  { name: '湖南', path: 'M310,210 L330,215 L345,210 L350,235 L345,260 L330,280 L315,275 L305,255 L300,235 Z', cx: 325, cy: 245 },
  { name: '广东', path: 'M315,275 L330,280 L345,290 L370,275 L385,280 L380,305 L360,320 L340,325 L320,315 L310,295 Z', cx: 348, cy: 300 },
  { name: '广西', path: 'M280,260 L300,255 L315,275 L310,295 L320,315 L300,325 L280,320 L265,305 L260,280 Z', cx: 290, cy: 295 },
  { name: '海南', path: 'M320,340 L335,335 L340,350 L330,360 L320,355 Z', cx: 330, cy: 348 },
  { name: '重庆', path: 'M275,195 L295,195 L295,205 L300,225 L290,235 L275,230 L265,215 Z', cx: 283, cy: 215 },
  { name: '四川', path: 'M215,225 L240,210 L260,200 L275,195 L265,215 L275,230 L270,260 L255,275 L235,275 L220,260 L210,240 Z', cx: 245, cy: 240 },
  { name: '贵州', path: 'M270,260 L290,255 L300,255 L300,280 L280,300 L265,305 L255,290 L255,275 Z', cx: 278, cy: 280 },
  { name: '云南', path: 'M210,260 L235,275 L255,275 L255,290 L265,305 L260,330 L240,345 L215,340 L200,320 L195,290 L200,270 Z', cx: 230, cy: 305 },
  { name: '台湾', path: 'M420,250 L428,245 L432,260 L428,280 L420,275 Z', cx: 425, cy: 262 },
  { name: '香港', path: 'M385,300 L392,298 L394,305 L388,308 Z', cx: 390, cy: 303 },
  { name: '澳门', path: 'M378,310 L384,308 L385,314 L380,315 Z', cx: 382, cy: 312 },
];

interface ChinaMapProps {
  selectedProvince: string | null;
  onSelect: (name: string) => void;
}

export default function ChinaMap({ selectedProvince, onSelect }: ChinaMapProps) {
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  return (
    <svg
      viewBox="30 0 500 380"
      className="w-full h-full"
      style={{ maxHeight: '70vh' }}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="mapBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8F4FD" />
          <stop offset="100%" stopColor="#D1ECFA" />
        </linearGradient>
      </defs>

      <rect x="30" y="0" width="500" height="380" fill="url(#mapBg)" rx="12" />

      {regions.map((region) => {
        const isSelected = selectedProvince === region.name;
        const isHovered = hoveredProvince === region.name;

        let fill = '#B8D4E8';
        if (isSelected) fill = '#FF6B35';
        else if (isHovered) fill = '#8BBFD9';

        return (
          <g key={region.name}>
            <path
              d={region.path}
              fill={fill}
              stroke={isSelected ? '#E55A2B' : '#7BA7C2'}
              strokeWidth={isSelected ? 2 : 0.8}
              style={{
                cursor: 'pointer',
                transition: 'fill 0.2s, stroke-width 0.2s',
                filter: isSelected ? 'url(#glow)' : 'none',
              }}
              onClick={() => onSelect(region.name)}
              onMouseEnter={() => setHoveredProvince(region.name)}
              onMouseLeave={() => setHoveredProvince(null)}
            />
            <text
              x={region.cx}
              y={region.cy}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={isSelected ? 9 : 7.5}
              fontWeight={isSelected ? 'bold' : 'normal'}
              fill={isSelected ? 'white' : '#2C3E50'}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {region.name}
            </text>
          </g>
        );
      })}

      <AnimatePresence>
        {hoveredProvince && !selectedProvince && (
          <g>
            <rect
              x={regions.find(r => r.name === hoveredProvince)!.cx - 30}
              y={regions.find(r => r.name === hoveredProvince)!.cy - 25}
              width={60}
              height={16}
              rx={4}
              fill="#2C3E50"
              opacity={0.85}
            />
            <text
              x={regions.find(r => r.name === hoveredProvince)!.cx}
              y={regions.find(r => r.name === hoveredProvince)!.cy - 17}
              textAnchor="middle"
              fontSize={8}
              fill="white"
              fontWeight="bold"
            >
              {hoveredProvince}
            </text>
          </g>
        )}
      </AnimatePresence>
    </svg>
  );
}
