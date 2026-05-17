import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, MapPin, AlertTriangle, CloudRain, Flame, Mountain, Snowflake, Wind } from 'lucide-react';
import ElephantMascot from '@/components/ElephantMascot';
import ChinaMap from '@/components/ChinaMap';
import { useAppStore } from '@/stores/appStore';
import { provinces } from '@/data/provinces';
import { setProvince as saveProvince } from '@/services/storageService';

const disasterIcons: Record<string, typeof Flame> = {
  '地震': Mountain,
  '台风': Wind,
  '暴雨': CloudRain,
  '洪水': CloudRain,
  '火灾': Flame,
  '泥石流': Mountain,
  '沙尘暴': Wind,
  '暴雪': Snowflake,
  '干旱': AlertTriangle,
  '雪崩': Snowflake,
};

const riskLabels: Record<string, { text: string; color: string; bg: string }> = {
  'very-high': { text: '极高风险', color: 'text-red-600', bg: 'bg-red-100' },
  'high': { text: '高风险', color: 'text-orange-600', bg: 'bg-orange-100' },
  'medium': { text: '中等风险', color: 'text-amber-600', bg: 'bg-amber-100' },
  'low': { text: '低风险', color: 'text-green-600', bg: 'bg-green-100' },
};

export default function Home() {
  const navigate = useNavigate();
  const { setProvince } = useAppStore();
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  const provinceData = provinces.find((p) => p.name === selectedProvince);
  const risk = provinceData ? riskLabels[provinceData.riskLevel] : null;

  const handleSelectProvince = (name: string) => {
    setSelectedProvince(name);
  };

  const handleConfirm = () => {
    if (!selectedProvince) return;
    setProvince(selectedProvince);
    saveProvince(selectedProvince);
    navigate('/modules');
  };

  const handleBack = () => {
    setSelectedProvince(null);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#E8F4FD] via-[#FFF8F0] to-[#FEECD2] overflow-auto">
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 opacity-75">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <ElephantMascot mood={selectedProvince ? 'thinking' : 'happy'} size="lg" />
          <h1 className="font-title text-4xl md:text-5xl text-brand-orange mt-4">
            安全小象
          </h1>
          <p className="text-dark-text/60 text-lg mt-2">
            {selectedProvince
              ? `${selectedProvince}的常见自然灾害`
              : '点击地图选择你所在的省份，开始安全之旅'}
          </p>
        </motion.div>

        <div className="w-full max-w-3xl">
          <AnimatePresence mode="wait">
            {selectedProvince && provinceData ? (
              <motion.div
                key={`disaster-${selectedProvince}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 md:p-8"
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="font-title text-2xl md:text-3xl text-dark-text">
                      {selectedProvince}
                    </h2>
                    <p className="text-dark-text/50 text-sm mt-1">常见自然灾害风险</p>
                  </div>
                  {risk && (
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${risk.color} ${risk.bg}`}>
                      {risk.text}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {provinceData.commonDisasters.map((disaster, idx) => {
                    const Icon = disasterIcons[disaster] || AlertTriangle;
                    const colors = [
                      'from-red-400 to-red-500',
                      'from-orange-400 to-amber-500',
                      'from-blue-400 to-blue-500',
                      'from-amber-400 to-yellow-500',
                      'from-purple-400 to-purple-500',
                      'from-teal-400 to-emerald-500',
                    ];
                    return (
                      <motion.div
                        key={disaster}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.08 }}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center gap-2"
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[idx % colors.length]} flex items-center justify-center`}>
                          <Icon size={24} className="text-white" />
                        </div>
                        <span className="text-sm font-medium text-dark-text">{disaster}</span>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-6 p-4 bg-brand-orange/5 rounded-2xl border border-brand-orange/10">
                  <div className="flex items-start gap-2">
                    <ElephantMascot mood="thinking" size="sm" />
                    <p className="text-sm text-dark-text/70 leading-relaxed">
                      {selectedProvince}地区常见的灾害包括{provinceData.commonDisasters.join('、')}。
                      小象会根据这些风险为你定制专属的安全学习内容！
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleBack}
                  className="mt-5 flex items-center gap-1.5 text-dark-text/50 hover:text-dark-text/80 text-sm transition-colors"
                >
                  <ArrowLeft size={16} />
                  <span>重新选择省份</span>
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="map"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-4 md:p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={20} className="text-brand-orange" />
                  <span className="font-title text-lg text-dark-text">选择你的省份</span>
                </div>

                <ChinaMap
                  selectedProvince={selectedProvince}
                  onSelect={handleSelectProvince}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {selectedProvince && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-6 right-6 z-50"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConfirm}
                className="flex items-center gap-2 px-6 py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-title text-lg rounded-2xl shadow-lg shadow-blue-500/30 transition-colors"
              >
                开始学习
                <ArrowRight size={20} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
