import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, Footprints, Brain } from 'lucide-react';
import ElephantMascot from '@/components/ElephantMascot';

export default function GameMain() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Gamepad2 size={40} className="text-white" />
        </div>
        <h1 className="font-title text-3xl text-dark-text mb-2">灾害游戏中心</h1>
        <p className="text-dark-text/60">选择一个游戏模式开始挑战！</p>
      </motion.div>

      <div className="flex flex-col items-center gap-2 mb-8">
        <ElephantMascot mood="excited" size="lg" message="今天想玩什么游戏呢？" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto w-full px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -4 }}
        >
          <Link
            to="/games/escape"
            className="block no-underline"
          >
            <div className="bg-white rounded-2xl shadow-lg border-2 border-green-200 overflow-hidden hover:shadow-xl transition-all h-full">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-6">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <Footprints size={32} className="text-white" />
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="font-title text-xl text-dark-text mb-2">
                  逃生游戏
                </h3>
                <p className="text-sm text-dark-text/60">
                  躲避灾害，挑战极限！
                </p>
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
            to="/games/quiz-bridge"
            className="block no-underline"
          >
            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 overflow-hidden hover:shadow-xl transition-all h-full">
              <div className="bg-gradient-to-r from-blue-400 to-cyan-500 p-6">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <Brain size={32} className="text-white" />
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="font-title text-xl text-dark-text mb-2">
                  知识独木桥
                </h3>
                <p className="text-sm text-dark-text/60">
                  问答闯关，步步为营！
                </p>
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
        <div className="bg-purple-50 rounded-2xl border border-purple-200 p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Gamepad2 size={20} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-purple-800 mb-2">游戏说明</h3>
              <ul className="space-y-2 text-sm text-purple-600/80">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">1</span>
                  <span>选择逃生游戏进入灾害场景选择</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">2</span>
                  <span>使用空格键或点击屏幕进行跳跃</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">3</span>
                  <span>按Enter键或右键使用冲刺技能</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}