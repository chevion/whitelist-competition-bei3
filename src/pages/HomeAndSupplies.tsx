import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, MapPin, Heart, ClipboardList } from 'lucide-react';
import ElephantMascot from '@/components/ElephantMascot';

export default function HomeAndSupplies() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ClipboardList size={40} className="text-white" />
        </div>
        <h1 className="font-title text-3xl text-dark-text mb-2">家庭安全管理</h1>
        <p className="text-dark-text/60">管理家庭防灾规划和应急物资储备</p>
      </motion.div>

      <div className="flex flex-col items-center gap-2 mb-8">
        <ElephantMascot mood="happy" size="lg" message="做好准备，安全第一！" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto w-full px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -4 }}
        >
          <Link
            to="/home-plan"
            className="block no-underline"
          >
            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 overflow-hidden hover:shadow-xl transition-all h-full">
              <div className="bg-gradient-to-r from-blue-400 to-indigo-500 p-6">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <MapPin size={32} className="text-white" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-title text-xl text-dark-text mb-2">
                  家庭规划
                </h3>
                <p className="text-sm text-dark-text/60 mb-4">
                  制定家庭逃生路线，管理家庭成员信息，确保全家安全。
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-600">
                    逃生路线
                  </span>
                  <span className="text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-600">
                    医疗卡
                  </span>
                  <span className="text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-600">
                    成员信息
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
            to="/supplies"
            className="block no-underline"
          >
            <div className="bg-white rounded-2xl shadow-lg border-2 border-green-200 overflow-hidden hover:shadow-xl transition-all h-full">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-6">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <Package size={32} className="text-white" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-title text-xl text-dark-text mb-2">
                  物资储备
                </h3>
                <p className="text-sm text-dark-text/60 mb-4">
                  根据家庭情况计算应急物资需求，确保灾害发生时有所准备。
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs px-2 py-1 rounded-lg bg-green-50 text-green-600">
                    物资计算
                  </span>
                  <span className="text-xs px-2 py-1 rounded-lg bg-green-50 text-green-600">
                    清单管理
                  </span>
                  <span className="text-xs px-2 py-1 rounded-lg bg-green-50 text-green-600">
                    储备建议
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
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Heart size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-800 mb-2">为什么需要准备？</h3>
              <ul className="space-y-2 text-sm text-blue-600/80">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">1</span>
                  <span>提前规划逃生路线可以在紧急情况下节省宝贵时间</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">2</span>
                  <span>充足的物资储备可以保障灾害期间的基本生活需求</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">3</span>
                  <span>医疗卡信息可以帮助救援人员快速了解家庭成员情况</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}