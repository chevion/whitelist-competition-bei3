import { Link } from 'react-router-dom';
import { Footprints, BookOpen, Package, MapPin, Heart, MapPinned } from 'lucide-react';
import { motion } from 'framer-motion';
import ElephantMascot from '@/components/ElephantMascot';
import { useAppStore } from '@/stores/appStore';
import { provinces } from '@/data/provinces';

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
    title: '医疗急救卡',
    desc: '生成个人医疗急救信息卡',
    icon: Heart,
    path: '/home-plan/medical-card',
    gradient: 'from-pink-400 to-rose-400',
  },
];

export default function Modules() {
  const { province } = useAppStore();
  const provinceData = provinces.find((p) => p.name === province);

  return (
    <div className="flex flex-col items-center gap-8 pb-20 md:pb-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center flex flex-col items-center gap-3"
      >
        <ElephantMascot mood="happy" size="lg" message={`欢迎来到安全小象！让我来保护你的安全吧！`} />
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
    </div>
  );
}
