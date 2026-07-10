import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Home, Trophy } from 'lucide-react';
import ElephantMascot from '@/components/ElephantMascot';

interface Question {
  question: string;
  correctAnswer: string;
  wrongAnswer: string;
}

const questions: Question[] = [
  { question: '发生火灾时，应该朝哪个方向逃生？', correctAnswer: '逆风方向', wrongAnswer: '顺风方向' },
  { question: '地震发生时，在室内应该怎么做？', correctAnswer: '躲在桌子下', wrongAnswer: '跑到阳台上' },
  { question: '遇到泥石流，应该往哪个方向跑？', correctAnswer: '往山坡两侧', wrongAnswer: '顺着泥石流跑' },
  { question: '洪水来临时，应该往哪里撤离？', correctAnswer: '高地', wrongAnswer: '低洼处' },
  { question: '雷电天气时，应该远离什么？', correctAnswer: '大树', wrongAnswer: '房屋' },
  { question: '台风来临时，应该关闭什么？', correctAnswer: '门窗', wrongAnswer: '电灯' },
  { question: '火灾逃生时，应该怎么做？', correctAnswer: '弯腰低姿', wrongAnswer: '直立奔跑' },
  { question: '发现燃气泄漏，应该先做什么？', correctAnswer: '关闭阀门', wrongAnswer: '开灯检查' },
  { question: '地震后被困，应该怎么做？', correctAnswer: '敲击求救', wrongAnswer: '大声呼喊' },
  { question: '洪水围困时，应该使用什么求救？', correctAnswer: '鲜艳衣物', wrongAnswer: '手机关机' },
];

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export default function QuizBridgeGame() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'lost'>('start');
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [playerPosition, setPlayerPosition] = useState<'left' | 'center' | 'right'>('center');
  const [scrollY, setScrollY] = useState(0);
  const [showDoors, setShowDoors] = useState(false);
  const [answeredCorrect, setAnsweredCorrect] = useState<boolean | null>(null);
  const [doorAnswers, setDoorAnswers] = useState<{ left: string; right: string; correctSide: 'left' | 'right' } | null>(null);
  const [doorY, setDoorY] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isDying, setIsDying] = useState(false);
  
  const animationRef = useRef<number>(0);
  const gameOverRef = useRef(false);
  const scoreRef = useRef(0);
  const distanceRef = useRef(0);
  const speedRef = useRef(3);
  const doorSpawnedRef = useRef(false);
  const particleIdRef = useRef(0);

  const DOOR_SPAWN_Y = -200;
  const DOOR_DEATH_Y = 400;
  const PLAYER_Y = 420;

  const generateQuestion = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * questions.length);
    const question = questions[randomIndex];
    const isLeftCorrect = Math.random() > 0.5;
    
    setDoorAnswers({
      left: isLeftCorrect ? question.correctAnswer : question.wrongAnswer,
      right: isLeftCorrect ? question.wrongAnswer : question.correctAnswer,
      correctSide: isLeftCorrect ? 'left' : 'right',
    });
    
    setDoorY(DOOR_SPAWN_Y);
    doorSpawnedRef.current = true;
    
    return question;
  }, []);

  const createParticles = useCallback((x: number, y: number) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: particleIdRef.current++,
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 2,
        life: 1,
        color: `hsl(${Math.random() * 30 + 0}, 100%, ${Math.random() * 30 + 50}%)`,
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  const startGame = useCallback(() => {
    gameOverRef.current = false;
    scoreRef.current = 0;
    distanceRef.current = 0;
    speedRef.current = 3;
    doorSpawnedRef.current = false;
    setScore(0);
    setDistance(0);
    setPlayerPosition('center');
    setScrollY(0);
    setShowDoors(false);
    setAnsweredCorrect(null);
    setDoorAnswers(null);
    setDoorY(DOOR_SPAWN_Y);
    setParticles([]);
    setIsDying(false);
    setGameState('playing');
  }, []);

  const handleMove = useCallback((direction: 'left' | 'right') => {
    if (gameState !== 'playing' || isDying) return;
    setPlayerPosition(direction);
  }, [gameState, isDying]);

  useEffect(() => {
    if (gameState === 'playing') {
      setCurrentQuestion(generateQuestion());
      setTimeout(() => setShowDoors(true), 300);
    }
  }, [gameState, generateQuestion]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const animate = () => {
      if (gameOverRef.current) return;
      
      setScrollY(prev => prev + speedRef.current);
      setDistance(prev => prev + speedRef.current * 0.1);
      
      if (doorSpawnedRef.current) {
        setDoorY(prev => {
          const newY = prev + speedRef.current;
          
          if (showDoors && doorAnswers && playerPosition !== 'center') {
            if (newY > PLAYER_Y - 40 && newY < PLAYER_Y + 40) {
              if (playerPosition !== doorAnswers.correctSide) {
                setIsDying(true);
                const playerX = playerPosition === 'left' ? -72 : 72;
                createParticles(playerX + window.innerWidth / 2, PLAYER_Y);
                gameOverRef.current = true;
                setTimeout(() => {
                  setGameState('lost');
                }, 800);
              } else {
                setAnsweredCorrect(true);
                scoreRef.current += 100;
                setScore(scoreRef.current);
                distanceRef.current += 10;
                setDistance(distanceRef.current);
                speedRef.current = Math.min(speedRef.current + 0.2, 8);
                setShowDoors(false);
                doorSpawnedRef.current = false;
                
                setTimeout(() => {
                  setAnsweredCorrect(null);
                  setPlayerPosition('center');
                  setCurrentQuestion(generateQuestion());
                  setShowDoors(true);
                }, 300);
              }
            }
          }
          
          if (newY > DOOR_DEATH_Y && showDoors) {
            gameOverRef.current = true;
            setTimeout(() => {
              setGameState('lost');
            }, 500);
          }
          
          return newY;
        });
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [gameState, showDoors, doorAnswers, playerPosition, createParticles, generateQuestion]);

  useEffect(() => {
    if (particles.length === 0) return;
    
    const animateParticles = () => {
      setParticles(prev => {
        const updated = prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.2,
          life: p.life - 0.02,
        })).filter(p => p.life > 0);
        
        if (updated.length === 0) {
          return [];
        }
        return updated;
      });
      
      if (particles.length > 0) {
        requestAnimationFrame(animateParticles);
      }
    };
    
    animateParticles();
  }, [particles]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handleMove('left');
      } else if (e.key === 'ArrowRight') {
        handleMove('right');
      } else if (e.key === 'a' || e.key === 'A') {
        handleMove('left');
      } else if (e.key === 'd' || e.key === 'D') {
        handleMove('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-2 bg-gradient-to-b from-sky-400 to-sky-600">
      <div className="flex items-center justify-between mb-2">
        <Link
          to="/games"
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors no-underline"
        >
          <ArrowLeft size={20} />
          <span>返回游戏选择</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
            <span className="text-sm text-white/60">得分:</span>
            <span className="font-bold text-white">{Math.floor(score)}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
            <span className="text-sm text-white/60">距离:</span>
            <span className="font-bold text-white">{Math.floor(distance)}m</span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-300/50 to-transparent"></div>
          <div className="absolute top-4 left-10 w-20 h-20 bg-white/80 rounded-full blur-sm"></div>
          <div className="absolute top-8 right-20 w-16 h-16 bg-white/60 rounded-full blur-sm"></div>
          <div className="absolute top-12 left-1/3 w-24 h-24 bg-white/70 rounded-full blur-sm"></div>
        </div>

        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-full"
          style={{
            perspective: '1000px',
          }}
        >
          <div 
            className="relative w-full h-full"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateX(60deg) translateZ(-${scrollY * 0.3}px)`,
            }}
          >
            <div
              className="absolute left-0 right-0 h-[3000px]"
              style={{
                backgroundColor: '#808080',
                transform: 'translateZ(0)',
                borderLeft: '4px solid #606060',
                borderRight: '4px solid #606060',
                bottom: 0,
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-500 to-gray-600"></div>
              {[...Array(75)].map((_, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0 h-px bg-gray-500/30"
                  style={{
                    top: `${i * 40 - scrollY % 40}px`,
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
          <AnimatePresence>
            {!isDying && (
              <motion.div
                className="relative"
                animate={{
                  x: playerPosition === 'left' ? -72 : playerPosition === 'right' ? 72 : 0,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <div className="w-16 h-20 relative">
                  <div className="absolute bottom-0 w-12 h-8 bg-amber-100 rounded-lg left-2 border-2 border-amber-300"></div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-200 rounded-full border-2 border-amber-400"></div>
                  <div className="absolute top-2 left-2 w-2 h-2 bg-black rounded-full"></div>
                  <div className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full"></div>
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3 h-2 bg-pink-300 rounded-full"></div>
                  <motion.div 
                    className="absolute -left-3 top-4 w-4 h-6 bg-amber-200 rounded-full origin-right"
                    animate={{ rotate: playerPosition === 'left' ? -30 : 0 }}
                  ></motion.div>
                  <motion.div 
                    className="absolute -right-3 top-4 w-4 h-6 bg-amber-200 rounded-full origin-left"
                    animate={{ rotate: playerPosition === 'right' ? 30 : 0 }}
                  ></motion.div>
                </div>
                
                {answeredCorrect !== null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full font-bold ${
                      answeredCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}
                  >
                    {answeredCorrect ? '正确!' : '错误!'}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute w-3 h-3 rounded-full"
            style={{
              left: particle.x,
              top: particle.y,
              backgroundColor: particle.color,
              opacity: particle.life,
              boxShadow: `0 0 10px ${particle.color}`,
            }}
          />
        ))}

        <div className="absolute left-1/2 -translate-x-1/2" style={{ top: `${doorY}px` }}>
          <AnimatePresence>
            {showDoors && doorAnswers && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex gap-8"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMove('left')}
                  className={`relative w-28 h-40 rounded-t-lg border-4 shadow-xl ${
                    doorAnswers.correctSide === 'left' 
                      ? 'bg-gradient-to-b from-green-600 to-green-800 border-green-500' 
                      : 'bg-gradient-to-b from-red-600 to-red-800 border-red-500'
                  }`}
                >
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="absolute top-8 left-2 right-2 text-center">
                    <div className="text-white font-bold text-sm leading-tight">
                      {doorAnswers.left}
                    </div>
                  </div>
                  <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-10 rounded-b-md ${
                    doorAnswers.correctSide === 'left' ? 'bg-green-900' : 'bg-red-900'
                  }`}></div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMove('right')}
                  className={`relative w-28 h-40 rounded-t-lg border-4 shadow-xl ${
                    doorAnswers.correctSide === 'right' 
                      ? 'bg-gradient-to-b from-green-600 to-green-800 border-green-500' 
                      : 'bg-gradient-to-b from-red-600 to-red-800 border-red-500'
                  }`}
                >
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="absolute top-8 left-2 right-2 text-center">
                    <div className="text-white font-bold text-sm leading-tight">
                      {doorAnswers.right}
                    </div>
                  </div>
                  <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-10 rounded-b-md ${
                    doorAnswers.correctSide === 'right' ? 'bg-green-900' : 'bg-red-900'
                  }`}></div>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {currentQuestion && showDoors && (
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-xl border-2 border-blue-300 max-w-md text-center z-10"
            >
              <p className="text-dark-text font-medium text-lg">{currentQuestion.question}</p>
              <p className="text-dark-text/50 text-sm mt-2">按 ← → 或点击两侧移动，选择正确的门！</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleMove('left')}
            className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-white/50 active:bg-white/50"
          >
            ←
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleMove('right')}
            className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-white/50 active:bg-white/50"
          >
            →
          </motion.button>
        </div>

        {gameState === 'start' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trophy size={48} className="text-white" />
              </div>
              <h2 className="font-title text-3xl text-white mb-4">知识独木桥</h2>
              <p className="text-white/70 mb-6 max-w-md">
                站在独木桥上，回答灾害知识问题！<br/>
                选择正确的门继续前进，答错或超时则掉入深渊！
              </p>
              <div className="flex flex-col items-center gap-4">
                <ElephantMascot mood="excited" size="lg" message="准备好了吗？" />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl text-lg"
                >
                  开始游戏
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {gameState === 'lost' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-4xl">😱</span>
              </div>
              <h2 className="font-title text-3xl text-white mb-2">掉入深渊!</h2>
              <p className="text-white/70 mb-6">答错问题或时间耗尽，再接再厉！</p>
              <div className="bg-white/10 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <p className="text-white/50 text-sm">最终得分</p>
                    <p className="text-3xl font-bold text-white">{Math.floor(score)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/50 text-sm">前进距离</p>
                    <p className="text-3xl font-bold text-white">{Math.floor(distance)}m</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl"
                >
                  <RotateCcw size={20} />
                  再玩一次
                </motion.button>
                <Link
                  to="/games"
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-white/20 text-white font-medium rounded-xl hover:bg-white/30 transition-colors"
                >
                  <Home size={20} />
                  返回游戏选择
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}