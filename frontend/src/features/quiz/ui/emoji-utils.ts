export function getEmojiUrl(emoji: string): string {
  const codepoints = [...emoji].map((char) => char.codePointAt(0)!.toString(16)).join('_');
  return `https://fonts.gstatic.com/s/e/notoemoji/latest/${codepoints}/512.webp`;
}
