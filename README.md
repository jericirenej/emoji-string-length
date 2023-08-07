# Emoji string lengths

_**A modest contribution on how to count what is seen, not what is composed**_

## TLDR

To produce counts of Unicode strings that correspond to observed distinct graphical symbols, several reductive operations need to be performed on the original string.

We need to remove surrogate and variant encodings, as well as modifiers where appropriate. We also need to account for the Zero Width Joiner (ZWJ) connector. The final result can be seen in the [index.ts](https://github.com/jericirenej/emoji-string-length/blob/main/src/index.ts) file or at the bottom of this document.

## We count what we see

_But JavaScript does not_

A perceived piece of text is as long as the sum of its _discrete_ parts.

We expect that anything that we _recognize_ as a single unit - a letter, punctuation mark, or other distinct graphical signs - should also be taken as indivisible and counted, _one by one_, until we get to the end.

_Intuitively, this seems clear_. Just as the word `Hello` has 5 distinct letters, each of the following emojis: 💩, ❤️, 👋🏻, 🤽🏿‍♀️ or 👨‍👩‍👧‍👧 are perceived as distinct, single separate units. Consequently, counting the parts of the string `Hello 👋🏻` should amount to a `length` of 7.

**Except that's not the way this goes in JavaScript.**

```js
"👋🏻".length; // => Expected 1, got 4.
"👨‍👩‍👧‍👧".length; // => Expected 1, got 11.
"🤽🏿‍♀️".length; // => Expected 1, got 7.
"Hello 👋🏻".length; // => Expected 7, got 10.
"Family 👨‍👩‍👧‍👧".length; // => Expected 8, got 18.
```

Why does this discrepancy occur?

## From encoding to appearance

_The many are one_

The original length results above actually represent _a correct assessment of the required Unicode character combinations_ that produce the observed symbols. The `length` operation does not count what we immediately expect - the final visual units result - but rather _all the bits and pieces that are combined together to compose that final appearance_: a pale hand, a family, a woman playing waterpolo.

**That simple symbols are actually composed from more primitive ones should be very familiar idea**. When we learned to write, we saw that every letter was composed from different lines. The single letter `I` is drawn with a single line, the single letter `H` by a combination of three different lines `|, -, |`.

Outputting other symbols, such as emojis, can also require composition. A waving hand emoji can have a skin color modifier. A waterpolo player can be gendered (a woman) with a medium dark skin tone. A heart can have a red color variant. And so on...

To help us understand how to count what we see and perceive-as-distinct, different explanations, proposals, and strategies have been made, with varying degrees of success and flexibility.[^1] This article attempts to build on that and offer a relatively compact function that will allow for counting the length-as-perceived of many different Unicode strings, particularly when they contain emoji characters.[^2]

Obviously, it isn't perfect ☝️

Obviously, any suggestions are welcome 😀

## Count rules

_Ignore that which will not be seen_

In our - admittedly anecdotal - tests we have always observed that string counts are at least as long as the number of symbols that we expect to _see_, but that they can sometimes overshoot. We have not observed counts that would be _lower_ than the number of final symbols.

The extra counts are due to characters which _modify_ or _connect_ characters, which have an effect on the final appearance, but do not appear by themselves as separate symbols.

Therefore, there are two main sets of rules that will guide our code structure:

**Modifiers should generally be ignored**

- Surrogate pairs (combination of two characters to generate a single symbol with the aim of expanding the Unicode space)[^3] should be ignored, as the pair express a single visual entity.
- Variant encodings (for example the encoding for the red heart emoji) should be fused together with the character whose variation they represent and should have no visual meaning apart from them.
- Similarly, skin tone selectors augment another body part emoji and are fused with that appearance.
  - **Exception**: For modifiers with its own graphical representation (like the skin tone modifier), these should count as distinct if used on their own.

**Connector sequences should suspend the count**

- Zero width joiner (ZWJ) indicates that the previous and subsequent standalone symbols should be treated as a single unit.
- A connector sequence is defined by a chain of single graphics connected linked by the ZWJ.
  - For example, a variant of the family emoji (👨‍👩‍👧‍👧) is composed of four standalone symbols ('👨', '👩','👧', '👧'), connected by the ZWJ. All of these distinct elements are combined together visually and count-as-one due to their connection with a ZWJ.

## Code implementation

## The parts

- **Remove surrogate pairs**: Spreading the string into an array (`[...str]`) will remove any surrogate pairs (the infamous `"💩".length` equals 2 issue).
- **Remove variant selectors**: The spread will not remove the variant encodings (the encoding that makes the 🤍 emoji into a red ❤️ symbol), however, so these still return a count of 2. To address that, we _split_ the string on a regular expression (regex) which captures these encodings (`/[\u{fe00}-\u{fe0f}]/gu`). After splitting string and then joining it again, the variants will be removed (`str.split(regex).join("")`).
- **Remove modifiers**: Same splitting approach, with a twist. We still want to count the modifiers, if they only represent themselves - and thus appear - and do not modify anything else. Our splitter is therefore a composite:

  - _Modifier capture_: here we are limiting ourselves to skin modifiers, but it's easy to extrapolate to other cases: `[\u{1f3fb}-\u{1f3ff}]`.
  - _Negative lookbehind_: We presuppose that a modifier comes after the thing it modifies. Therefore, it should not be preceded by a space, or be placed on the beginning of the line. We also presuppose that modifiers do not modify ordinary script letters. So the lookbehind assertion, that condition whether or not a modifier gets captured, will be: `(?<!(\p{L}|^|\s|\p{Punctuation}))`
  - _Final regex_: `/(?<!(\p{L}|^|\s|\p{Punctuation}))[\u{1f3fb}-\u{1f3ff}]/gu`

- **Account for ZWJ**:

  - After removing surrogates, variants, and modifiers, we lastly split the string on the ZWJ capture regex: `/\u{200d}/gu`
  - If the split length is 1, we have no ZWJ and can safely join the filtered string, spread it and count its length.
  - Otherwise we calculate the length of the array by reducing it in the following way:

    - For the first element, we take its length.
    - For subsequent element, we add its length, _then subtract 1_ to adjust for the fact that the current element forms a single unit with the previous one via the ZWJ.

## The whole deal

```ts
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
```

[^1]:
    For example, the well known ["💩".length === 2](https://blog.jonnew.com/posts/poo-dot-length-equals-two) webpage does a terrific job of explaining the different peculiarities of trying to count the length of Unicode encoded text.

    However, when it comes to resolving the issue of the ZWJ, it will not count correctly whenever the inspected string has more than one character. In those cases it will even return fractional values! It will also fail for cases in which modifiers are used, for example the skin modifier.

    To observe these discrepancies, take a look at the example [test suite](https://github.com/jericirenej/emoji-string-length/blob/main/src/test/external-implementations.spec.ts).

[^2]: There are a number of great sources that deal with the intersection of Unicode and JavaScript. Besides the already referenced ["💩".length === 2](https://blog.jonnew.com/posts/poo-dot-length-equals-two), you're invited to also take a look at [The Absolute Minimum Every Software Developer Absolutely, Positively Must Know About Unicode and Character Sets (No Excuses!)](https://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/), [What every JavaScript developer should know about Unicode](https://dmitripavlutin.com/what-every-javascript-developer-should-know-about-unicode/), and [JavaScript has a Unicode problem](https://mathiasbynens.be/notes/javascript-unicode).
[^3]: See [Surrogate pairs and variation selectors](https://learn.microsoft.com/en-us/globalization/encoding/surrogate-pairs)
