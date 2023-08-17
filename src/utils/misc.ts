export const generateArray = (n: number) => {
  return Array.from(Array(n));
};

var emojiRegex = /\p{Emoji}/u;

export function getFirstEmoji(str: string | undefined) {
  if (!str) {
    return null;
  }

  var match = str.match(emojiRegex);

  if (match) {
    return match[0];
  } else {
    return null;
  }
}
