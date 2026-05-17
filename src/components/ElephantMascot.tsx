import { useState } from 'react';

interface ElephantMascotProps {
  mood?: 'happy' | 'sad' | 'thinking' | 'excited' | 'worried' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

const sizeMap = {
  sm: { container: 60, head: 36, ear: 16, trunk: 20, hat: 14, eye: 5, fontSize: 12 },
  md: { container: 100, head: 56, ear: 24, trunk: 30, hat: 20, eye: 7, fontSize: 14 },
  lg: { container: 140, head: 80, ear: 34, trunk: 42, hat: 28, eye: 10, fontSize: 16 },
};

const moodColors = {
  happy: { cheek: '#FFB6C1', mouthColor: '#E74C3C' },
  sad: { cheek: '#D3D3D3', mouthColor: '#7F8C8D' },
  thinking: { cheek: '#FFE4B5', mouthColor: '#95A5A6' },
  excited: { cheek: '#FF69B4', mouthColor: '#E74C3C' },
  worried: { cheek: '#F0E68C', mouthColor: '#E67E22' },
  neutral: { cheek: '#FFB6C1', mouthColor: '#7F8C8D' },
};

export default function ElephantMascot({
  mood = 'neutral',
  size = 'md',
  message,
}: ElephantMascotProps) {
  const [showMessage, setShowMessage] = useState(true);
  const s = sizeMap[size];
  const mc = moodColors[mood];

  const renderEyes = () => {
    const cx = s.head / 2;
    const cy = s.head * 0.38;
    const gap = s.head * 0.18;
    const r = s.eye;

    switch (mood) {
      case 'happy':
      case 'excited':
        return (
          <>
            <path
              d={`M${cx - gap - r} ${cy} Q${cx - gap} ${cy - r} ${cx - gap + r} ${cy}`}
              fill="none"
              stroke="#2C3E50"
              strokeWidth={Math.max(1.5, s.eye * 0.4)}
              strokeLinecap="round"
            />
            <path
              d={`M${cx + gap - r} ${cy} Q${cx + gap} ${cy - r} ${cx + gap + r} ${cy}`}
              fill="none"
              stroke="#2C3E50"
              strokeWidth={Math.max(1.5, s.eye * 0.4)}
              strokeLinecap="round"
            />
          </>
        );
      case 'sad':
        return (
          <>
            <circle cx={cx - gap} cy={cy} r={r} fill="#2C3E50" />
            <circle cx={cx + gap} cy={cy} r={r} fill="#2C3E50" />
            <circle cx={cx - gap + r * 0.3} cy={cy - r * 0.3} r={r * 0.35} fill="white" />
            <circle cx={cx + gap + r * 0.3} cy={cy - r * 0.3} r={r * 0.35} fill="white" />
            <path
              d={`M${cx - gap - r * 1.2} ${cy - r * 1.5} Q${cx - gap} ${cy - r * 2} ${cx - gap + r * 1.2} ${cy - r * 1.2}`}
              fill="none"
              stroke="#2C3E50"
              strokeWidth={Math.max(1, s.eye * 0.25)}
            />
            <path
              d={`M${cx + gap - r * 1.2} ${cy - r * 1.2} Q${cx + gap} ${cy - r * 2} ${cx + gap + r * 1.2} ${cy - r * 1.5}`}
              fill="none"
              stroke="#2C3E50"
              strokeWidth={Math.max(1, s.eye * 0.25)}
            />
          </>
        );
      case 'thinking':
        return (
          <>
            <circle cx={cx - gap} cy={cy} r={r} fill="#2C3E50" />
            <circle cx={cx + gap} cy={cy - r * 0.5} r={r * 1.2} fill="#2C3E50" />
            <circle cx={cx - gap + r * 0.3} cy={cy - r * 0.3} r={r * 0.35} fill="white" />
            <circle cx={cx + gap + r * 0.4} cy={cy - r * 0.7} r={r * 0.4} fill="white" />
          </>
        );
      case 'worried':
        return (
          <>
            <circle cx={cx - gap} cy={cy} r={r} fill="#2C3E50" />
            <circle cx={cx + gap} cy={cy} r={r} fill="#2C3E50" />
            <circle cx={cx - gap + r * 0.3} cy={cy - r * 0.3} r={r * 0.35} fill="white" />
            <circle cx={cx + gap + r * 0.3} cy={cy - r * 0.3} r={r * 0.35} fill="white" />
            <path
              d={`M${cx - gap - r * 1.2} ${cy - r * 1.3} Q${cx - gap} ${cy - r * 0.8} ${cx - gap + r * 1.2} ${cy - r * 1.3}`}
              fill="none"
              stroke="#2C3E50"
              strokeWidth={Math.max(1, s.eye * 0.25)}
            />
            <path
              d={`M${cx + gap - r * 1.2} ${cy - r * 1.3} Q${cx + gap} ${cy - r * 0.8} ${cx + gap + r * 1.2} ${cy - r * 1.3}`}
              fill="none"
              stroke="#2C3E50"
              strokeWidth={Math.max(1, s.eye * 0.25)}
            />
          </>
        );
      default:
        return (
          <>
            <circle cx={cx - gap} cy={cy} r={r} fill="#2C3E50" />
            <circle cx={cx + gap} cy={cy} r={r} fill="#2C3E50" />
            <circle cx={cx - gap + r * 0.3} cy={cy - r * 0.3} r={r * 0.35} fill="white" />
            <circle cx={cx + gap + r * 0.3} cy={cy - r * 0.3} r={r * 0.35} fill="white" />
          </>
        );
    }
  };

  const renderMouth = () => {
    const cx = s.head / 2;
    const my = s.head * 0.6;

    switch (mood) {
      case 'happy':
        return (
          <path
            d={`M${cx - s.head * 0.15} ${my} Q${cx} ${my + s.head * 0.15} ${cx + s.head * 0.15} ${my}`}
            fill="none"
            stroke={mc.mouthColor}
            strokeWidth={Math.max(1.5, s.eye * 0.35)}
            strokeLinecap="round"
          />
        );
      case 'excited':
        return (
          <ellipse
            cx={cx}
            cy={my + s.head * 0.05}
            rx={s.head * 0.1}
            ry={s.head * 0.08}
            fill={mc.mouthColor}
          />
        );
      case 'sad':
        return (
          <path
            d={`M${cx - s.head * 0.12} ${my + s.head * 0.06} Q${cx} ${my - s.head * 0.04} ${cx + s.head * 0.12} ${my + s.head * 0.06}`}
            fill="none"
            stroke={mc.mouthColor}
            strokeWidth={Math.max(1.5, s.eye * 0.35)}
            strokeLinecap="round"
          />
        );
      case 'thinking':
        return (
          <line
            x1={cx - s.head * 0.08}
            y1={my + s.head * 0.02}
            x2={cx + s.head * 0.08}
            y2={my + s.head * 0.02}
            stroke={mc.mouthColor}
            strokeWidth={Math.max(1.5, s.eye * 0.3)}
            strokeLinecap="round"
          />
        );
      case 'worried':
        return (
          <path
            d={`M${cx - s.head * 0.1} ${my + s.head * 0.08} Q${cx} ${my + s.head * 0.02} ${cx + s.head * 0.1} ${my + s.head * 0.08}`}
            fill="none"
            stroke={mc.mouthColor}
            strokeWidth={Math.max(1.5, s.eye * 0.35)}
            strokeLinecap="round"
          />
        );
      default:
        return (
          <line
            x1={cx - s.head * 0.1}
            y1={my}
            x2={cx + s.head * 0.1}
            y2={my}
            stroke={mc.mouthColor}
            strokeWidth={Math.max(1.5, s.eye * 0.3)}
            strokeLinecap="round"
          />
        );
    }
  };

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div
        className="relative animate-float"
        style={{ width: s.container, height: s.container }}
      >
        <svg
          viewBox={`0 0 ${s.container} ${s.container}`}
          width={s.container}
          height={s.container}
        >
          <g transform={`translate(${(s.container - s.head) / 2}, ${(s.container - s.head) / 2 - s.hat * 0.3})`}>
            <ellipse
              cx={-s.head * 0.38}
              cy={s.head * 0.15}
              rx={s.ear * 0.6}
              ry={s.ear}
              fill="#B0BEC5"
              stroke="#90A4AE"
              strokeWidth={1}
            />
            <ellipse
              cx={s.head + s.head * 0.38}
              cy={s.head * 0.15}
              rx={s.ear * 0.6}
              ry={s.ear}
              fill="#B0BEC5"
              stroke="#90A4AE"
              strokeWidth={1}
            />
            <circle cx={s.head / 2} cy={s.head / 2} r={s.head / 2} fill="#CFD8DC" stroke="#90A4AE" strokeWidth={1.5} />
            <circle
              cx={s.head / 2 - s.head * 0.18}
              cy={s.head * 0.5}
              r={s.head * 0.08}
              fill={mc.cheek}
              opacity={0.6}
            />
            <circle
              cx={s.head / 2 + s.head * 0.18}
              cy={s.head * 0.5}
              r={s.head * 0.08}
              fill={mc.cheek}
              opacity={0.6}
            />
            {renderEyes()}
            {renderMouth()}
            <path
              d={`M${s.head / 2} ${s.head * 0.65} Q${s.head / 2 + s.head * 0.1} ${s.head * 0.85} ${s.head / 2 + s.head * 0.05} ${s.head * 0.95}`}
              fill="none"
              stroke="#90A4AE"
              strokeWidth={Math.max(2, s.head * 0.06)}
              strokeLinecap="round"
            />
            <rect
              x={s.head / 2 - s.hat * 0.5}
              y={-s.hat * 0.2}
              width={s.hat}
              height={s.hat * 0.5}
              rx={2}
              fill="#FF6B35"
            />
            <rect
              x={s.head / 2 - s.hat * 0.7}
              y={s.hat * 0.2}
              width={s.hat * 1.4}
              height={s.hat * 0.25}
              rx={2}
              fill="#E55A2B"
            />
          </g>
        </svg>
      </div>

      {message && showMessage && (
        <div
          className="relative bg-white rounded-xl px-3 py-2 shadow-md border border-gray-100 max-w-[200px] text-center"
          style={{ fontSize: s.fontSize }}
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-white" />
          <p className="text-dark-text leading-snug">{message}</p>
          <button
            onClick={() => setShowMessage(false)}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs hover:bg-gray-300"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
