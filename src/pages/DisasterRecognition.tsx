import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Thermometer, Droplets, Wind, CloudRain, Eye, Mountain, Sun, AlertTriangle, CheckCircle, RefreshCw, Lightbulb, X, Shield, AlertOctagon } from 'lucide-react';

interface Condition {
  name: string;
  icon: typeof Thermometer;
  value: string;
  unit: string;
  options: { label: string; value: string }[];
}

interface DisasterIndicator {
  disaster: string;
  icon: typeof Mountain;
  indicators: string[];
  conditions: string;
  description: string;
  precautions: string[];
  damage: string;
}

const disasterIndicators: DisasterIndicator[] = [
  {
    disaster: '地震',
    icon: Mountain,
    indicators: ['地面轻微晃动', '吊灯摆动', '窗户发出声响', '动物异常行为'],
    conditions: '短时间内多次震动或晃动',
    description: '地震是地壳快速释放能量过程中造成的振动，会产生地震波。地震成因主要有构造地震、火山地震、陷落地震和诱发地震。地震发生时，地面会发生震动，严重时会导致房屋倒塌、地面裂缝、泥石流等次生灾害。',
    precautions: ['迅速转移到空旷地带', '躲到坚固家具下', '远离窗户和悬挂物', '被困时保持冷静，敲击管道求救'],
    damage: '房屋倒塌、地面裂缝、山体滑坡、海啸、火灾等次生灾害',
  },
  {
    disaster: '台风',
    icon: Wind,
    indicators: ['天空突然变暗', '树木剧烈摇晃', '广告牌松动', '风向突变'],
    conditions: '风力突然增强到8级以上',
    description: '台风是发生在热带或副热带洋面上的热带气旋，中心附近最大风力达12级或以上。台风带来的灾害主要由强风、暴雨和风暴潮三个因素引起。台风来临时常伴有暴雨、雷电和巨浪。',
    precautions: ['关紧门窗，加固易被风吹动的搭建物', '转移至安全坚固的建筑物内', '储备食物和饮用水', '避免外出，切勿在河边或桥上行走'],
    damage: '房屋损坏、树木倒伏、城市内涝、海堤决口、船只损毁',
  },
  {
    disaster: '洪水',
    icon: Droplets,
    indicators: ['河水突然变浑浊', '水位快速上涨', '下游来水量突然增大', '堤坝出现裂缝'],
    conditions: '上游降雨量持续增大',
    description: '洪水是由暴雨、急骤融冰化雪、风暴潮等自然因素引起的江河湖海水量迅速增加的水文现象。洪水可能导致堤坝溃决、农田淹没、房屋冲毁，造成重大人员伤亡和财产损失。',
    precautions: ['向高处转移，如山坡或屋顶', '利用绳索或漂浮物自救', '被洪水困住时拨打求救电话', '不要独自涉水转移'],
    damage: '农田淹没、房屋冲毁、道路中断、堤坝溃决、人员伤亡',
  },
  {
    disaster: '泥石流',
    icon: Mountain,
    indicators: ['山谷传来轰鸣声', '河水突然断流', '山坡出现裂缝', '树木倾斜'],
    conditions: '暴雨后山区溪水突然变浑',
    description: '泥石流是山区沟谷中含大量泥沙石块的特殊洪流。它突然爆发，来势凶猛，历时短暂，具有强大的破坏力。泥石流的发生需要三个条件：充足的水源、陡峭的地形、有大量的松散固体物质。',
    precautions: ['立即向两侧高处逃离', '不要顺沟谷方向跑', '逃离时可抓住固定物体', '遇到后要向两侧高处躲避'],
    damage: '村庄被掩埋、道路中断、桥梁损毁、人员伤亡',
  },
  {
    disaster: '干旱',
    icon: Sun,
    indicators: ['长期无有效降水', '土壤干裂', '水库水位持续下降', '农作物出现枯萎'],
    conditions: '连续30天以上无明显降水',
    description: '干旱是指长时期降水偏少，造成空气干燥、土壤缺水，导致农作物枯萎、人畜饮水困难的现象。干旱可分为气象干旱、农业干旱、水文干旱和社会经济干旱。',
    precautions: ['节约用水，一水多用', '储备足够饮用水', '保护水资源，防止污染', '关注旱情预报预警信息'],
    damage: '农作物减产或绝收、饮用水困难、森林火灾频发、生态环境恶化',
  },
  {
    disaster: '沙尘暴',
    icon: Wind,
    indicators: ['天空呈现黄褐色', '能见度急剧下降', '空气中弥漫尘土味', '气温骤然下降'],
    conditions: '冷锋过境伴有大风天气',
    description: '沙尘暴是风携带大量沙尘和尘土的天气现象，会导致能见度显著降低。沙尘暴主要发生在干旱、半干旱地区，尤其是荒漠化严重的地区。它会对人体健康、交通安全和农业生产造成严重影响。',
    precautions: ['关好门窗，减少外出', '外出时佩戴防尘口罩', '车辆减速慢行，打开雾灯', '妥善安置易受沙尘影响的物品'],
    damage: '呼吸道疾病、交通事故、农业损失、通讯中断、空气质量恶化',
  },
];

const conditions: Condition[] = [
  {
    name: '天气状况',
    icon: CloudRain,
    value: '',
    unit: '',
    options: [
      { label: '晴朗', value: 'sunny' },
      { label: '多云', value: 'cloudy' },
      { label: '阴天', value: 'overcast' },
      { label: '降雨', value: 'rainy' },
      { label: '暴雨', value: 'stormy' },
      { label: '降雪', value: 'snowy' },
    ],
  },
  {
    name: '地面震动',
    icon: AlertTriangle,
    value: '',
    unit: '',
    options: [
      { label: '无震动', value: 'none' },
      { label: '轻微晃动', value: 'light' },
      { label: '明显晃动', value: 'medium' },
      { label: '剧烈震动', value: 'severe' },
    ],
  },
  {
    name: '风力等级',
    icon: Wind,
    value: '',
    unit: '级',
    options: [
      { label: '0-3级', value: '0-3' },
      { label: '4-5级', value: '4-5' },
      { label: '6-7级', value: '6-7' },
      { label: '8级以上', value: '8+' },
    ],
  },
  {
    name: '能见度',
    icon: Eye,
    value: '',
    unit: '米',
    options: [
      { label: '大于1000米', value: '>1000' },
      { label: '500-1000米', value: '500-1000' },
      { label: '200-500米', value: '200-500' },
      { label: '小于200米', value: '<200' },
    ],
  },
  {
    name: '温度范围',
    icon: Thermometer,
    value: '',
    unit: '℃',
    options: [
      { label: '低于0', value: '<0' },
      { label: '0-15', value: '0-15' },
      { label: '15-30', value: '15-30' },
      { label: '高于30', value: '>30' },
    ],
  },
  {
    name: '湿度水平',
    icon: Droplets,
    value: '',
    unit: '%',
    options: [
      { label: '低于30%', value: '<30' },
      { label: '30-60%', value: '30-60' },
      { label: '60-80%', value: '60-80' },
      { label: '高于80%', value: '>80' },
    ],
  },
];

export default function DisasterRecognition() {
  const navigate = useNavigate();
  const [selectedConditions, setSelectedConditions] = useState<Record<string, string>>({});
  const [analysisResult, setAnalysisResult] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterIndicator | null>(null);

  const handleSelectCondition = (conditionName: string, value: string) => {
    setSelectedConditions((prev) => ({
      ...prev,
      [conditionName]: value,
    }));
    setShowResult(false);
  };

  const analyzeDisasters = () => {
    const results: string[] = [];
    const weather = selectedConditions['天气状况'];
    const vibration = selectedConditions['地面震动'];
    const wind = selectedConditions['风力等级'];
    const visibility = selectedConditions['能见度'];
    const temp = selectedConditions['温度范围'];
    const humidity = selectedConditions['湿度水平'];

    if (vibration === 'light' || vibration === 'medium') {
      results.push('地震');
    } else if (vibration === 'severe') {
      results.push('地震', '泥石流');
    }

    if (wind === '8+' && (weather === 'rainy' || weather === 'stormy')) {
      results.push('台风');
    } else if (wind === '8+' || (wind === '6-7' && weather === 'cloudy')) {
      results.push('台风');
    }

    if ((weather === 'rainy' || weather === 'stormy') && humidity === '>80') {
      results.push('洪水', '泥石流');
    }

    if (visibility === '<200' && (weather === 'sunny' || weather === 'cloudy')) {
      results.push('沙尘暴');
    }

    if (weather === 'snowy' && temp === '<0') {
      results.push('雪崩');
    }

    if (!results.length && Object.keys(selectedConditions).length >= 4) {
      results.push('暂无明显灾害征兆');
    } else if (Object.keys(selectedConditions).length < 4) {
      results.push('请选择至少4个条件进行分析');
    }

    setAnalysisResult(results.length ? results : ['数据不足']);
    setShowResult(true);
  };

  const resetAnalysis = () => {
    setSelectedConditions({});
    setAnalysisResult([]);
    setShowResult(false);
  };

  const isComplete = Object.keys(selectedConditions).length >= 4;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#E8F4FD] via-[#FFF8F0] to-[#FEECD2]">
      <div className="max-w-4xl mx-auto w-full px-4 py-6">
        <button
          onClick={() => navigate('/modules')}
          className="flex items-center gap-2 text-dark-text/60 hover:text-dark-text mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>返回模块选择</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lightbulb size={32} className="text-white" />
          </div>
          <h1 className="font-title text-3xl text-dark-text mb-2">自然灾害自动识别</h1>
          <p className="text-dark-text/60">根据自然现象和条件智能识别可能的自然灾害</p>
        </motion.div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 mb-6">
          <h2 className="font-title text-lg text-dark-text mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-brand-orange" />
            当前环境条件
          </h2>
          <p className="text-sm text-dark-text/50 mb-4">请选择当前观察到的自然现象（至少选择4项）</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {conditions.map((condition) => (
              <div key={condition.name} className="space-y-2">
                <div className="flex items-center gap-2">
                  <condition.icon size={16} className="text-brand-orange" />
                  <span className="text-sm font-medium text-dark-text">{condition.name}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {condition.options.map((option) => {
                    const isSelected = selectedConditions[condition.name] === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleSelectCondition(condition.name, option.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          isSelected
                            ? 'bg-brand-orange text-white'
                            : 'bg-gray-100 text-dark-text/70 hover:bg-gray-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-dark-text/50">
              已选择: {Object.keys(selectedConditions).length} / 6 项
            </span>
            {Object.keys(selectedConditions).length > 0 && (
              <button
                onClick={resetAnalysis}
                className="flex items-center gap-1 text-sm text-dark-text/50 hover:text-dark-text transition-colors"
              >
                <RefreshCw size={14} />
                重置
              </button>
            )}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={analyzeDisasters}
          disabled={!isComplete}
          className={`w-full py-4 rounded-2xl font-title text-lg flex items-center justify-center gap-2 transition-all ${
            isComplete
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <AlertTriangle size={20} />
          开始分析
        </motion.button>

        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-5"
            >
              <h3 className="font-title text-lg text-dark-text mb-4 flex items-center gap-2">
                {analysisResult[0] === '暂无明显灾害征兆' || analysisResult[0] === '请选择至少4个条件进行分析' || analysisResult[0] === '数据不足' ? (
                  <>
                    <CheckCircle size={20} className="text-green-500" />
                    <span className="text-green-600">分析结果</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={20} className="text-red-500" />
                    <span className="text-red-600">可能的灾害</span>
                  </>
                )}
              </h3>

              {analysisResult[0] === '暂无明显灾害征兆' || analysisResult[0] === '请选择至少4个条件进行分析' || analysisResult[0] === '数据不足' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                    <CheckCircle size={24} className="text-green-500" />
                    <div>
                      <p className="font-medium text-green-700">当前未检测到明显灾害征兆</p>
                      <p className="text-sm text-green-600/80 mt-1">
                        {analysisResult[0] === '暂无明显灾害征兆'
                          ? '继续保持警惕，关注天气变化'
                          : analysisResult[0] === '请选择至少4个条件进行分析'
                          ? '请选择至少4个条件以获得准确分析'
                          : '请选择更多条件以获得准确分析'}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-dark-text/60">
                    提示：灾害预警需要综合考虑多种因素，即使当前无明显征兆，也应关注当地气象预警信息。
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analysisResult.map((disaster) => {
                    const info = disasterIndicators.find((d) => d.disaster === disaster);
                    if (!info) return null;
                    return (
                      <div key={disaster} className="p-4 bg-red-50 rounded-xl border border-red-100">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-orange-400 rounded-xl flex items-center justify-center flex-shrink-0">
                            <info.icon size={20} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-red-700">{disaster}</h4>
                            <p className="text-sm text-red-600/80 mt-1">
                              关键识别条件：{info.conditions}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {info.indicators.map((indicator) => (
                                <span
                                  key={indicator}
                                  className="inline-block px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs"
                                >
                                  {indicator}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <p className="text-sm text-yellow-700">
                      <strong>建议：</strong>如发现上述灾害征兆，请及时关注当地气象部门发布的预警信息，做好防范准备。必要时拨打110/120/119寻求帮助。
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-5"
        >
          <h3 className="font-title text-lg text-dark-text mb-4">常见灾害识别特征</h3>
          <p className="text-sm text-dark-text/50 mb-4">点击下方卡片查看详细特征介绍</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {disasterIndicators.map((info) => (
              <button
                key={info.disaster}
                onClick={() => setSelectedDisaster(info)}
                className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
              >
                <div className="flex items-center gap-2 mb-2">
                  <info.icon size={16} className="text-brand-orange" />
                  <span className="font-medium text-dark-text text-sm">{info.disaster}</span>
                </div>
                <p className="text-xs text-dark-text/60">{info.conditions}</p>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedDisaster && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDisaster(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center`}>
                    <selectedDisaster.icon size={20} className="text-white" />
                  </div>
                  <h3 className="font-title text-xl text-dark-text">{selectedDisaster.disaster}</h3>
                </div>
                <button
                  onClick={() => setSelectedDisaster(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={20} className="text-dark-text/60" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                <div>
                  <h4 className="font-medium text-dark-text mb-2 flex items-center gap-2">
                    <AlertOctagon size={16} className="text-brand-orange" />
                    灾害描述
                  </h4>
                  <p className="text-sm text-dark-text/70 leading-relaxed">{selectedDisaster.description}</p>
                </div>

                <div>
                  <h4 className="font-medium text-dark-text mb-2 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-red-500" />
                    关键识别条件
                  </h4>
                  <p className="text-sm text-dark-text/70">{selectedDisaster.conditions}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedDisaster.indicators.map((indicator) => (
                      <span
                        key={indicator}
                        className="inline-block px-2 py-1 bg-red-50 text-red-600 rounded text-xs"
                      >
                        {indicator}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-dark-text mb-2 flex items-center gap-2">
                    <Shield size={16} className="text-green-500" />
                    防护措施
                  </h4>
                  <ul className="space-y-2">
                    {selectedDisaster.precautions.map((precaution, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-dark-text/70">
                        <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                          {idx + 1}
                        </span>
                        {precaution}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-dark-text mb-2 flex items-center gap-2">
                    <AlertOctagon size={16} className="text-yellow-500" />
                    主要危害
                  </h4>
                  <p className="text-sm text-dark-text/70">{selectedDisaster.damage}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
