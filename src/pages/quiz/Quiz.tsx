import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, RotateCcw, Home, BookOpen, Sparkles } from 'lucide-react';
import type { Question } from '@/types';
import { questionBank } from '@/data/questionBank';
import { provinces } from '@/data/provinces';
import { useQuizStore } from '@/stores/quizStore';
import { useAppStore } from '@/stores/appStore';
import { generateQuizQuestion, generateQuizExplanation } from '@/services/aiService';
import ElephantMascot from '@/components/ElephantMascot';
import AILoading from '@/components/AILoading';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const OPTION_COLORS = [
  'border-blue-400 hover:bg-blue-50',
  'border-green-400 hover:bg-green-50',
  'border-yellow-400 hover:bg-yellow-50',
  'border-purple-400 hover:bg-purple-50',
];
const QUESTIONS_PER_ROUND = 10;
const AI_TRIGGER_INTERVAL = 3;

const difficultyOrder: Record<string, number> = { easy: 0, medium: 1, hard: 2 };

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function selectQuestions(province: string): Question[] {
  const provinceData = provinces.find((p) => p.name === province);
  const relatedDisasters = provinceData?.commonDisasters || [];

  const provinceMatched = questionBank.filter(
    (q) =>
      q.tags.provinces.includes(province) ||
      q.tags.disasterTypes.some((d) => relatedDisasters.includes(d)),
  );

  const others = questionBank.filter((q) => !provinceMatched.includes(q));

  let selected: Question[] = [];

  if (provinceMatched.length >= 5) {
    selected = shuffleArray(provinceMatched).slice(0, QUESTIONS_PER_ROUND);
  } else {
    selected = [...provinceMatched];
    const needed = QUESTIONS_PER_ROUND - selected.length;
    selected = [...selected, ...shuffleArray(others).slice(0, needed)];
  }

  if (selected.length > QUESTIONS_PER_ROUND) {
    selected = selected.slice(0, QUESTIONS_PER_ROUND);
  }

  selected.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);

  return selected;
}

type ElephantMood = 'happy' | 'sad' | 'thinking' | 'excited' | 'worried' | 'neutral';

export default function Quiz() {
  const { province } = useAppStore();
  const { score, setScore, totalAnswered, setTotalAnswered, showExplanation, setShowExplanation, userAnswer, setUserAnswer, resetQuiz } = useQuizStore();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [elephantMood, setElephantMood] = useState<ElephantMood>('thinking');
  const [elephantMessage, setElephantMessage] = useState('准备好了吗？');
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiQuestionLoading, setAiQuestionLoading] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'wrong' | 'encourage' | null>(null);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);

  const aiQuestionInserted = useRef(false);
  const answeredKnowledgePoints = useRef<string[]>([]);

  const currentQuestion = questions[currentIndex] || null;

  const initQuiz = useCallback(() => {
    resetQuiz();
    const selected = selectQuestions(province);
    setQuestions(selected);
    setCurrentIndex(0);
    setIsFinished(false);
    setElephantMood('thinking');
    setElephantMessage('准备好了吗？');
    setAiExplanation(null);
    setAiLoading(false);
    setAiQuestionLoading(false);
    setIsAnswered(false);
    setFeedbackMessage(null);
    setFeedbackType(null);
    setConsecutiveCorrect(0);
    aiQuestionInserted.current = false;
    answeredKnowledgePoints.current = [];
  }, [province, resetQuiz]);

  useEffect(() => {
    initQuiz();
  }, [initQuiz]);

  useEffect(() => {
    if (!isAnswered && currentQuestion) {
      setElephantMood('thinking');
      setElephantMessage('仔细想想，选哪个呢？');
    }
  }, [currentIndex, isAnswered, currentQuestion]);

  const tryGenerateAIQuestion = useCallback(async () => {
    if (aiQuestionInserted.current) return;
    if (answeredKnowledgePoints.current.length === 0) return;

    const knowledgePoint =
      answeredKnowledgePoints.current[
        Math.floor(Math.random() * answeredKnowledgePoints.current.length)
      ];

    setAiQuestionLoading(true);
    setElephantMood('thinking');
    setElephantMessage('小象正在出一道新题...');

    try {
      const result = await generateQuizQuestion(knowledgePoint, province || '中国');
      if (result.parsedJSON) {
        const { question, options, answer, explanation } = result.parsedJSON as {
          question: string;
          options: string[];
          answer: number;
          explanation: string;
        };
        if (
          question &&
          Array.isArray(options) &&
          options.length === 4 &&
          typeof answer === 'number' &&
          answer >= 0 &&
          answer <= 3 &&
          explanation
        ) {
          const aiQuestion: Question = {
            id: `ai-${Date.now()}`,
            question,
            options,
            answer,
            explanation,
            tags: {
              provinces: [province],
              disasterTypes: [],
              knowledgePoints: [knowledgePoint],
            },
            difficulty: 'medium',
          };

          setQuestions((prev) => {
            const remaining = prev.slice(currentIndex + 1);
            const newQuestions = [...prev.slice(0, currentIndex + 1), aiQuestion, ...remaining];
            return newQuestions.slice(0, QUESTIONS_PER_ROUND + 1);
          });

          aiQuestionInserted.current = true;
        }
      }
    } catch {
      // AI生成失败则跳过
    } finally {
      setAiQuestionLoading(false);
    }
  }, [province, currentIndex]);

  const handleAnswer = useCallback(
    async (answerIndex: number) => {
      if (isAnswered || !currentQuestion) return;

      setIsAnswered(true);
      setUserAnswer(answerIndex);
      setShowExplanation(true);
      setTotalAnswered(totalAnswered + 1);

      const isCorrect = answerIndex === currentQuestion.answer;

      if (isCorrect) {
        setScore(score + 1);
        const newConsecutive = consecutiveCorrect + 1;
        setConsecutiveCorrect(newConsecutive);
        
        if (newConsecutive >= 2) {
          const encouragements = [
            '太厉害了！继续保持！',
            '你真是安全小达人！',
            '连续答对，厉害极了！',
            '知识掌握得真牢固！',
            '继续保持这个势头！',
          ];
          setFeedbackMessage(encouragements[Math.floor(Math.random() * encouragements.length)]);
          setFeedbackType('encourage');
          setElephantMood('excited');
          setElephantMessage('太棒了！');
        } else {
          setFeedbackMessage('答对了！');
          setFeedbackType('correct');
          const mood: ElephantMood = Math.random() > 0.5 ? 'happy' : 'excited';
          setElephantMood(mood);
          setElephantMessage('太棒了！');
        }
      } else {
        setConsecutiveCorrect(0);
        setFeedbackMessage('再接再厉！');
        setFeedbackType('wrong');
        setElephantMood('sad');
        setElephantMessage('我们看看正确答案是什么~');
      }

      const kps = currentQuestion.tags.knowledgePoints;
      answeredKnowledgePoints.current.push(...kps);

      // 每答完3题尝试AI出题
      if ((totalAnswered + 1) % AI_TRIGGER_INTERVAL === 0) {
        tryGenerateAIQuestion();
      }

      // AI扩展解析
      setAiLoading(true);
      try {
        const result = await generateQuizExplanation(
          currentQuestion.question,
          currentQuestion.options[answerIndex],
          currentQuestion.options[currentQuestion.answer],
        );
        if (result.parsedJSON) {
          const { additionalKnowledge } = result.parsedJSON as { additionalKnowledge?: string };
          if (additionalKnowledge) {
            setAiExplanation(additionalKnowledge);
          }
        } else if (result.content && !result.content.includes('API') && !result.content.includes('配置')) {
          setAiExplanation(result.content);
        }
      } catch {
        // AI解析失败则跳过
      } finally {
        setAiLoading(false);
      }
    },
    [isAnswered, currentQuestion, score, setScore, totalAnswered, setTotalAnswered, setUserAnswer, setShowExplanation, tryGenerateAIQuestion, consecutiveCorrect],
  );

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setIsFinished(true);
      const finalScore = score;
      const total = questions.length;
      const rate = finalScore / total;
      if (rate >= 0.8) {
        setElephantMood('excited');
        setElephantMessage('你太厉害了！安全小达人！');
      } else if (rate >= 0.6) {
        setElephantMood('happy');
        setElephantMessage('不错哦，继续加油！');
      } else if (rate >= 0.4) {
        setElephantMood('worried');
        setElephantMessage('还需要多学习哦~');
      } else {
        setElephantMood('sad');
        setElephantMessage('安全知识很重要，再来一次吧！');
      }
      return;
    }

    setCurrentIndex(currentIndex + 1);
    setUserAnswer(null);
    setShowExplanation(false);
    setAiExplanation(null);
    setAiLoading(false);
    setIsAnswered(false);
    setFeedbackMessage(null);
    setFeedbackType(null);
  }, [currentIndex, questions.length, score, setUserAnswer, setShowExplanation]);

  const handleRestart = useCallback(() => {
    initQuiz();
  }, [initQuiz]);

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <ElephantMascot mood="thinking" size="lg" />
        <p className="text-dark-text/60">正在准备题目...</p>
      </div>
    );
  }

  if (isFinished) {
    const accuracy = Math.round((score / questions.length) * 100);

    return (
      <div className="flex flex-col items-center gap-6 py-8 max-w-lg mx-auto">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <ElephantMascot mood={elephantMood} size="lg" message={elephantMessage} />
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 w-full text-center"
        >
          <h2 className="font-title text-2xl text-brand-orange mb-6">答题完成！</h2>

          <div className="flex justify-center gap-8 mb-6">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-brand-orange">{score}</span>
              <span className="text-dark-text/50 text-sm mt-1">答对题数</span>
            </div>
            <div className="w-px bg-gray-200" />
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-dark-text">{questions.length}</span>
              <span className="text-dark-text/50 text-sm mt-1">总题数</span>
            </div>
            <div className="w-px bg-gray-200" />
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-safety-green">{accuracy}%</span>
              <span className="text-dark-text/50 text-sm mt-1">正确率</span>
            </div>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-3 mb-6 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${accuracy}%` }}
              transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${accuracy >= 60 ? 'bg-safety-green' : 'bg-danger-red'}`}
            />
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleRestart}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand-orange text-white font-medium hover:bg-brand-orange/90 transition-colors"
            >
              <RotateCcw size={18} />
              再来一轮
            </button>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gray-100 text-dark-text/70 font-medium hover:bg-gray-200 transition-colors no-underline"
            >
              <Home size={18} />
              返回首页
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-5xl mx-auto">
      {/* 左侧/上方：题目区域 */}
      <div className="flex-1 flex flex-col gap-4">
        {/* 进度条 */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-brand-orange"
              initial={false}
              animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-sm text-dark-text/60 whitespace-nowrap">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        {/* 题目卡片 */}
        {currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-orange text-white text-sm font-bold">
                {currentIndex + 1}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-dark-text/50">
                {currentQuestion.difficulty === 'easy'
                  ? '简单'
                  : currentQuestion.difficulty === 'medium'
                    ? '中等'
                    : '困难'}
              </span>
            </div>

            <h3 className="text-lg font-medium text-dark-text leading-relaxed mb-4">
              {currentQuestion.question}
            </h3>

            {/* 反馈提示 */}
            <AnimatePresence>
              {feedbackMessage && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0, y: -20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.5, opacity: 0, y: -20 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`mb-4 py-3 px-4 rounded-xl text-center font-bold text-lg ${
                    feedbackType === 'correct'
                      ? 'bg-safety-green/20 text-safety-green border border-safety-green/30'
                      : feedbackType === 'encourage'
                        ? 'bg-brand-orange/20 text-brand-orange border border-brand-orange/30'
                        : 'bg-danger-red/20 text-danger-red border border-danger-red/30'
                  }`}
                >
                  {feedbackMessage}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 选项 */}
            <div className="flex flex-col gap-3">
              {currentQuestion.options.map((option, idx) => {
                const isCorrect = idx === currentQuestion.answer;
                const isSelected = userAnswer === idx;
                const isWrongSelection = isAnswered && isSelected && !isCorrect;

                let optionStyle = OPTION_COLORS[idx];
                if (isAnswered) {
                  if (isCorrect) {
                    optionStyle = 'border-safety-green bg-safety-green/10';
                  } else if (isWrongSelection) {
                    optionStyle = 'border-danger-red bg-danger-red/10';
                  } else {
                    optionStyle = 'border-gray-200 opacity-50';
                  }
                }

                return (
                  <motion.button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={isAnswered}
                    className={`flex items-center gap-3 w-full p-4 rounded-xl border-2 text-left transition-all ${optionStyle} ${
                      !isAnswered ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'
                    }`}
                    whileHover={!isAnswered ? { scale: 1.02, y: -2 } : {}}
                    whileTap={!isAnswered ? { scale: 0.98 } : {}}
                    animate={
                      isAnswered && isCorrect
                        ? { scale: [1, 1.03, 1] }
                        : isAnswered && isWrongSelection
                          ? { x: [0, -8, 8, -6, 6, -3, 3, 0] }
                          : {}
                    }
                    transition={
                      isAnswered && isCorrect
                        ? { duration: 0.4 }
                        : isAnswered && isWrongSelection
                          ? { duration: 0.5 }
                          : { duration: 0.15 }
                    }
                  >
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        isAnswered && isCorrect
                          ? 'bg-safety-green text-white'
                          : isAnswered && isWrongSelection
                            ? 'bg-danger-red text-white'
                            : 'bg-gray-100 text-dark-text/60'
                      }`}
                    >
                      {OPTION_LABELS[idx]}
                    </span>
                    <span
                      className={`text-sm leading-relaxed ${
                        isAnswered && isCorrect
                          ? 'text-safety-green font-medium'
                          : isAnswered && isWrongSelection
                            ? 'text-danger-red font-medium'
                            : 'text-dark-text/80'
                      }`}
                    >
                      {option}
                    </span>
                    {isAnswered && isCorrect && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto text-safety-green text-lg"
                      >
                        ✓
                      </motion.span>
                    )}
                    {isAnswered && isWrongSelection && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto text-danger-red text-lg"
                      >
                        ✗
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* 解析区域 */}
        <AnimatePresence>
          {showExplanation && currentQuestion && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={16} className="text-brand-orange" />
                  <span className="font-medium text-dark-text">解析</span>
                </div>
                <p className="text-sm text-dark-text/70 leading-relaxed mb-3">
                  {currentQuestion.explanation}
                </p>

                {/* AI扩展解析 */}
                {aiLoading && (
                  <div className="border-t border-gray-100 pt-3 mt-3">
                    <AILoading text="小象正在补充知识..." />
                  </div>
                )}

                {aiExplanation && !aiLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-t border-gray-100 pt-3 mt-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={14} className="text-brand-orange" />
                      <span className="text-sm font-medium text-brand-orange">小象补充知识</span>
                    </div>
                    <p className="text-sm text-dark-text/70 leading-relaxed">{aiExplanation}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 下一题按钮 */}
        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <button
                onClick={handleNext}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-brand-orange text-white font-medium hover:bg-brand-orange/90 transition-colors"
              >
                {currentIndex + 1 >= questions.length ? '查看成绩' : '下一题'}
                <ChevronRight size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 右侧/下方：小象区域 */}
      <div className="lg:w-64 flex flex-col items-center gap-4 lg:sticky lg:top-20 lg:self-start">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col items-center gap-3 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={elephantMood}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ElephantMascot mood={elephantMood} size="lg" message={elephantMessage} />
            </motion.div>
          </AnimatePresence>

          {aiQuestionLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-sm text-brand-orange/70"
            >
              <Sparkles size={14} className="animate-pulse" />
              <span>正在生成新题目...</span>
            </motion.div>
          )}

          <div className="w-full border-t border-gray-100 pt-3 mt-1">
            <div className="flex justify-between text-sm">
              <span className="text-dark-text/50">当前得分</span>
              <span className="font-bold text-brand-orange">{score}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-dark-text/50">已答题数</span>
              <span className="font-medium text-dark-text">{totalAnswered}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
