import { clsx } from 'clsx';
import { useState } from 'react';
import styles from './animated-emoji.module.css';

interface AnimatedEmojiProps {
  emoji: string;
  className?: string;
}

function getEmojiUrl(emoji: string): string {
  const codepoints = [...emoji].map((char) => char.codePointAt(0)!.toString(16)).join('_');
  return `https://fonts.gstatic.com/s/e/notoemoji/latest/${codepoints}/512.webp`;
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
