export const characterCount = (str: string) => {
  // Not strictly needed for the count, but why not normalize, if we can 😀
  const normalized = str.normalize();

  // Define regex selectors
  const variantsSelector = /[\u{fe00}-\u{fe0f}]/gu;
  const skinModifiers = /(?<!(\p{L}|^|\s|\p{Punctuation}))[\u{1f3fb}-\u{1f3ff}]/gu;
  const zeroJoinRegEx = /\u{200d}/gu;

  // Remove variants and modifiers.
  const purifiedStr = normalized
    .split(variantsSelector)
    .join("")
    .split(skinModifiers)
    .join("");

  //
  const splitWithZero = purifiedStr.split(zeroJoinRegEx);

  if (splitWithZero.length === 1) {
    return [...splitWithZero.join("")].length;
  }

  // Because an emoji that contains ZWJ can contain other text left and right from it
  // we need to count the entire text length from each part, then subtract one.
  // For example: "A 👩‍❤️‍👨 is two people and a heart" splits into  [ 'A 👩', '❤️', '👨 is two people and a heart' ]
  const total = splitWithZero.reduce((sum, curr, currIndex) => {
    if (currIndex === 0) return (sum += [...curr].length);
    sum += [...curr].length - 1;
    return sum;
  }, 0);

  return total;
};
