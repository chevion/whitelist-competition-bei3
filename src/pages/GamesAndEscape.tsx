import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, Footprints, Play } from 'lucide-react';
import ElephantMascot from '@/components/ElephantMascot';

export default function GamesAndEscape() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Play size={40} className="text-white" />
        </div>
        <h1 className="font-title text-3xl text-dark-text mb-2">互动体验</h1>
        <p className="text-dark-text/60">通过游戏和演练提升灾害应对能力</p>
      </motion.div>

      <div className="flex flex-col items-center gap-2 mb-8">
        <ElephantMascot mood="excited" size="lg" message="选择一个开始挑战吧！" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto w-full px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -4 }}
        >
          <Link
            to="/escape"
            className="block no-underline"
          >
            <div className="bg-white rounded-2xl shadow-lg border-2 border-red-200 overflow-hidden hover:shadow-xl transition-all h-full">
              <div className="bg-gradient-to-r from-red-400 to-rose-500 p-6">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <Footprints size={32} className="text-white" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-title text-xl text-dark-text mb-2">
                  逃生演练
                </h3>
                <p className="text-sm text-dark-text/60 mb-4">
                  在模拟场景中学习正确的逃生路线，体验火灾、地震等灾害的应对方法。
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600">
                    火灾逃生
                  </span>
                  <span className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600">
                    地震逃生
                  </span>
                  <span className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600">
                    模拟演练
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02, y: -4 }}
        >
          <Link
            to="/games"
            className="block no-underline"
          >
            <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 overflow-hidden hover:shadow-xl transition-all h-full">
              <div className="bg-gradient-to-r from-purple-400 to-pink-500 p-6">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <Gamepad2 size={32} className="text-white" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-title text-xl text-dark-text mb-2">
                  灾害游戏
                </h3>
                <p className="text-sm text-dark-text/60 mb-4">
                  在趣味游戏中躲避灾害，挑战你的反应速度和应变能力！
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs px-2 py-1 rounded-lg bg-purple-50 text-purple-600">
                    泥石流
                  </span>
                  <span className="text-xs px-2 py-1 rounded-lg bg-purple-50 text-purple-600">
                    火灾
                  </span>
                  <span className="text-xs px-2 py-1 rounded-lg bg-purple-50 text-purple-600">
                    洪水
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 max-w-2xl mx-auto w-full px-4"
      >
        <div className="bg-orange-50 rounded-2xl border border-orange-200 p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Play size={20} className="text-orange-600" />
            </div>
            <div>
              <h3 className="font-medium text-orange-800 mb-2">互动体验说明</h3>
              <ul className="space-y-2 text-sm text-orange-600/80">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">1</span>
                  <span>逃生演练：学习正确的灾害应对方法和逃生路线</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">2</span>
                  <span>灾害游戏：通过趣味游戏提升反应速度和应变能力</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">3</span>
                  <span>两者结合，全面提升灾害应对能力</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}