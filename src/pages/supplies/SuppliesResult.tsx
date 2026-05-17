import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Droplets,
  UtensilsCrossed,
  HeartPulse,
  Wrench,
  FileText,
  Shirt,
  Sparkles,
  Download,
  ArrowLeft,
  CircleDot,
} from 'lucide-react';
import ElephantMascot from '@/components/ElephantMascot';
import AILoading from '@/components/AILoading';
import { getFamilyInfo, getCalculatedSupplies } from '@/services/storageService';
import { generateSuppliesList, generateSuppliesPlan } from '@/services/aiService';
import { exportAsImage } from '@/utils/exportImage';
import type { CalculatedSupply } from '@/types';

type CategoryType = CalculatedSupply['category'];

const categoryConfig: Record<CategoryType, { icon: typeof Droplets; gradient: string; bg: string; text: string }> = {
  饮水: { icon: Droplets, gradient: 'from-blue-400 to-blue-500', bg: 'bg-blue-50', text: 'text-blue-500' },
  食品: { icon: UtensilsCrossed, gradient: 'from-amber-400 to-orange-400', bg: 'bg-amber-50', text: 'text-amber-500' },
  医疗: { icon: HeartPulse, gradient: 'from-rose-400 to-red-400', bg: 'bg-rose-50', text: 'text-rose-500' },
  工具: { icon: Wrench, gradient: 'from-slate-400 to-slate-500', bg: 'bg-slate-50', text: 'text-slate-500' },
  文档: { icon: FileText, gradient: 'from-indigo-400 to-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-500' },
  衣物: { icon: Shirt, gradient: 'from-purple-400 to-purple-500', bg: 'bg-purple-50', text: 'text-purple-500' },
  卫生: { icon: Sparkles, gradient: 'from-teal-400 to-emerald-400', bg: 'bg-teal-50', text: 'text-teal-500' },
};

const categoryOrder: CategoryType[] = ['饮水', '食品', '医疗', '工具', '文档', '衣物', '卫生'];

export default function SuppliesResult() {
  const navigate = useNavigate();

  const [supplies, setSupplies] = useState<CalculatedSupply[]>([]);
  const [aiListText, setAiListText] = useState<string>('');
  const [aiPlanText, setAiPlanText] = useState<string>('');
  const [loadingList, setLoadingList] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [listError, setListError] = useState(false);
  const [planError, setPlanError] = useState(false);

  const familyInfo = useMemo(() => getFamilyInfo(), []);

  useEffect(() => {
    const stored = getCalculatedSupplies();
    if (stored) {
      setSupplies(stored);
    } else {
      navigate('/supplies');
    }
  }, [navigate]);

  const groupedSupplies = useMemo(() => {
    const groups: Record<CategoryType, CalculatedSupply[]> = {} as Record<CategoryType, CalculatedSupply[]>;
    for (const cat of categoryOrder) {
      groups[cat] = [];
    }
    for (const item of supplies) {
      groups[item.category].push(item);
    }
    return Object.entries(groups).filter(([, items]) => items.length > 0) as [CategoryType, CalculatedSupply[]][];
  }, [supplies]);

  useEffect(() => {
    if (!familyInfo || supplies.length === 0) return;

    const disasters = familyInfo.disasters.join('、');
    const categories = [...new Set(supplies.map((s) => s.category))];

    setLoadingList(true);
    setListError(false);
    generateSuppliesList({ category: categories.join('、'), disaster: disasters })
      .then((res) => {
        if (res.content && !res.content.includes('请先在设置中配置')) {
          setAiListText(res.content);
        } else {
          setListError(true);
        }
      })
      .catch(() => setListError(true))
      .finally(() => setLoadingList(false));

    setLoadingPlan(true);
    setPlanError(false);
    const supplyNames = supplies.map((s) => `${s.name}(${s.quantity}${s.unit})`);
    generateSuppliesPlan(familyInfo, supplyNames)
      .then((res) => {
        if (res.content && !res.content.includes('请先在设置中配置')) {
          setAiPlanText(res.content);
        } else {
          setPlanError(true);
        }
      })
      .catch(() => setPlanError(true))
      .finally(() => setLoadingPlan(false));
  }, [familyInfo, supplies]);

  const handleExport = () => {
    exportAsImage('supplies-result', '我的应急物资清单');
  };

  if (supplies.length === 0) return null;

  return (
    <div className="max-w-2xl mx-auto pb-24 md:pb-6">
      <div id="supplies-result">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <ElephantMascot mood="happy" size="md" />
          <h2 className="font-title text-2xl text-brand-orange mt-3">你的安全管家小象为你定制</h2>
          <p className="text-dark-text/50 text-sm mt-1">
            {familyInfo
              ? `${familyInfo.totalPeople}人家庭 · ${familyInfo.disasters.join('、')}防范`
              : ''}
          </p>
        </motion.div>

        {/* 物资分类卡片 */}
        <div className="space-y-4 mb-8">
          {groupedSupplies.map(([category, items], catIdx) => {
            const config = categoryConfig[category];
            const Icon = config.icon;
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIdx * 0.08 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
              >
                <div className={`bg-gradient-to-r ${config.gradient} px-5 py-3 flex items-center gap-2`}>
                  <Icon size={18} className="text-white" />
                  <h3 className="font-title text-white text-base">{category}</h3>
                  <span className="ml-auto text-white/80 text-xs">{items.length}项</span>
                </div>
                <div className="p-4">
                  <ul className="space-y-2.5">
                    {items.map((item) => (
                      <li key={item.name} className="flex items-start gap-3">
                        <CircleDot size={14} className={`mt-1 shrink-0 ${config.text}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-dark-text text-sm font-medium">{item.name}</span>
                            <span className={`text-sm font-medium ${config.text} shrink-0`}>
                              {item.quantity}{item.unit}
                            </span>
                          </div>
                          {item.note && (
                            <p className="text-dark-text/40 text-xs mt-0.5">{item.note}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* AI温馨清单 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <div className="bg-white rounded-2xl p-5 shadow-sm border-2 border-dashed border-brand-orange/30">
            <div className="flex items-center gap-2 mb-3">
              <ElephantMascot mood="happy" size="sm" />
              <h3 className="font-title text-lg text-brand-orange">小象的温馨清单</h3>
            </div>
            {loadingList ? (
              <AILoading text="小象正在整理温馨清单..." />
            ) : listError ? (
              <p className="text-dark-text/50 text-sm">AI生成失败，请查看上方基础清单</p>
            ) : aiListText ? (
              <div className="text-dark-text/80 text-sm leading-relaxed whitespace-pre-wrap">
                {aiListText}
              </div>
            ) : null}
          </div>
        </motion.div>

        {/* AI四周计划 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6"
        >
          <div className="bg-white rounded-2xl p-5 shadow-sm border-2 border-dashed border-safety-green/30">
            <div className="flex items-center gap-2 mb-3">
              <ElephantMascot mood="thinking" size="sm" />
              <h3 className="font-title text-lg text-safety-green">四周准备计划</h3>
            </div>
            {loadingPlan ? (
              <AILoading text="小象正在制定准备计划..." />
            ) : planError ? (
              <p className="text-dark-text/50 text-sm">AI生成失败，请查看上方基础清单</p>
            ) : aiPlanText ? (
              <div className="space-y-4">
                {aiPlanText.split(/第[一二三四]周/).filter(Boolean).map((weekContent, idx) => {
                  const weekLabels = ['第一周', '第二周', '第三周', '第四周'];
                  const weekColors = [
                    'bg-brand-orange',
                    'bg-amber-400',
                    'bg-safety-green',
                    'bg-blue-400',
                  ];
                  return (
                    <div key={idx} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full ${weekColors[idx]} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                          {idx + 1}
                        </div>
                        {idx < 3 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-dark-text text-sm mb-1">{weekLabels[idx]}</p>
                        <p className="text-dark-text/70 text-sm leading-relaxed whitespace-pre-wrap">
                          {weekContent.trim()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>

      {/* 底部按钮 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex gap-3"
      >
        <button
          onClick={() => navigate('/supplies')}
          className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-dark-text/70 font-medium hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft size={18} />
          返回修改
        </button>
        <button
          onClick={handleExport}
          className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-brand-orange to-orange-400 text-white font-medium shadow-lg shadow-brand-orange/30 hover:shadow-xl hover:shadow-brand-orange/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Download size={18} />
          导出图片
        </button>
      </motion.div>
    </div>
  );
}
