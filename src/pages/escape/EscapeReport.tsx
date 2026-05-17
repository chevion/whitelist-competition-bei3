import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, RotateCcw, AlertTriangle, Clock, Heart, MapPin, Package, AlertCircle } from 'lucide-react';
import ElephantMascot from '@/components/ElephantMascot';
import AILoading from '@/components/AILoading';
import { useGameStore } from '@/stores/gameStore';
import { generateEscapeReview } from '@/services/aiService';

export default function EscapeReport() {
  const {
    health,
    errors,
    collectedItems,
    path,
    isComplete,
    currentMap,
    timeRemaining,
  } = useGameStore();

  const [aiReport, setAiReport] = useState<string>('');
  const [aiRating, setAiRating] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiKnowledge, setAiKnowledge] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiError, setAiError] = useState(false);

  const timeUsed = 120 - timeRemaining;
  const pathLength = path.length;
  const errorCount = errors.length;
  const itemsCollected = collectedItems.length;

  const getMood = (): 'happy' | 'excited' | 'sad' | 'worried' | 'neutral' => {
    if (!isComplete) return 'sad';
    if (errorCount === 0 && health >= 80) return 'excited';
    if (health >= 50) return 'happy';
    if (health >= 30) return 'worried';
    return 'sad';
  };

  const getRating = (): string => {
    if (!isComplete) return '需改进';
    if (errorCount === 0 && health >= 80) return '优秀';
    if (health >= 50 && errorCount <= 3) return '良好';
    if (health >= 30) return '及格';
    return '需改进';
  };

  const getRatingColor = () => {
    const r = getRating();
    if (r === '优秀') return 'text-safety-green';
    if (r === '良好') return 'text-brand-orange';
    if (r === '及格') return 'text-amber-500';
    return 'text-danger-red';
  };

  const getElephantComment = (): string => {
    if (!isComplete) return '这次没能逃出来，没关系，我们再试一次！';
    if (errorCount === 0 && health >= 80) return '太厉害了！你简直是逃生小达人！';
    if (health >= 50) return '做得不错！继续加油，下次可以更好！';
    if (health >= 30) return '成功逃出来了，但要注意安全哦！';
    return '虽然逃出来了，但受伤有点多，下次要更小心！';
  };

  useEffect(() => {
    setLoading(true);
    setAiError(false);
    generateEscapeReview({
      errors,
      collectedItems,
      timeUsed,
      health,
    })
      .then((res) => {
        if (res.parsedJSON) {
          const data = res.parsedJSON;
          if (data.rating) setAiRating(data.rating as string);
          if (Array.isArray(data.suggestions)) setAiSuggestions(data.suggestions as string[]);
          if (data.knowledgeSupplement) setAiKnowledge(data.knowledgeSupplement as string);
          setAiReport(res.content);
        } else if (res.content && !res.content.includes('请先在设置中配置')) {
          setAiReport(res.content);
        } else {
          setAiError(true);
        }
      })
      .catch(() => setAiError(true))
      .finally(() => setLoading(false));
  }, [errors, collectedItems, timeUsed, health]);

  const stats = [
    { icon: Clock, label: '用时', value: `${timeUsed}秒`, color: 'text-brand-orange' },
    { icon: Heart, label: '剩余生命', value: `${health}/100`, color: health > 50 ? 'text-safety-green' : 'text-danger-red' },
    { icon: MapPin, label: '移动步数', value: `${pathLength}步`, color: 'text-blue-500' },
    { icon: Package, label: '收集物品', value: `${itemsCollected}件`, color: 'text-amber-500' },
    { icon: AlertCircle, label: '犯错次数', value: `${errorCount}次`, color: errorCount > 0 ? 'text-danger-red' : 'text-safety-green' },
  ];

  return (
    <div className="max-w-2xl mx-auto pb-20 md:pb-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <ElephantMascot mood={getMood()} size="lg" message={getElephantComment()} />
        <h2 className="font-title text-2xl text-brand-orange mt-3">逃生演练复盘</h2>
        {currentMap && (
          <p className="text-dark-text/50 text-sm mt-1">
            {currentMap.name} · {currentMap.disasterType}场景
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-title text-lg text-dark-text">总体评价</h3>
          <span className={`font-title text-2xl ${getRatingColor()}`}>{aiRating || getRating()}</span>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-gray-50 flex items-center justify-center mb-1.5">
                  <Icon size={18} className={stat.color} />
                </div>
                <p className="text-xs text-dark-text/50">{stat.label}</p>
                <p className={`text-sm font-medium ${stat.color}`}>{stat.value}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-red-50 rounded-2xl p-5 border border-red-100 mb-4"
        >
          <h3 className="font-medium text-danger-red mb-3 flex items-center gap-2">
            <AlertCircle size={18} />
            错误回顾
          </h3>
          <ul className="space-y-2">
            {errors.map((err, i) => (
              <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-danger-red/20 text-danger-red text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {err}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {collectedItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-amber-50 rounded-2xl p-5 border border-amber-100 mb-4"
        >
          <h3 className="font-medium text-amber-700 mb-3 flex items-center gap-2">
            <Package size={18} />
            收集的物品
          </h3>
          <div className="flex flex-wrap gap-2">
            {collectedItems.map((item, i) => (
              <span key={i} className="px-3 py-1.5 bg-white rounded-lg text-sm text-amber-700 border border-amber-200">
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-5 shadow-sm border-2 border-dashed border-brand-orange/30 mb-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <ElephantMascot mood="thinking" size="sm" />
          <h3 className="font-title text-lg text-brand-orange">小象的复盘分析</h3>
        </div>

        {loading ? (
          <AILoading text="小象正在分析你的表现..." />
        ) : aiError ? (
          <p className="text-dark-text/50 text-sm">AI生成失败，请根据上方数据自行复盘</p>
        ) : (
          <div className="space-y-4">
            {aiSuggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-dark-text mb-2">改进建议</h4>
                <ul className="space-y-2">
                  {aiSuggestions.map((s, i) => (
                    <li key={i} className="text-sm text-dark-text/80 flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-brand-orange/10 text-brand-orange text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {aiKnowledge && (
              <div>
                <h4 className="text-sm font-medium text-dark-text mb-2">安全知识补充</h4>
                <p className="text-sm text-dark-text/80 leading-relaxed whitespace-pre-wrap">{aiKnowledge}</p>
              </div>
            )}

            {aiReport && !aiSuggestions.length && !aiKnowledge && (
              <p className="text-sm text-dark-text/80 leading-relaxed whitespace-pre-wrap">{aiReport}</p>
            )}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200 mb-6"
      >
        <div className="flex items-start gap-2">
          <AlertTriangle size={18} className="text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-700 text-sm mb-1">批判性思维提示</h4>
            <p className="text-sm text-yellow-700/80 leading-relaxed">
              你是否发现某个障碍物位置不现实？AI生成的内容可能需要人工优化。
              在实际逃生中，请以官方应急指南为准，AI建议仅供参考。
              鼓励你在AI生成内容的基础上进行思考和改进！
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex gap-3"
      >
        <Link
          to="/escape"
          className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-dark-text/70 font-medium hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw size={18} />
          再来一次
        </Link>
        <Link
          to="/"
          className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-brand-orange to-orange-400 text-white font-medium shadow-lg shadow-brand-orange/30 hover:shadow-xl hover:shadow-brand-orange/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Home size={18} />
          返回首页
        </Link>
      </motion.div>
    </div>
  );
}
