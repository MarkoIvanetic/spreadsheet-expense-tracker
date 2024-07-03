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

export const runSysCheck = async () => {
  console.log("SysCheck started...");

  // try {
  //   const promptText = "Paid $22.25 at Konzum Spent today: $30.0";
  //   const category = await recognizeCategory(promptText);
  //   console.log("category:", category);
  // } catch (error: any) {
  //   console.log("SysCheck failed::", error.message);
  // }
};
