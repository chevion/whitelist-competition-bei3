import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Droplets, Wind, Mountain, ChevronRight, Gamepad2 } from 'lucide-react';
import ElephantMascot from '@/components/ElephantMascot';

const disasterGames = [
  {
    id: 'mudslide',
    title: '泥石流逃生',
    icon: Mountain,
    description: '山洪爆发，泥浆滚滚！控制小鸟躲避流动的泥石，冲向安全地带！',
    gradient: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    features: ['躲避泥浆流', '跳过障碍物', '山地地形'],
    difficulty: '中等',
  },
  {
    id: 'fire',
    title: '火灾逃生',
    icon: Flame,
    description: '大火蔓延，烟雾弥漫！穿过火海，寻找安全出口！',
    gradient: 'from-red-400 to-rose-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    features: ['躲避火焰', '避开掉落物', '限时逃生'],
    difficulty: '困难',
  },
  {
    id: 'flood',
    title: '洪水逃生',
    icon: Droplets,
    description: '暴雨来袭，水位上涨！在水面上跳跃前进，逃离被淹没的城市！',
    gradient: 'from-blue-400 to-cyan-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    features: ['水上跳跃', '躲避漂浮物', '暗流涌动'],
    difficulty: '简单',
  },
  {
    id: 'typhoon',
    title: '台风逃生',
    icon: Wind,
    description: '狂风呼啸，飞沙走石！逆风而行，到达安全避难所！',
    gradient: 'from-indigo-400 to-purple-500',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    features: ['逆风奔跑', '避开飞物', '风力影响'],
    difficulty: '困难',
  },
];

export default function DisasterGameSelect() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Gamepad2 size={32} className="text-white" />
        </div>
        <h1 className="font-title text-3xl text-dark-text mb-2">灾害逃生小游戏</h1>
        <p className="text-dark-text/60">选择一个灾害场景，开始你的逃生之旅！</p>
      </motion.div>

      <div className="flex flex-col items-center gap-2 mb-8">
        <ElephantMascot mood="excited" size="lg" message="准备好了吗？选择一个灾害开始挑战！" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto w-full">
        {disasterGames.map((game, idx) => {
          const Icon = game.icon;
          return (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <Link
                to={`/games/${game.id}`}
                className="block no-underline"
              >
                <div className={`bg-white rounded-2xl shadow-lg border-2 ${game.borderColor} overflow-hidden hover:shadow-xl transition-all`}>
                  <div className={`bg-gradient-to-r ${game.gradient} p-5 flex items-center justify-between`}>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Icon size={28} className="text-white" />
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${game.bgColor} text-dark-text/60 font-medium`}>
                      {game.difficulty}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-title text-lg text-dark-text mb-2">
                      {game.title}
                    </h3>
                    <p className="text-sm text-dark-text/60 mb-3 leading-relaxed">
                      {game.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {game.features.map((feature) => (
                        <span
                          key={feature}
                          className={`text-xs px-2 py-1 rounded-lg ${game.bgColor} text-dark-text/50`}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-end gap-2 text-sm text-dark-text/70">
                      <span>开始游戏</span>
                      <ChevronRight size={18} className="text-brand-orange" />
                    </div>
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
        transition={{ delay: 0.5 }}
        className="mt-8 max-w-2xl mx-auto w-full"
      >
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Gamepad2 size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-800 mb-2">游戏玩法</h3>
              <ul className="space-y-2 text-sm text-blue-600/80">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">1</span>
                  <span>点击屏幕或按空格键让小鸟跳跃</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">2</span>
                  <span>躲避各种障碍物和灾害元素</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">3</span>
                  <span>到达终点即可获胜</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
