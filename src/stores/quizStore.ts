import { create } from 'zustand';
import type { Question } from '@/types';

interface QuizStore {
  currentQuestion: Question | null;
  setCurrentQuestion: (question: Question | null) => void;
  score: number;
  setScore: (score: number) => void;
  totalAnswered: number;
  setTotalAnswered: (total: number) => void;
  showExplanation: boolean;
  setShowExplanation: (show: boolean) => void;
  userAnswer: number | null;
  setUserAnswer: (answer: number | null) => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizStore>((set) => ({
  currentQuestion: null,
  setCurrentQuestion: (currentQuestion) => set({ currentQuestion }),
  score: 0,
  setScore: (score) => set({ score }),
  totalAnswered: 0,
  setTotalAnswered: (totalAnswered) => set({ totalAnswered }),
  showExplanation: false,
  setShowExplanation: (showExplanation) => set({ showExplanation }),
  userAnswer: null,
  setUserAnswer: (userAnswer) => set({ userAnswer }),
  resetQuiz: () =>
    set({
      currentQuestion: null,
      score: 0,
      totalAnswered: 0,
      showExplanation: false,
      userAnswer: null,
    }),
}));
