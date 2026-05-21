import { clsx } from 'clsx';
import { useState } from 'react';
import styles from './animated-emoji.module.css';
import { getEmojiUrl } from './emoji-utils';

interface AnimatedEmojiProps {
  emoji: string;
  className?: string;
}

export const AnimatedEmoji = ({ emoji, className }: AnimatedEmojiProps) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span className={clsx(styles.fallback, className)}>{emoji}</span>;
  }

  return (
    <img
      src={getEmojiUrl(emoji)}
      alt={emoji}
      className={clsx(styles.image, className)}
      onError={() => setFailed(true)}
    />
  );
};
