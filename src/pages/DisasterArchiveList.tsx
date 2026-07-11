import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mountain, Droplets, Flame, Wind, MountainSnow } from 'lucide-react';
import ElephantMascot from '@/components/ElephantMascot';

interface DisasterType {
  id: string;
  name: string;
  icon: typeof Mountain;
  gradient: string;
  borderColor: string;
  description: string;
}

const disasters: DisasterType[] = [
  {
    id: 'earthquake',
    name: '地震',
    icon: Mountain,
    gradient: 'from-orange-400 to-red-500',
    borderColor: 'border-orange-200',
    description: '了解历史上重大地震事件及其成因',
  },
  {
    id: 'flood',
    name: '洪水',
    icon: Droplets,
    gradient: 'from-blue-400 to-cyan-500',
    borderColor: 'border-blue-200',
    description: '探索历史上严重的洪水灾害及原因',
  },
  {
    id: 'fire',
    name: '火灾',
    icon: Flame,
    gradient: 'from-red-400 to-rose-500',
    borderColor: 'border-red-200',
    description: '查看重大火灾事件及其发生原因',
  },
  {
    id: 'typhoon',
    name: '台风',
    icon: Wind,
    gradient: 'from-indigo-400 to-purple-500',
    borderColor: 'border-indigo-200',
    description: '了解历史上强台风事件及其成因',
  },
  {
    id: 'landslide',
    name: '泥石流',
    icon: MountainSnow,
    gradient: 'from-amber-400 to-yellow-500',
    borderColor: 'border-amber-200',
    description: '探索重大泥石流灾害及发生原因',
  },
];

export default function DisasterArchiveList() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mountain size={40} className="text-white" />
        </div>
        <h1 className="font-title text-3xl text-dark-text mb-2">灾害档案</h1>
        <p className="text-dark-text/60">了解历史上重大自然灾害事件</p>
      </motion.div>

      <div className="flex flex-col items-center gap-2 mb-8">
        <ElephantMascot mood="excited" size="lg" message="选择一个灾害类型开始探索！" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto w-full px-4">
        {disasters.map((disaster, index) => (
          <motion.div
            key={disaster.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
          >
            <Link
              to={`/disaster-archive/${disaster.id}`}
              className="block no-underline"
            >
              <div className={`bg-white rounded-2xl shadow-lg border-2 ${disaster.borderColor} overflow-hidden hover:shadow-xl transition-all h-full`}>
                <div className={`bg-gradient-to-r ${disaster.gradient} p-6`}>
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                    <disaster.icon size={32} className="text-white" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-title text-xl text-dark-text mb-2">
                    {disaster.name}
                  </h3>
                  <p className="text-sm text-dark-text/60">
                    {disaster.description}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 max-w-2xl mx-auto w-full px-4"
      >
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Mountain size={20} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium text-amber-800 mb-2">灾害档案说明</h3>
              <ul className="space-y-2 text-sm text-amber-600/80">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">1</span>
                  <span>选择灾害类型：点击感兴趣的自然灾害</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">2</span>
                  <span>查看历史事件：了解该类型灾害的重大事件</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">3</span>
                  <span>学习成因：了解灾害发生的原因和机制</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}