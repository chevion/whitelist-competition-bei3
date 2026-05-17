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
import { getFamilyInfo, getCalculatedSupplies } from '@/services/storageService';
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

        {/* 温馨提示 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <div className="bg-gradient-to-r from-brand-orange/5 to-amber-50 rounded-2xl p-5 border border-brand-orange/20">
            <div className="flex items-center gap-2 mb-3">
              <ElephantMascot mood="thinking" size="sm" />
              <h3 className="font-title text-lg text-brand-orange">小象温馨提示</h3>
            </div>
            <ul className="text-dark-text/70 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-brand-orange">*</span>
                <span>定期检查物资有效期，建议每3个月更新一次</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-orange">*</span>
                <span>将应急包放在显眼且易于拿取的位置</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-orange">*</span>
                <span>确保每位家庭成员都知道应急包的位置</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-orange">*</span>
                <span>根据家庭情况和所在地区灾害特点调整物资清单</span>
              </li>
            </ul>
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
