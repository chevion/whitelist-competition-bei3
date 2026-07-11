import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Lightbulb, Brain, Archive } from 'lucide-react';
import ElephantMascot from '@/components/ElephantMascot';

export default function QuizAndRecognition() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Brain size={40} className="text-white" />
        </div>
        <h1 className="font-title text-3xl text-dark-text mb-2">知识学习</h1>
        <p className="text-dark-text/60">学习灾害知识，提升安全意识</p>
      </motion.div>

      <div className="flex flex-col items-center gap-2 mb-8">
        <ElephantMascot mood="thinking" size="lg" message="知识就是力量！" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto w-full px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -4 }}
        >
          <Link
            to="/quiz"
            className="block no-underline"
          >
            <div className="bg-white rounded-2xl shadow-lg border-2 border-teal-200 overflow-hidden hover:shadow-xl transition-all h-full">
              <div className="bg-gradient-to-r from-teal-400 to-cyan-500 p-6">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <BookOpen size={32} className="text-white" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-title text-xl text-dark-text mb-2">
                  安全问答
                </h3>
                <p className="text-sm text-dark-text/60 mb-4">
                  通过问答形式检验和巩固灾害安全知识，了解正确的应对方法。
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs px-2 py-1 rounded-lg bg-teal-50 text-teal-600">
                    知识测试
                  </span>
                  <span className="text-xs px-2 py-1 rounded-lg bg-teal-50 text-teal-600">
                    模拟问答
                  </span>
                  <span className="text-xs px-2 py-1 rounded-lg bg-teal-50 text-teal-600">
                    成绩记录
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
            to="/disaster-recognition"
            className="block no-underline"
          >
            <div className="bg-white rounded-2xl shadow-lg border-2 border-green-200 overflow-hidden hover:shadow-xl transition-all h-full">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-6">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <Lightbulb size={32} className="text-white" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-title text-xl text-dark-text mb-2">
                  灾害识别
                </h3>
                <p className="text-sm text-dark-text/60 mb-4">
                  学习识别各种灾害的前兆和特征，提前做好防范准备。
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs px-2 py-1 rounded-lg bg-green-50 text-green-600">
                    前兆识别
                  </span>
                  <span className="text-xs px-2 py-1 rounded-lg bg-green-50 text-green-600">
                    特征判断
                  </span>
                  <span className="text-xs px-2 py-1 rounded-lg bg-green-50 text-green-600">
                    防范措施
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -4 }}
        >
          <Link
            to="/disaster-archive"
            className="block no-underline"
          >
            <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 overflow-hidden hover:shadow-xl transition-all h-full">
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-6">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <Archive size={32} className="text-white" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-title text-xl text-dark-text mb-2">
                  灾害档案
                </h3>
                <p className="text-sm text-dark-text/60 mb-4">
                  查看历史上重大自然灾害事件，了解灾害发生的原因。
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs px-2 py-1 rounded-lg bg-amber-50 text-amber-600">
                    历史事件
                  </span>
                  <span className="text-xs px-2 py-1 rounded-lg bg-amber-50 text-amber-600">
                    成因分析
                  </span>
                  <span className="text-xs px-2 py-1 rounded-lg bg-amber-50 text-amber-600">
                    灾害详情
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
        <div className="bg-teal-50 rounded-2xl border border-teal-200 p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain size={20} className="text-teal-600" />
            </div>
            <div>
              <h3 className="font-medium text-teal-800 mb-2">知识学习说明</h3>
              <ul className="space-y-2 text-sm text-teal-600/80">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-200 text-teal-700 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">1</span>
                  <span>安全问答：检验和巩固灾害安全知识</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-200 text-teal-700 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">2</span>
                  <span>灾害识别：学习识别灾害前兆和特征</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-200 text-teal-700 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">3</span>
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