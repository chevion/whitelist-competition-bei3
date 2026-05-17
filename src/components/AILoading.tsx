import ElephantMascot from './ElephantMascot';

interface AILoadingProps {
  text?: string;
}

const defaultTexts = [
  '小象正在思考中...',
  '正在为你生成安全建议...',
  '小象正在查阅安全知识...',
  '正在分析你的情况...',
];

export default function AILoading({ text }: AILoadingProps) {
  const displayText = text || defaultTexts[Math.floor(Math.random() * defaultTexts.length)];

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <ElephantMascot mood="thinking" size="lg" />
      <div className="text-center">
        <p className="text-dark-text/80 font-medium">{displayText}</p>
        <div className="flex items-center justify-center gap-1 mt-2">
          <span className="w-2 h-2 rounded-full bg-brand-orange animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-brand-orange animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-brand-orange animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
