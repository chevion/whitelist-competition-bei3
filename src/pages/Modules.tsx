import { Link } from 'react-router-dom';
import { Footprints, BookOpen, Package, MapPin, Heart, MapPinned, Phone, Siren, Lightbulb, Gamepad2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ElephantMascot from '@/components/ElephantMascot';
import EmergencyCall from '@/components/EmergencyCall';
import { useAppStore } from '@/stores/appStore';
import { provinces } from '@/data/provinces';
import { useState } from 'react';

const modules = [
  {
    title: '逃生演练',
    desc: '模拟真实灾害场景，学习正确逃生方法',
    icon: Footprints,
    path: '/escape',
    gradient: 'from-red-400 to-orange-400',
  },
  {
    title: '安全问答',
    desc: '趣味安全知识问答，检验你的安全意识',
    icon: BookOpen,
    path: '/quiz',
    gradient: 'from-orange-400 to-amber-400',
  },
  {
    title: '物资储备',
    desc: '智能推荐家庭应急物资清单',
    icon: Package,
    path: '/supplies',
    gradient: 'from-emerald-400 to-teal-400',
  },
  {
    title: '家庭规划',
    desc: '制定家庭逃生路线和应急预案',
    icon: MapPin,
    path: '/home-plan',
    gradient: 'from-blue-400 to-indigo-400',
  },
  {
    title: '灾害游戏',
    desc: '趣味灾害逃生小游戏，边玩边学',
    icon: Gamepad2,
    path: '/games',
    gradient: 'from-purple-400 to-pink-400',
  },
  {
    title: '医疗急救卡',
    desc: '生成个人医疗急救信息卡',
    icon: Heart,
    path: '/home-plan/medical-card',
    gradient: 'from-pink-400 to-rose-400',
  },
  {
    title: '灾害识别',
    desc: '根据自然现象自动识别可能的灾害',
    icon: Lightbulb,
    path: '/disaster-recognition',
    gradient: 'from-cyan-400 to-blue-400',
  },
];

export default function Modules() {
  const { province } = useAppStore();
  const [showEmergencyCall, setShowEmergencyCall] = useState(false);
  const provinceData = provinces.find((p) => p.name === province);

  return (
    <div className="flex flex-col items-center gap-8 pb-20 md:pb-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center flex flex-col items-center gap-3"
      >
        <ElephantMascot mood="happy" size="lg" message={`我是安全小象！让我来保护你的安全吧！`} />
        <h1 className="font-title text-3xl md:text-4xl text-brand-orange">选择学习模块</h1>
        {province && (
          <div className="flex items-center gap-2 text-dark-text/60">
            <MapPinned size={16} />
            <span className="text-sm">当前地区：{province}</span>
            {provinceData && (
              <span className="text-xs text-dark-text/40">
                · {provinceData.commonDisasters.join('、')}
              </span>
            )}
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
        {modules.map((mod, idx) => {
          const Icon = mod.icon;
          return (
            <motion.div
              key={mod.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
            >
              <Link
                to={mod.path}
                className="block no-underline group"
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className={`bg-gradient-to-r ${mod.gradient} p-4 flex items-center justify-center`}>
                    <Icon size={32} className="text-white" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-dark-text text-base group-hover:text-brand-orange transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-dark-text/50 text-sm mt-1">{mod.desc}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-4xl"
      >
        <div className="relative bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-5 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Siren size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-title text-xl mb-1">一键报警</h3>
              <p className="text-white/80 text-sm">紧急情况，快速拨打110/120/119</p>
            </div>
            <button
              onClick={() => setShowEmergencyCall(true)}
              className="flex items-center gap-2 px-5 py-3 bg-white text-red-500 font-bold rounded-xl hover:bg-white/90 transition-colors"
            >
              <Phone size={20} />
              立即报警
            </button>
          </div>
        </div>
      </motion.div>

      <EmergencyCall isOpen={showEmergencyCall} onClose={() => setShowEmergencyCall(false)} />
    </div>
  );
}
