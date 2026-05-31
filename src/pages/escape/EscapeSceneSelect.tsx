import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { School, Hospital, Film } from 'lucide-react';
import ElephantMascot from '@/components/ElephantMascot';
import AILoading from '@/components/AILoading';
import { useGameStore } from '@/stores/gameStore';
import { mapTemplates } from '@/data/mapTemplates';
import type { MapTemplate } from '@/types';

const scenes = [
  {
    id: 'school-classroom',
    name: '学校教室',
    icon: School,
    color: 'from-orange-400 to-red-400',
    disasterTag: '模拟火灾',
  },
  {
    id: 'hospital',
    name: '医院',
    icon: Hospital,
    color: 'from-orange-400 to-yellow-400',
    disasterTag: '模拟火灾',
  },
  {
    id: 'cinema',
    name: '电影院',
    icon: Film,
    color: 'from-orange-400 to-pink-400',
    disasterTag: '模拟火灾',
  },
];

export default function EscapeSceneSelect() {
  const navigate = useNavigate();
  const { resetGame, setCurrentMap, setDifficulty } = useGameStore();
  const [loading, setLoading] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');

  const difficulties = [
    { value: 'easy', label: '简单', description: '火焰每7秒蔓延一次' },
    { value: 'normal', label: '普通', description: '火焰每5秒蔓延一次' },
    { value: 'hard', label: '困难', description: '火焰每3秒蔓延一次' },
  ];

  const handleSceneClick = async (sceneId: string) => {
    setLoading(true);
    const template = mapTemplates.find((t) => t.id === sceneId) as MapTemplate;
    resetGame();

    useGameStore.setState({
      playerPosition: template.startPoint,
      timeRemaining: 120,
    });
    setDifficulty(selectedDifficulty);
    setCurrentMap(template);

    setLoading(false);
    navigate('/escape/game');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <AILoading text="小象正在为你准备逃生场景..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 pb-20 md:pb-0">
      <div className="text-center flex flex-col items-center gap-3">
        <h1 className="font-title text-3xl md:text-4xl text-brand-orange">
          紧急逃生演练
        </h1>
      </div>

      <div className="flex flex-col items-center gap-2">
        <ElephantMascot
          mood="excited"
          size="md"
          message="选择难度，然后选一个地方开始演练！"
        />
      </div>

      <div className="w-full max-w-3xl mb-6">
        <h3 className="font-title text-lg text-dark-text mb-3 text-center">选择难度</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {difficulties.map((diff) => {
            const isSelected = selectedDifficulty === diff.value;
            return (
              <button
                key={diff.value}
                onClick={() => setSelectedDifficulty(diff.value as any)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-brand-orange bg-brand-orange/10'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-dark-text">{diff.label}</div>
                <div className="text-sm text-dark-text/60 mt-1">{diff.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-3xl">
        {scenes.map((scene) => {
          const Icon = scene.icon;
          return (
            <motion.button
              key={scene.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSceneClick(scene.id)}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow text-left"
            >
              <div
                className={`bg-gradient-to-br ${scene.color} p-6 flex items-center justify-center`}
              >
                <Icon size={48} className="text-white" />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-dark-text text-lg">
                  {scene.name}
                </h3>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-danger-red/10 text-danger-red text-xs font-medium">
                    {scene.disasterTag}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
