import { useQuiz } from '../model/use-quiz';
import { BriefScreen } from './brief-screen';
import { LandingScreen } from './landing-screen';
import { QuestionScreen } from './question-screen';
import { ResultScreen } from './result-screen';

export const Quiz = () => {
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
  } = useQuiz();

  if (screen === 'landing') {
    return <LandingScreen onStart={goToBrief} />;
  }

  if (screen === 'brief') {
    return <BriefScreen totalQuestions={totalQuestions} onStart={startQuiz} />;
  }

  if (screen === 'quiz' && currentQuestion) {
    return (
      <QuestionScreen
        key={questionIndex}
        question={currentQuestion}
        questionIndex={questionIndex}
        totalQuestions={totalQuestions}
        onAnswer={answerQuestion}
        onBack={goBack}
        onExit={exitQuiz}
      />
    );
  }

  if (screen === 'result' && result) {
    return <ResultScreen result={result} onRestart={restart} />;
  }

  return null;
};
