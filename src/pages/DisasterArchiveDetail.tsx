import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mountain, Droplets, Flame, Wind, MountainSnow, Calendar, MapPin, AlertTriangle, Info } from 'lucide-react';
import ElephantMascot from '@/components/ElephantMascot';

interface DisasterEvent {
  year: string;
  location: string;
  name: string;
  severity: string;
  description: string;
}

interface DisasterData {
  id: string;
  name: string;
  icon: typeof Mountain;
  gradient: string;
  bgColor: string;
  borderColor: string;
  events: DisasterEvent[];
  causes: string[];
  background: string;
}

const disasterData: Record<string, DisasterData> = {
  earthquake: {
    id: 'earthquake',
    name: '地震',
    icon: Mountain,
    gradient: 'from-orange-400 to-red-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    background: '地震是地球内部能量释放引起的地壳震动，是最具破坏力的自然灾害之一。',
    events: [
      {
        year: '2008年',
        location: '中国四川',
        name: '汶川特大地震',
        severity: '8.0级',
        description: '造成近7万人遇难，是中国建国以来最严重的地震灾害。震中位于四川省汶川县，震源深度约14公里。',
      },
      {
        year: '2011年',
        location: '日本东北',
        name: '东日本大地震',
        severity: '9.0级',
        description: '引发巨大海啸，造成约1.9万人死亡或失踪，福岛核事故更是造成了长期的环境影响。',
      },
      {
        year: '2004年',
        location: '印度洋',
        name: '印度洋海啸',
        severity: '9.1级',
        description: '由苏门答腊附近海域的地震引发，波及14个国家，造成约23万人死亡。',
      },
      {
        year: '1995年',
        location: '日本阪神',
        name: '阪神大地震',
        severity: '7.3级',
        description: '造成约6400人死亡，大量建筑倒塌，是日本战后最严重的地震灾害之一。',
      },
      {
        year: '1976年',
        location: '中国唐山',
        name: '唐山大地震',
        severity: '7.8级',
        description: '造成约24万人死亡，整个唐山市几乎被夷为平地。',
      },
    ],
    causes: [
      '板块运动：地球表面的岩石圈被划分为多个板块，板块之间的相互挤压、碰撞或错动是地震最主要的原因。',
      '构造应力：板块运动产生的应力在地壳中积累，当应力超过岩石的承受极限时，岩石会发生断裂或错动，释放出巨大的能量。',
      '火山活动：火山喷发前后，岩浆的运动也可能引发地震。',
      '人为因素：水库蓄水、地下核试验、采矿等人类活动也可能诱发地震。',
    ],
  },
  flood: {
    id: 'flood',
    name: '洪水',
    icon: Droplets,
    gradient: 'from-blue-400 to-cyan-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    background: '洪水是指大量水体在短时间内积聚，超过河道、湖泊或海洋的容纳能力，导致水流泛滥的现象。',
    events: [
      {
        year: '2020年',
        location: '中国南方',
        name: '南方特大洪水',
        severity: '超历史纪录',
        description: '长江、淮河等多条河流出现超警戒水位，造成数百人死亡，直接经济损失超过1600亿元。',
      },
      {
        year: '2018年',
        location: '印度喀拉拉邦',
        name: '喀拉拉邦洪水',
        severity: '百年一遇',
        description: '连续暴雨引发洪水和山体滑坡，造成约500人死亡，数百万人流离失所。',
      },
      {
        year: '2017年',
        location: '孟加拉国',
        name: '孟加拉国洪水',
        severity: '严重',
        description: '季风降雨引发的洪水淹没了全国三分之一的地区，造成约1000人死亡。',
      },
      {
        year: '1998年',
        location: '中国长江',
        name: '长江特大洪水',
        severity: '百年一遇',
        description: '长江全流域发生特大洪水，造成约3000人死亡，直接经济损失超过2500亿元。',
      },
      {
        year: '1931年',
        location: '中国长江',
        name: '长江大水灾',
        severity: '历史罕见',
        description: '被认为是20世纪最严重的自然灾害之一，造成约14.5万人死亡，数百万人流离失所。',
      },
    ],
    causes: [
      '暴雨或连续降雨：短时间内大量降水是引发洪水最直接的原因。',
      '台风或飓风：强风暴带来的大量降水常常引发洪水。',
      '冰雪融化：春季气温升高导致积雪或冰川快速融化，增加河流流量。',
      '堤坝决口：河流堤坝因洪水压力过大或年久失修而崩溃。',
      '人类活动：城市化导致地面硬化，减少雨水渗透；砍伐森林破坏植被保持水土的能力。',
    ],
  },
  fire: {
    id: 'fire',
    name: '火灾',
    icon: Flame,
    gradient: 'from-red-400 to-rose-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    background: '火灾是指在时间或空间上失去控制的燃烧现象，对人类生命财产和生态环境造成严重威胁。',
    events: [
      {
        year: '2019年',
        location: '澳大利亚',
        name: '澳大利亚山火',
        severity: '史上最严重',
        description: '持续数月的山火烧毁了超过1800万公顷的土地，造成至少34人死亡，数十亿野生动物丧生。',
      },
      {
        year: '2018年',
        location: '美国加州',
        name: '加州山火',
        severity: '严重',
        description: '造成约100人死亡，数千栋建筑被毁，成为加州历史上最致命的火灾之一。',
      },
      {
        year: '2010年',
        location: '俄罗斯',
        name: '俄罗斯森林大火',
        severity: '大面积',
        description: '高温干旱引发的森林大火蔓延至莫斯科周边，造成约50人死亡，空气质量严重恶化。',
      },
      {
        year: '1987年',
        location: '中国大兴安岭',
        name: '大兴安岭火灾',
        severity: '特大',
        description: '中国建国以来最严重的森林火灾，烧毁森林面积超过100万公顷，造成约210人死亡。',
      },
      {
        year: '1945年',
        location: '日本东京',
        name: '东京大空袭火灾',
        severity: '毁灭性',
        description: '美军空袭引发的大火烧毁了东京大部分城区，造成约10万人死亡。',
      },
    ],
    causes: [
      '人为疏忽：吸烟、野炊、用电不当等是引发火灾最常见的人为原因。',
      '自然因素：雷击、火山喷发等自然现象也可能引发火灾。',
      '气候条件：高温、干旱、强风等气候条件会加剧火灾的发生和蔓延。',
      '可燃物积累：森林中枯枝落叶等可燃物的积累为火灾提供了物质基础。',
      '森林管理不善：缺乏有效的防火措施和消防设施。',
    ],
  },
  typhoon: {
    id: 'typhoon',
    name: '台风',
    icon: Wind,
    gradient: 'from-indigo-400 to-purple-500',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    background: '台风是发生在热带或副热带洋面上的强烈气旋，带来强风、暴雨和风暴潮等灾害。',
    events: [
      {
        year: '2021年',
        location: '中国河南',
        name: '台风"烟花"',
        severity: '超强台风',
        description: '引发河南特大暴雨，造成约300人死亡，直接经济损失超过1000亿元。',
      },
      {
        year: '2013年',
        location: '菲律宾',
        name: '台风"海燕"',
        severity: '超强台风',
        description: '登陆时风速达到315公里/小时，造成约6300人死亡，是菲律宾历史上最致命的台风之一。',
      },
      {
        year: '2012年',
        location: '美国纽约',
        name: '飓风"桑迪"',
        severity: '大型飓风',
        description: '造成约150人死亡，直接经济损失超过700亿美元，是美国历史上最昂贵的飓风之一。',
      },
      {
        year: '2005年',
        location: '美国新奥尔良',
        name: '飓风"卡特里娜"',
        severity: '五级飓风',
        description: '造成约1800人死亡，新奥尔良市80%被淹没，是美国历史上最严重的自然灾害之一。',
      },
      {
        year: '1975年',
        location: '中国河南',
        name: '河南特大暴雨',
        severity: '历史罕见',
        description: '台风引发的特大暴雨导致板桥水库等多个水库决口，造成约2.6万人死亡。',
      },
    ],
    causes: [
      '温暖的海水：台风形成需要海水温度至少达到26.5°C，提供能量来源。',
      '科里奥利力：地球自转产生的科里奥利力使空气旋转，形成气旋。',
      '弱垂直风切变：风切变过大会破坏台风的结构。',
      '高湿度空气：充足的水汽是台风维持和发展的重要条件。',
      '低压系统：热带地区的低压扰动是台风形成的初始条件。',
    ],
  },
  landslide: {
    id: 'landslide',
    name: '泥石流',
    icon: MountainSnow,
    gradient: 'from-amber-400 to-yellow-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    background: '泥石流是山区常见的地质灾害，由暴雨、洪水或地震等因素引发，携带大量泥沙和石块快速流动。',
    events: [
      {
        year: '2020年',
        location: '中国甘肃',
        name: '甘肃陇南泥石流',
        severity: '严重',
        description: '暴雨引发的泥石流造成约100人死亡或失踪，大量房屋和道路被冲毁。',
      },
      {
        year: '2010年',
        location: '中国甘肃',
        name: '舟曲特大泥石流',
        severity: '特大型',
        description: '造成约1500人死亡，是中国近年来最严重的泥石流灾害之一。',
      },
      {
        year: '2008年',
        location: '中国四川',
        name: '汶川地震引发泥石流',
        severity: '大规模',
        description: '汶川地震后，山体稳定性下降，多次发生大规模泥石流，造成进一步损失。',
      },
      {
        year: '1991年',
        location: '哥伦比亚',
        name: '内瓦多·德·鲁伊斯火山泥石流',
        severity: '毁灭性',
        description: '火山喷发引发的泥石流造成约2.3万人死亡，是20世纪最严重的火山灾害之一。',
      },
      {
        year: '1920年',
        location: '中国宁夏',
        name: '海原大地震',
        severity: '8.5级',
        description: '地震引发的山体滑坡和泥石流造成约23万人死亡，是中国历史上最严重的地震灾害之一。',
      },
    ],
    causes: [
      '暴雨或洪水：大量降水渗入土壤，增加土壤重量，降低稳定性。',
      '地震：地震破坏山体结构，引发滑坡和泥石流。',
      '火山活动：火山喷发产生的熔岩和碎屑流可能引发泥石流。',
      '人类活动：砍伐森林、过度开垦、采矿等破坏植被和山体稳定性。',
      '地形因素：陡峭的山坡和松散的土壤是泥石流易发的地理条件。',
    ],
  },
};

export default function DisasterArchiveDetail() {
  const { id } = useParams<{ id: string }>();
  const disaster = disasterData[id || 'earthquake'];

  if (!disaster) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-dark-text/60">灾害类型不存在</p>
        <Link to="/disaster-archive" className="mt-4 text-blue-500 hover:underline">
          返回灾害档案列表
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className={`w-20 h-20 bg-gradient-to-br ${disaster.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
          <disaster.icon size={40} className="text-white" />
        </div>
        <h1 className="font-title text-3xl text-dark-text mb-2">{disaster.name}档案</h1>
        <p className="text-dark-text/60 max-w-2xl mx-auto">{disaster.background}</p>
      </motion.div>

      <div className="flex justify-center mb-6">
        <Link
          to="/disaster-archive"
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <ArrowLeft size={18} className="text-dark-text/60" />
          <span className="text-sm text-dark-text/60">返回灾害列表</span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-3xl mx-auto w-full px-4 mb-8"
      >
        <div className={`rounded-2xl border-2 ${disaster.borderColor} bg-white shadow-lg overflow-hidden`}>
          <div className={`bg-gradient-to-r ${disaster.gradient} px-6 py-4`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <AlertTriangle size={20} className="text-white" />
              </div>
              <div>
                <h2 className="font-title text-xl text-white">历史重大事件</h2>
                <p className="text-white/80 text-sm">按时间从近到远排列</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {disaster.events.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${disaster.bgColor} text-amber-700`}>
                    {event.year}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 flex items-center gap-1">
                    <MapPin size={14} />
                    {event.location}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${disaster.bgColor} text-orange-600`}>
                    {event.severity}
                  </span>
                </div>
                <h3 className="font-title text-lg text-dark-text mb-2">{event.name}</h3>
                <p className="text-dark-text/70 text-sm leading-relaxed">{event.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-3xl mx-auto w-full px-4 mb-8"
      >
        <div className={`rounded-2xl border-2 ${disaster.borderColor} bg-white shadow-lg overflow-hidden`}>
          <div className={`bg-gradient-to-r ${disaster.gradient} px-6 py-4`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Info size={20} className="text-white" />
              </div>
              <div>
                <h2 className="font-title text-xl text-white">灾害成因分析</h2>
                <p className="text-white/80 text-sm">了解灾害发生的原因和机制</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <ul className="space-y-4">
              {disaster.causes.map((cause, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <span className={`w-6 h-6 rounded-full bg-gradient-to-r ${disaster.gradient} flex items-center justify-center flex-shrink-0 text-white text-xs font-medium mt-0.5`}>
                    {index + 1}
                  </span>
                  <p className="text-dark-text/70 text-sm leading-relaxed">{cause}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col items-center gap-2 mb-8">
        <ElephantMascot mood="happy" size="lg" message="了解历史，预防未来！" />
      </div>
    </div>
  );
}