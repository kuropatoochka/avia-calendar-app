import type { AnswerScores, Question } from '../model/types';
import { ArrowLeftOutlined, CloseOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { Button, Popconfirm, Progress } from 'antd';
import { useState } from 'react';
import { getEmojiUrl } from './emoji-utils';
import styles from './question-screen.module.css';

function getEmojiStaticUrl(emoji: string): string {
  const codepoints = [...emoji]
    .map((char) => char.codePointAt(0)!)
    .filter((cp) => cp !== 0xfe0f && cp !== 0xfe0e) // strip variation selectors — Noto PNG filenames don't include them
    .map((cp) => cp.toString(16))
    .join('_');
  return `https://cdn.jsdelivr.net/gh/googlefonts/noto-emoji@main/png/128/emoji_u${codepoints}.png`;
}

function AnswerEmoji({ emoji }: { emoji: string }) {
  const [staticFailed, setStaticFailed] = useState(false);
  const [animatedFailed, setAnimatedFailed] = useState(false);

  const wrapperClass = [
    styles.emojiWrapper,
    staticFailed && styles.emojiAlwaysAnimated,
    animatedFailed && styles.emojiStaticOnly,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={wrapperClass}>
      {!staticFailed && (
        <img
          className={styles.emojiStatic}
          src={getEmojiStaticUrl(emoji)}
          alt={emoji}
          onError={() => setStaticFailed(true)}
        />
      )}
      {!animatedFailed && (
        <img
          className={styles.emojiAnimated}
          src={getEmojiUrl(emoji)}
          alt=""
          aria-hidden="true"
          onError={() => setAnimatedFailed(true)}
        />
      )}
    </span>
  );
}

interface QuestionScreenProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (scores: AnswerScores) => void;
  onBack: () => void;
  onExit: () => void;
}

export const QuestionScreen = ({
  question,
  questionIndex,
  totalQuestions,
  onAnswer,
  onBack,
  onExit,
}: QuestionScreenProps) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [pendingScores, setPendingScores] = useState<AnswerScores | null>(null);
  const [pendingFlash, setPendingFlash] = useState<string | undefined>(undefined);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  const isLocked = flashMessage !== null;
  const progress = (questionIndex / totalQuestions) * 100;
  const current = questionIndex + 1;

  const handleSelect = (answerId: string, scores: AnswerScores, flash?: string) => {
    if (isLocked) return;
    setSelected(answerId);
    setPendingScores(scores);
    setPendingFlash(flash);
  };

  const handleNext = () => {
    if (!pendingScores || isLocked) return;
    if (pendingFlash) {
      setFlashMessage(pendingFlash);
      setTimeout(() => {
        setFlashMessage(null);
        onAnswer(pendingScores);
      }, 1600);
    } else {
      onAnswer(pendingScores);
    }
  };

  return (
    <div className={styles.wrapper}>
      {flashMessage && (
        <div className={styles.flash}>
          <span className={styles.flashText}>{flashMessage}</span>
        </div>
      )}

      <div className={styles.topBar}>
        <Button
          type="text"
          size="small"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          disabled={isLocked}
          aria-label="Назад"
        />
        <span className={styles.counter}>
          {current} / {totalQuestions}
        </span>
        <div className={styles.progressWrapper}>
          <Progress
            percent={progress}
            showInfo={false}
            strokeColor="#FF6B4A"
            trailColor="#E8E8E8"
            size={{ height: 3 }}
            style={{ margin: 0 }}
          />
        </div>
        <Popconfirm
          title="Выйти из опроса?"
          description="Прогресс не сохранится"
          onConfirm={onExit}
          okText="Выйти"
          cancelText="Остаться"
          placement="bottomRight"
          disabled={isLocked}
          icon={<ExclamationCircleFilled style={{ color: '#FF6B4A' }} />}
          overlayClassName={styles.exitPopconfirm}
        >
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            disabled={isLocked}
            aria-label="Выйти"
          />
        </Popconfirm>
      </div>

      <div className={styles.content}>
        <h2 className={styles.title}>{question.title}</h2>

        <div className={styles.grid}>
          {question.answers.map((answer) => {
            const isSelected = selected === answer.id;

            return (
              <button
                key={answer.id}
                className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
                onClick={() => handleSelect(answer.id, answer.scores, answer.flashMessage)}
                disabled={isLocked}
              >
                <AnswerEmoji emoji={answer.emoji} />
                <span className={styles.label}>{answer.label}</span>
                {answer.sublabel && <span className={styles.sublabel}>{answer.sublabel}</span>}
              </button>
            );
          })}
        </div>

        <div className={styles.footer}>
          <Button
            className={styles.nextButton}
            onClick={handleNext}
            disabled={!selected || isLocked}
          >
            Далее
          </Button>
        </div>
      </div>
    </div>
  );
};
