import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, MapPin, AlertTriangle, CloudRain, Flame, Mountain, Snowflake, Wind, X, Footprints, BookOpen, Package, Heart } from 'lucide-react';
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

const disasterColors: Record<string, string> = {
  // 红色 - 火焰/高温相关
  '火灾': 'from-red-400 to-red-500',
  // 蓝色 - 冰雪/水相关
  '暴雨': 'from-blue-400 to-blue-500',
  '洪水': 'from-blue-400 to-blue-500',
  '暴雪': 'from-blue-400 to-blue-500',
  '雪崩': 'from-blue-400 to-blue-500',
  // 黄色 - 干旱/沙尘相关
  '干旱': 'from-yellow-400 to-yellow-500',
  '沙尘暴': 'from-yellow-400 to-yellow-500',
  // 橙色 - 地质相关
  '地震': 'from-orange-400 to-orange-500',
  '泥石流': 'from-orange-400 to-orange-500',
  // 紫色 - 风相关
  '台风': 'from-purple-400 to-purple-500',
};

const disasterDetails: Record<string, { what: string; when: string; how: string }> = {
  '地震': {
    what: '地震是地球内部能量释放引起的地面震动，是一种破坏性极强的自然灾害。',
    when: '地震通常发生在板块交界处，无法精确预测，但会有一些前兆现象。',
    how: '1. 迅速躲到桌子、床下等坚固家具旁；2. 远离窗户和玻璃制品；3. 保持冷静，等待震动停止后有序撤离。'
  },
  '台风': {
    what: '台风是发生在热带或副热带洋面上的强烈气旋，伴随强风、暴雨和风暴潮。',
    when: '台风多发生在夏季和秋季，我国东南沿海地区是主要受影响区域。',
    how: '1. 密切关注天气预报；2. 准备应急物资；3. 关好门窗，加固易吹落物品；4. 低洼地区居民做好转移准备。'
  },
  '暴雨': {
    what: '暴雨是短时间内降雨量极大的降水现象，容易引发城市内涝和山洪灾害。',
    when: '暴雨多发生在夏季，尤其是梅雨季节和台风影响期间。',
    how: '1. 避免在低洼处停留；2. 远离河道和排水口；3. 地下空间人员及时转移；4. 减少外出，注意防雷。'
  },
  '洪水': {
    what: '洪水是江河水量猛增导致水位上涨、淹没陆地的现象，破坏力巨大。',
    when: '洪水多发生在雨季和融雪期，河流中下游地区风险较高。',
    how: '1. 及时转移到高处；2. 准备救生设备；3. 切断电源和煤气；4. 不要强行涉水过河。'
  },
  '火灾': {
    what: '火灾是在时间和空间上失去控制的燃烧现象，可分为森林火灾、建筑火灾等。',
    when: '火灾在干燥季节和用电高峰期更容易发生。',
    how: '1. 立即拨打火警电话；2. 用湿毛巾捂住口鼻；3. 低姿逃生，不要乘坐电梯；4. 如果被困，发出求救信号。'
  },
  '泥石流': {
    what: '泥石流是山区暴雨或融雪引发的携带大量泥沙石块的特殊洪流。',
    when: '泥石流多发生在山区暴雨后，尤其是植被稀疏的陡坡地区。',
    how: '1. 迅速向泥石流两侧的高处转移；2. 不要在沟谷中停留；3. 避开河道和桥梁；4. 关注地质灾害预警信息。'
  },
  '沙尘暴': {
    what: '沙尘暴是强风将地面沙尘卷起形成的灾害性天气，影响能见度和空气质量。',
    when: '沙尘暴多发生在干旱和半干旱地区的春季。',
    how: '1. 减少外出，关闭门窗；2. 佩戴口罩和眼镜；3. 做好防风加固；4. 注意交通安全。'
  },
  '暴雪': {
    what: '暴雪是大量降雪导致积雪过厚的现象，影响交通和电力供应。',
    when: '暴雪多发生在冬季，北方地区较为常见。',
    how: '1. 减少外出，注意保暖；2. 做好道路防滑；3. 储备生活物资；4. 及时清理屋顶积雪。'
  },
  '干旱': {
    what: '干旱是长期降水不足导致水资源短缺的现象，影响农业和生态。',
    when: '干旱多发生在降水较少的地区，可持续数月甚至数年。',
    how: '1. 节约用水，提高水资源利用效率；2. 种植耐旱作物；3. 加强水资源管理和调配；4. 做好森林防火。'
  },
  '雪崩': {
    what: '雪崩是山坡上的积雪突然崩塌下滑的现象，对山区居民和登山者构成威胁。',
    when: '雪崩多发生在积雪较厚的山区，春季气温升高时风险增加。',
    how: '1. 避免在不稳定的雪坡附近活动；2. 佩戴雪崩安全装备；3. 了解雪崩预警信息；4. 掌握自救知识。'
  },
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
  const [selectedDisaster, setSelectedDisaster] = useState<string | null>(null);

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

  const handleDisasterClick = (disaster: string) => {
    setSelectedDisaster(disaster);
  };

  const handleCloseModal = () => {
    setSelectedDisaster(null);
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
                    const color = disasterColors[disaster] || 'from-gray-400 to-gray-500';
                    return (
                      <motion.button
                        key={disaster}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.08 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDisasterClick(disaster)}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:shadow-md hover:border-brand-orange/30 transition-all"
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                          <Icon size={24} className="text-white" />
                        </div>
                        <span className="text-sm font-medium text-dark-text">{disaster}</span>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="mt-6 p-4 bg-brand-orange/5 rounded-2xl border border-brand-orange/10">
                  <div className="flex items-start gap-2">
                    <ElephantMascot mood="thinking" size="sm" />
                    <p className="text-sm text-dark-text/70 leading-relaxed">
                      {selectedProvince}地区常见的灾害包括{provinceData.commonDisasters.join('、')}。
                      点击灾害图标可查看详细信息，小象会根据这些风险为你定制专属的安全学习内容！
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

        {/* 快速入口区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl mt-6"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={20} className="text-brand-orange" />
              <span className="font-title text-lg text-dark-text">快速入口</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { title: '逃生演练', icon: Footprints, path: '/escape', color: 'bg-red-500' },
                { title: '安全问答', icon: BookOpen, path: '/quiz', color: 'bg-blue-500' },
                { title: '物资储备', icon: Package, path: '/supplies', color: 'bg-green-500' },
                { title: '家庭规划', icon: Heart, path: '/home-plan', color: 'bg-purple-500' },
              ].map((item, idx) => (
                <motion.button
                  key={item.path}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center`}>
                    <item.icon size={20} className="text-white" />
                  </div>
                  <span className="text-xs font-medium text-dark-text">{item.title}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

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

        <AnimatePresence>
          {selectedDisaster && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={handleCloseModal}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 relative"
              >
                <button
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-dark-text/50 hover:text-dark-text transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-5">
                  {(() => {
                    const Icon = disasterIcons[selectedDisaster] || AlertTriangle;
                    return (
                      <>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center">
                          <Icon size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-title text-xl text-dark-text">{selectedDisaster}</h3>
                          <p className="text-sm text-dark-text/50">常见自然灾害</p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-brand-orange mb-2 flex items-center gap-2">
                      <AlertTriangle size={16} />
                      什么是{selectedDisaster}
                    </h4>
                    <p className="text-sm text-dark-text/70 leading-relaxed">
                      {disasterDetails[selectedDisaster]?.what || '暂无详细信息'}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-blue-500 mb-2 flex items-center gap-2">
                      <CloudRain size={16} />
                      一般在什么情况下发生
                    </h4>
                    <p className="text-sm text-dark-text/70 leading-relaxed">
                      {disasterDetails[selectedDisaster]?.when || '暂无详细信息'}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-green-500 mb-2 flex items-center gap-2">
                      <Flame size={16} />
                      该如何应对
                    </h4>
                    <p className="text-sm text-dark-text/70 leading-relaxed">
                      {disasterDetails[selectedDisaster]?.how || '暂无详细信息'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCloseModal}
                  className="mt-6 w-full py-3 bg-brand-orange/10 hover:bg-brand-orange/20 text-brand-orange font-medium rounded-xl transition-colors"
                >
                  我知道了
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
