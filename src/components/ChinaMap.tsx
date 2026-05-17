import { useState } from 'react';

interface ProvinceLabel {
  name: string;
  left: string;
  top: string;
}

const provinces: ProvinceLabel[] = [
  { name: '新疆', left: '22%', top: '28%' },
  { name: '西藏', left: '18%', top: '52%' },
  { name: '青海', left: '32%', top: '42%' },
  { name: '内蒙古', left: '55%', top: '14%' },
  { name: '甘肃', left: '38%', top: '30%' },
  { name: '宁夏', left: '45%', top: '28%' },
  { name: '陕西', left: '46%', top: '38%' },
  { name: '山西', left: '52%', top: '30%' },
  { name: '河北', left: '57%', top: '24%' },
  { name: '北京', left: '59%', top: '20%' },
  { name: '天津', left: '62%', top: '22%' },
  { name: '山东', left: '62%', top: '33%' },
  { name: '河南', left: '54%', top: '38%' },
  { name: '辽宁', left: '68%', top: '16%' },
  { name: '吉林', left: '74%', top: '10%' },
  { name: '黑龙江', left: '80%', top: '6%' },
  { name: '江苏', left: '63%', top: '42%' },
  { name: '上海', left: '68%', top: '44%' },
  { name: '安徽', left: '58%', top: '45%' },
  { name: '浙江', left: '64%', top: '50%' },
  { name: '福建', left: '63%', top: '58%' },
  { name: '江西', left: '56%', top: '56%' },
  { name: '湖北', left: '50%', top: '48%' },
  { name: '湖南', left: '50%', top: '58%' },
  { name: '广东', left: '56%', top: '68%' },
  { name: '广西', left: '44%', top: '68%' },
  { name: '海南', left: '48%', top: '82%' },
  { name: '重庆', left: '42%', top: '48%' },
  { name: '四川', left: '34%', top: '52%' },
  { name: '贵州', left: '42%', top: '60%' },
  { name: '云南', left: '32%', top: '68%' },
  { name: '台湾', left: '70%', top: '56%' },
  { name: '香港', left: '60%', top: '70%' },
  { name: '澳门', left: '56%', top: '72%' },
];

interface ChinaMapProps {
  selectedProvince: string | null;
  onSelect: (name: string) => void;
}

export default function ChinaMap({ selectedProvince, onSelect }: ChinaMapProps) {
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  return (
    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
      <img
        src="/china-map.jpg"
        alt="中国地图"
        className="absolute inset-0 w-full h-full object-contain"
        draggable={false}
      />

      {provinces.map((province) => {
        const isSelected = selectedProvince === province.name;
        const isHovered = hoveredProvince === province.name;

        return (
          <div
            key={province.name}
            className="absolute"
            style={{
              left: province.left,
              top: province.top,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <button
              onClick={() => onSelect(province.name)}
              onMouseEnter={() => setHoveredProvince(province.name)}
              onMouseLeave={() => setHoveredProvince(null)}
              className={`
                px-1.5 py-0.5 rounded text-xs font-bold whitespace-nowrap
                transition-all duration-200 cursor-pointer border-2
                ${isSelected
                  ? 'bg-brand-orange text-white border-brand-orange shadow-lg scale-110'
                  : isHovered
                    ? 'bg-white/90 text-gray-800 border-gray-400 shadow-md scale-105'
                    : 'bg-white/70 text-gray-700 border-transparent hover:bg-white/90'
                }
              `}
              style={{ fontSize: '10px', lineHeight: '1.2' }}
            >
              {province.name}
            </button>
          </div>
        );
      })}
    </div>
  );
}
