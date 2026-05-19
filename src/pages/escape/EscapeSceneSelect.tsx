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
  const { resetGame, setCurrentMap } = useGameStore();
  const [loading, setLoading] = useState(false);

  const handleSceneClick = async (sceneId: string) => {
    setLoading(true);
    const template = mapTemplates.find((t) => t.id === sceneId) as MapTemplate;
    resetGame();

    useGameStore.setState({
      playerPosition: template.startPoint,
      timeRemaining: 120,
    });
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
          message="选一个地方，我们开始演练吧！每个场景都会有火灾和地震的风险。"
        />
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
