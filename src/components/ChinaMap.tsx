import { useState, useEffect, useCallback } from 'react';
import chinaMapSvgRaw from '/china-map.svg?raw';

interface ProvinceInfo {
  id: string;
  name: string;
  cx: number;
  cy: number;
}

const provinceList: ProvinceInfo[] = [
  { id: 'CNAH', name: '安徽', cx: 694.7, cy: 475.7 },
  { id: 'CNMO', name: '澳门', cx: 640.1, cy: 641.4 },
  { id: 'CNBJ', name: '北京', cx: 682.9, cy: 324.8 },
  { id: 'CNCQ', name: '重庆', cx: 553.5, cy: 507.9 },
  { id: 'CNFJ', name: '福建', cx: 708, cy: 579.4 },
  { id: 'CNGS', name: '甘肃', cx: 449.4, cy: 370.3 },
  { id: 'CNGD', name: '广东', cx: 637.9, cy: 629.5 },
  { id: 'CNGX', name: '广西', cx: 561.5, cy: 612.9 },
  { id: 'CNGZ', name: '贵州', cx: 536.3, cy: 563.3 },
  { id: 'CNHI', name: '海南', cx: 584.7, cy: 689 },
  { id: 'CNHE', name: '河北', cx: 685.7, cy: 341.6 },
  { id: 'CNHA', name: '河南', cx: 638.9, cy: 443.1 },
  { id: 'CNHL', name: '黑龙江', cx: 854.2, cy: 147.2 },
  { id: 'CNHB', name: '湖北', cx: 620.2, cy: 491.2 },
  { id: 'CNHN', name: '湖南', cx: 609.8, cy: 555 },
  { id: 'CNJL', name: '吉林', cx: 831.3, cy: 256.9 },
  { id: 'CNJS', name: '江苏', cx: 722.7, cy: 459.8 },
  { id: 'CNJX', name: '江西', cx: 676.3, cy: 556.9 },
  { id: 'CNLN', name: '辽宁', cx: 769.3, cy: 307.1 },
  { id: 'CNNM', name: '内蒙古', cx: 610.7, cy: 208.8 },
  { id: 'CNNX', name: '宁夏', cx: 526.7, cy: 380.4 },
  { id: 'CNQH', name: '青海', cx: 382.4, cy: 413.4 },
  { id: 'CNSD', name: '山东', cx: 716.9, cy: 399.1 },
  { id: 'CNSX', name: '山西', cx: 622.3, cy: 372.9 },
  { id: 'CNSN', name: '陕西', cx: 563.1, cy: 409.9 },
  { id: 'CNSH', name: '上海', cx: 756, cy: 489.6 },
  { id: 'CNSC', name: '四川', cx: 482.1, cy: 506.9 },
  { id: 'CNTW', name: '台湾', cx: 738.1, cy: 618 },
  { id: 'CNTJ', name: '天津', cx: 696.3, cy: 341.5 },
  { id: 'CNXZ', name: '西藏', cx: 272, cy: 476.8 },
  { id: 'CNHK', name: '香港', cx: 648.4, cy: 637.9 },
  { id: 'CNXJ', name: '新疆', cx: 215.3, cy: 278.5 },
  { id: 'CNYN', name: '云南', cx: 466.4, cy: 591.2 },
  { id: 'CNZJ', name: '浙江', cx: 739.7, cy: 525.2 },
];

const cnNameMap: Record<string, string> = {
  'Shaanxi Province': '陕西',
  'Shanghai Municipality': '上海',
  'Chongqing Municipality': '重庆',
  'Zhejiang Province': '浙江',
  'Jiangxi Province': '江西',
  'Yunnan Province': '云南',
  'Shandong Province': '山东',
  'Liaoning Province': '辽宁',
  'Tibet Autonomous Region': '西藏',
  'Gansu province': '甘肃',
  'Hong Kong Special Administrative Region': '香港',
  'Qinghai Province': '青海',
  'Beijing Municipality': '北京',
  'Macao Special Administrative Region': '澳门',
  'Inner Mongolia Autonomous Region': '内蒙古',
  'Hubei Province': '湖北',
  'Anhui Province': '安徽',
  'Guizhou Province': '贵州',
  'Ningxia Hui Autonomous Region': '宁夏',
  'Jiangsu Province': '江苏',
  'Xinjiang Uygur Autonomous Region': '新疆',
  'Shanxi Province': '山西',
  'Hunan Province': '湖南',
  'Sichuan Province': '四川',
  'Guangxi Zhuang Autonomous Region': '广西',
  'Jilin Province': '吉林',
  'Taiwan Province': '台湾',
  'Hebei Province': '河北',
  'Tianjin Municipality': '天津',
  'Guangdong Province': '广东',
  'Fujian Province': '福建',
  'Heilongjiang Province': '黑龙江',
  'Henan Province': '河南',
  'Hainan Province': '海南',
};

interface ChinaMapProps {
  selectedProvince: string | null;
  onSelect: (name: string) => void;
}

export default function ChinaMap({ selectedProvince, onSelect }: ChinaMapProps) {
  const [svgContent, setSvgContent] = useState<string>('');
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const text = chinaMapSvgRaw;
    let modified = text.replace(
          '<g id="features">',
          `<style>
            #features path {
              fill: #FDEBE6;
              stroke: #1a1a1a;
              stroke-width: 1.8;
              transition: fill 0.15s, stroke-width 0.15s;
              cursor: pointer;
            }
            #features path:hover {
              fill: #FF8C42;
              stroke: #1a1a1a;
              stroke-width: 2.5;
            }
          </style>
          <g id="features">`
        );

        const closingSvgIdx = modified.lastIndexOf('</svg>');
        if (closingSvgIdx !== -1) {
          const labelsSvg = provinceList.map(p => {
            return `<text x="${p.cx}" y="${p.cy}" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="900" fill="#0a0a0a" stroke="#ffffff" stroke-width="2.5" paint-order="stroke" style="pointer-events:none;user-select:none;font-family:sans-serif;">${p.name}</text>` +
              `<text x="${p.cx}" y="${p.cy}" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="900" fill="#0a0a0a" style="pointer-events:none;user-select:none;font-family:sans-serif;">${p.name}</text>`;
          }).join('\n');

          modified = modified.substring(0, closingSvgIdx) +
            `<g id="province-labels">${labelsSvg}</g>` +
            modified.substring(closingSvgIdx);
        }

        setSvgContent(modified);
  }, [selectedProvince]);

  const getProvinceName = useCallback((el: SVGElement): string | null => {
    const path = el.closest('path');
    if (!path) return null;
    const pathId = path.getAttribute('id') || '';
    const nameAttr = path.getAttribute('name') || '';
    const province = provinceList.find(p => p.id === pathId);
    if (province) return province.name;
    return cnNameMap[nameAttr] || null;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as SVGElement;
    const name = getProvinceName(target);
    if (name) {
      setHoveredProvince(name);
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    } else {
      setHoveredProvince(null);
    }
  }, [getProvinceName]);

  const handleMouseLeave = useCallback(() => {
    setHoveredProvince(null);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as SVGElement;
    const name = getProvinceName(target);
    if (name) {
      onSelect(name);
    }
  }, [getProvinceName, onSelect]);

  return (
    <div
      className="relative w-full select-none cursor-pointer"
      style={{ paddingBottom: '73.8%' }}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="absolute inset-0 [&>svg]:w-full [&>svg]:h-full"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />

      {hoveredProvince && (
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y - 48,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl text-sm font-bold whitespace-nowrap border-2 border-white">
            {hoveredProvince}
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
}
