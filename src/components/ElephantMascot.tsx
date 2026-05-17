interface ElephantMascotProps {
  mood?: 'happy' | 'sad' | 'thinking' | 'excited' | 'worried' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

const sizeMap = {
  sm: { container: 60, fontSize: 12 },
  md: { container: 100, fontSize: 14 },
  lg: { container: 140, fontSize: 16 },
};

export default function ElephantMascot({
  mood = 'neutral',
  size = 'md',
  message,
}: ElephantMascotProps) {
  const s = sizeMap[size];

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div
        className="relative animate-float"
        style={{ width: s.container, height: s.container }}
      >
        <img
          src="/elephant-mascot.jpg"
          alt="安全小象"
          className="w-full h-full object-contain"
        />
      </div>

      {message && (
        <div
          className="relative bg-white rounded-xl px-3 py-2 shadow-md border border-gray-100 max-w-[200px] text-center"
          style={{ fontSize: s.fontSize }}
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-white" />
          <p className="text-dark-text leading-snug">{message}</p>
        </div>
      )}
    </div>
  );
}
