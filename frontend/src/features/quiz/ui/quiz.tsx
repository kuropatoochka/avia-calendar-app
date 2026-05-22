import type { AnswerScores } from '../model/types';
import { useRef } from 'react';
import {
  Experiment,
  Goal,
  trackExperimentEvent,
  useLaunchExperiment,
} from '@/features/launch-experiment';
import { useQuiz } from '../model/use-quiz';
import { BriefScreen } from './brief-screen';
import { DealsScreen } from './deals-screen';
import { LandingScreen } from './landing-screen';
import { QuestionScreen } from './question-screen';
import { ResultScreen } from './result-screen';

export const Quiz = () => {
  const quizSessionIdRef = useRef<string | null>(null);

  const variant = useLaunchExperiment();
  const autoAdvance = variant === 'B';

  const {
    screen,
    questionIndex,
    totalQuestions,
    currentQuestion,
    result,
    goToBrief,
    startQuiz,
    answerQuestion,
    goBack,
    exitQuiz,
    restart,
    goToDeals,
  } = useQuiz();

  const getQuizSessionId = () => {
    if (!quizSessionIdRef.current) {
      quizSessionIdRef.current = crypto.randomUUID();
    }

    return quizSessionIdRef.current;
  };

  const handleStartQuiz = () => {
    quizSessionIdRef.current = crypto.randomUUID();
    startQuiz();
  };

  const handleAnswerQuestion = (scores: AnswerScores) => {
    const currentCount = questionIndex + 1;

    trackExperimentEvent({
      goal: Goal.QuizProgress,
      experiment: Experiment.QuizAutoAdvance,
      variant,
      params: {
        quiz_session_id: getQuizSessionId(),
        current_count: currentCount,
        total_count: totalQuestions,
      },
    });

    answerQuestion(scores);
  };

  const handleRestart = () => {
    quizSessionIdRef.current = null;
    restart();
  };

  if (screen === 'landing') {
    return <LandingScreen onStart={goToBrief} onBrowse={goToDeals} />;
  }

  if (screen === 'brief') {
    return <BriefScreen totalQuestions={totalQuestions} onStart={handleStartQuiz} />;
  }

  if (screen === 'quiz' && currentQuestion) {
    return (
      <QuestionScreen
        key={questionIndex}
        question={currentQuestion}
        questionIndex={questionIndex}
        totalQuestions={totalQuestions}
        autoAdvance={autoAdvance}
        onAnswer={handleAnswerQuestion}
        onBack={goBack}
        onExit={exitQuiz}
      />
    );
  }

  if (screen === 'result' && result) {
    return <ResultScreen result={result} onRestart={handleRestart} onDoubt={goToDeals} />;
  }

  if (screen === 'deals') {
    return <DealsScreen result={result} onRestart={handleRestart} />;
  }

  return null;
};
