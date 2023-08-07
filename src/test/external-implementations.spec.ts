/** The final `fancyCount` example from the ["💩".length === 2](https://blog.jonnew.com/posts/poo-dot-length-equals-two) webpage */
export const fancyCount = (str: string) => {
  const joiner = "\u{200D}";
  const split = str.split(joiner);
  let count = 0;
  for (const s of split) {
    //removing the variation selectors
    const num = Array.from(s.split(/[\ufe00-\ufe0f]/).join("")).length;
    count += num;
  }

  //assuming the joiners are used appropriately
  return count / split.length;
};

describe("Original fancy count", () => {
  it("Should fail tor return proper length", () => {
    const expectedFails: [string, number][] = [
      ["🤽🏿‍♀️", 1],
      ["Water Polo Woman: 🤽🏿‍♀️", 19],
      ["This is a family: 👨‍👩‍👧‍👧", 19],
    ];

    for (const [val, expected] of expectedFails) {
      const count = fancyCount(val);
      console.log("EXPECTED:", expected, "\nRECEIVED:", count);
      expect(count).not.toBe(expected);
    }
  });
});
