import { Link } from 'react-router-dom';
import { Footprints, BookOpen, Package, MapPin, Heart, MapPinned } from 'lucide-react';
import { motion } from 'framer-motion';
import ElephantMascot from '@/components/ElephantMascot';
import { useAppStore } from '@/stores/appStore';
import { provinces } from '@/data/provinces';
import { setProvince as saveProvince } from '@/services/storageService';

const modules = [
  {
    title: '逃生演练',
    desc: '模拟真实灾害场景，学习正确逃生方法',
    icon: Footprints,
    path: '/escape',
    color: 'bg-danger-red',
    gradient: 'from-red-400 to-orange-400',
  },
  {
    title: '安全问答',
    desc: '趣味安全知识问答，检验你的安全意识',
    icon: BookOpen,
    path: '/quiz',
    color: 'bg-brand-orange',
    gradient: 'from-orange-400 to-amber-400',
  },
  {
    title: '物资储备',
    desc: '智能推荐家庭应急物资清单',
    icon: Package,
    path: '/supplies',
    color: 'bg-safety-green',
    gradient: 'from-emerald-400 to-teal-400',
  },
  {
    title: '家庭规划',
    desc: '制定家庭逃生路线和应急预案',
    icon: MapPin,
    path: '/home-plan',
    color: 'bg-blue-500',
    gradient: 'from-blue-400 to-indigo-400',
  },
  {
    title: '医疗急救卡',
    desc: '生成个人医疗急救信息卡',
    icon: Heart,
    path: '/home-plan/medical-card',
    color: 'bg-pink-500',
    gradient: 'from-pink-400 to-rose-400',
  },
];

export default function Home() {
  const { province, setProvince } = useAppStore();

  const handleProvinceChange = (name: string) => {
    setProvince(name);
    saveProvince(name);
  };

  const provinceData = provinces.find((p) => p.name === province);

  return (
    <div className="flex flex-col items-center gap-8 pb-20 md:pb-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center flex flex-col items-center gap-3"
      >
        <ElephantMascot mood="happy" size="lg" message="欢迎来到安全小象！让我来保护你的安全吧！" />
        <h1 className="font-title text-3xl md:text-4xl text-brand-orange">安全小象</h1>
        <p className="text-dark-text/70 text-lg">安全教育互动平台</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <MapPinned size={18} className="text-brand-orange" />
            <span className="text-sm font-medium text-dark-text">选择你所在的省份</span>
          </div>
          <select
            value={province}
            onChange={(e) => handleProvinceChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-warm-white text-dark-text outline-none focus:border-brand-orange transition-colors"
          >
            <option value="">请选择省份</option>
            {provinces.map((p) => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
          {provinceData && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {provinceData.commonDisasters.map((d) => (
                <span
                  key={d}
                  className="inline-block px-2 py-0.5 rounded-full bg-danger-red/10 text-danger-red text-xs font-medium"
                >
                  {d}
                </span>
              ))}
              <span className="inline-block px-2 py-0.5 rounded-full bg-dark-text/5 text-dark-text/50 text-xs">
                常见灾害
              </span>
            </div>
          )}
          {!province && (
            <p className="text-xs text-dark-text/40 mt-2">选择省份后，内容将根据当地灾害风险个性化推荐</p>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
        {modules.map((mod, idx) => {
          const Icon = mod.icon;
          return (
            <motion.div
              key={mod.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.05 }}
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
