import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ArrowLeft, Sparkles, Download, RotateCcw, CheckCircle2, AlertTriangle, MapPin, Route } from 'lucide-react';
import { Link } from 'react-router-dom';
import ElephantMascot from '@/components/ElephantMascot';

interface EscapeRoute {
  from: string;
  to: string;
  description: string;
  priority: number;
}

interface GeneratedPlan {
  meetingPoint: string;
  routes: EscapeRoute[];
  notes: string[];
}

export default function EscapeMap() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setStep('preview');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleGenerate = async () => {
    if (!uploadedImage) return;
    setIsGenerating(true);

    // 模拟 AI 分析过程
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 模拟生成的逃生计划
    const mockPlan: GeneratedPlan = {
      meetingPoint: '小区广场北门集合点（远离建筑物）',
      routes: [
        {
          from: '客厅',
          to: '主卧室逃生窗',
          description: '通过客厅窗户向楼下逃生，使用逃生绳或缓降器',
          priority: 1
        },
        {
          from: '厨房',
          to: '后阳台逃生门',
          description: '厨房后门通向消防通道，沿楼梯有序撤离',
          priority: 2
        },
        {
          from: '次卧室',
          to: '次卧逃生窗',
          description: '次卧窗户为备用逃生通道，紧急情况可使用',
          priority: 3
        },
        {
          from: '主卧室',
          to: '主卧逃生窗',
          description: '主卧窗户连接隔壁阳台，可破窗逃生',
          priority: 1
        },
        {
          from: '书房',
          to: '书房门 → 客厅 → 主逃生通道',
          description: '书房靠近客厅，可快速到达主逃生路线',
          priority: 2
        }
      ],
      notes: [
        '火灾时切勿乘坐电梯，必须使用楼梯逃生',
        '逃生时用湿毛巾捂住口鼻，低姿势前进',
        '到达集合点后清点人数，确保所有人都已撤离',
        '定期检查逃生通道是否畅通，勿堆放杂物',
        '建议每半年进行一次家庭逃生演练',
        '准备家用灭火器和逃生缓降设备'
      ]
    };

    setGeneratedPlan(mockPlan);
    setIsGenerating(false);
    setStep('result');
  };

  const handleReset = () => {
    setUploadedImage(null);
    setGeneratedPlan(null);
    setStep('upload');
  };

  const handleDownload = () => {
    if (!generatedPlan) return;
    
    const content = `
╔══════════════════════════════════════════════════════════════╗
║                    家庭逃生计划                              ║
╠══════════════════════════════════════════════════════════════╣
║ 集合地点：${generatedPlan.meetingPoint}
╠══════════════════════════════════════════════════════════════╣
║                      逃生路线                                ║
${generatedPlan.routes.map(r => `║ ${r.priority}. ${r.from} → ${r.to}
║    ${r.description}`).join('\n')}
╠══════════════════════════════════════════════════════════════╣
║                      注意事项                                ║
${generatedPlan.notes.map(n => `║ • ${n}`).join('\n')}
╚══════════════════════════════════════════════════════════════╝
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = '家庭逃生计划.txt';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pb-20 md:pb-0">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/home-plan" className="p-2 rounded-lg hover:bg-gray-100 text-dark-text/60 hover:text-dark-text transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-title text-2xl text-brand-orange">家庭逃生图</h1>
      </div>

      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="text-center mb-6">
                <ElephantMascot mood="excited" size="md" />
                <h2 className="font-title text-xl text-dark-text mt-4 mb-2">上传房屋结构图</h2>
                <p className="text-dark-text/60 text-sm">
                  上传你家房屋的结构平面图，小象将智能分析并生成逃生路线
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUploadClick}
                className="border-2 border-dashed border-brand-orange/30 rounded-2xl p-12 cursor-pointer hover:border-brand-orange hover:bg-brand-orange/5 transition-all"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center">
                    <Upload size={32} className="text-brand-orange" />
                  </div>
                  <div className="text-center">
                    <p className="text-dark-text font-medium mb-1">点击上传图片</p>
                    <p className="text-dark-text/50 text-sm">支持 JPG、PNG 格式</p>
                  </div>
                </div>
              </motion.div>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">温馨提示</p>
                    <p className="text-blue-600/80">
                      请上传包含以下信息的房屋平面图：
                    </p>
                    <ul className="list-disc list-inside mt-1 text-blue-600/80 space-y-0.5">
                      <li>各房间位置和大小</li>
                      <li>门窗位置（特别是逃生门和逃生窗）</li>
                      <li>楼梯或消防通道位置</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'preview' && uploadedImage && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-title text-lg text-dark-text">上传成功</h2>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-sm text-dark-text/50 hover:text-dark-text transition-colors"
                >
                  <RotateCcw size={14} />
                  重新上传
                </button>
              </div>

              <div className="rounded-xl overflow-hidden border border-gray-200 mb-6">
                <img
                  src={uploadedImage}
                  alt="上传的房屋结构图"
                  className="w-full h-auto max-h-[60vh] object-contain bg-gray-50"
                />
              </div>

              <div className="p-4 bg-brand-orange/5 rounded-xl mb-6">
                <div className="flex items-start gap-2">
                  <ElephantMascot mood="thinking" size="sm" />
                  <p className="text-sm text-dark-text/70">
                    图片已识别！点击下方按钮，小象将根据房屋结构智能生成逃生路线规划。
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-4 bg-brand-orange text-white font-medium rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles size={20} />
                    </motion.div>
                    正在分析图片，生成逃生路线...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    智能生成逃生路线
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 'result' && generatedPlan && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-title text-lg text-dark-text">智能分析完成</h2>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-sm text-dark-text/50 hover:text-dark-text transition-colors"
                >
                  <RotateCcw size={14} />
                  重新上传
                </button>
              </div>

              <div className="rounded-xl overflow-hidden border border-gray-200 mb-6">
                <img
                  src={uploadedImage!}
                  alt="房屋结构图"
                  className="w-full h-auto max-h-[40vh] object-contain bg-gray-50"
                />
              </div>

              <div className="p-4 bg-safety-green/10 rounded-xl mb-6">
                <div className="flex items-start gap-2">
                  <MapPin size={18} className="text-safety-green mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-safety-green mb-1">集合地点</p>
                    <p className="text-sm text-dark-text">{generatedPlan.meetingPoint}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium text-dark-text mb-3 flex items-center gap-2">
                  <Route size={18} className="text-brand-orange" />
                  推荐逃生路线
                </h3>
                <div className="space-y-3">
                  {generatedPlan.routes.sort((a, b) => a.priority - b.priority).map((route, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          route.priority === 1 ? 'bg-safety-green text-white' : 'bg-blue-500 text-white'
                        }`}>
                          {route.priority === 1 ? <CheckCircle2 size={18} /> : <span className="text-sm font-medium">{index + 1}</span>}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-dark-text mb-1">{route.from} → {route.to}</p>
                          <p className="text-sm text-dark-text/60">{route.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium text-dark-text mb-3">注意事项</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {generatedPlan.notes.map((note, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg"
                    >
                      <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-700">{note}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDownload}
                  className="flex-1 py-3 bg-safety-green text-white font-medium rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  下载逃生计划
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => window.print()}
                  className="px-6 py-3 bg-gray-100 text-dark-text font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  打印
                </motion.button>
              </div>
            </div>

            <div className="bg-brand-orange/5 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <ElephantMascot mood="happy" size="sm" />
                <p className="text-sm text-dark-text/70">
                  记得定期检查逃生通道是否畅通，建议每半年进行一次家庭逃生演练哦！
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
