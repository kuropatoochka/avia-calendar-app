import type { AnswerScores, DestinationKey, QuizScreen } from './types';
import { useState } from 'react';
import { getQuizResult } from './get-result';
import { QUESTIONS } from './quiz-data';

interface QuizState {
  screen: QuizScreen;
  questionIndex: number;
  collectedScores: AnswerScores[];
  result: DestinationKey | null;
}

const INITIAL_STATE: QuizState = {
  screen: 'landing',
  questionIndex: 0,
  collectedScores: [],
  result: null,
};

export const useQuiz = () => {
  const [state, setState] = useState<QuizState>(INITIAL_STATE);

  const goToBrief = () => {
    setState((prev) => ({ ...prev, screen: 'brief' }));
  };

  const startQuiz = () => {
    setState((prev) => ({ ...prev, screen: 'quiz', questionIndex: 0, collectedScores: [] }));
  };

  const answerQuestion = (scores: AnswerScores) => {
    const nextScores = [...state.collectedScores, scores];
    const isLast = state.questionIndex === QUESTIONS.length - 1;

    if (isLast) {
      const result = getQuizResult(nextScores);
      setState((prev) => ({ ...prev, collectedScores: nextScores, screen: 'result', result }));
    } else {
      setState((prev) => ({
        ...prev,
        collectedScores: nextScores,
        questionIndex: prev.questionIndex + 1,
      }));
    }
  };

  const goBack = () => {
    if (state.questionIndex === 0) {
      setState((prev) => ({ ...prev, screen: 'brief' }));
    } else {
      setState((prev) => ({
        ...prev,
        questionIndex: prev.questionIndex - 1,
        collectedScores: prev.collectedScores.slice(0, -1),
      }));
    }
  };

  const exitQuiz = () => {
    setState(INITIAL_STATE);
  };

  const restart = () => {
    setState(INITIAL_STATE);
  };

  const goToDeals = () => {
    setState((prev) => ({ ...prev, screen: 'deals' }));
  };

  return {
    screen: state.screen,
    questionIndex: state.questionIndex,
    totalQuestions: QUESTIONS.length,
    currentQuestion: QUESTIONS[state.questionIndex],
    result: state.result,
    goToBrief,
    startQuiz,
    answerQuestion,
    goBack,
    exitQuiz,
    restart,
    goToDeals,
  };
};
