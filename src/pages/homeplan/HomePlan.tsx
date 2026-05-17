import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, Heart } from 'lucide-react';
import ElephantMascot from '@/components/ElephantMascot';

const entries = [
  {
    title: '家庭逃生图',
    desc: '绘制你的家庭布局，规划逃生路线',
    icon: Map,
    path: '/home-plan/escape-map',
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-50',
  },
  {
    title: '个人医疗应急卡',
    desc: '生成你的个人医疗急救信息卡',
    icon: Heart,
    path: '/home-plan/medical-card',
    color: 'bg-pink-500',
    hoverColor: 'hover:bg-pink-50',
  },
];

export default function HomePlan() {
  return (
    <div className="flex flex-col items-center gap-8 pb-20 md:pb-0">
      <div className="text-center">
        <h1 className="font-title text-3xl text-brand-orange mb-2">我家计划</h1>
        <p className="text-dark-text/60">为家庭安全做好充分准备</p>
      </div>

      <ElephantMascot mood="excited" size="md" message="让我们一起为家庭安全做准备吧！" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        {entries.map((entry) => {
          const Icon = entry.icon;
          return (
            <Link key={entry.path} to={entry.path} className="block no-underline group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow ${entry.hoverColor}`}
              >
                <div className={`inline-flex p-3 rounded-xl ${entry.color} text-white mb-4`}>
                  <Icon size={28} />
                </div>
                <h3 className="font-title text-xl text-dark-text group-hover:text-brand-orange transition-colors mb-2">
                  {entry.title}
                </h3>
                <p className="text-dark-text/50 text-sm">{entry.desc}</p>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
