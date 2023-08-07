import { characterCount } from "../index";

const emojiTemplates: [string, number][] = [
  ["@", 1],
  ["Text and emoji @", 16],
  ["@ Text @", 8],
  ["@a", 2],
  ["Text .@, text @. @- @ ", 22],
];

const generateEmojiStrings = (e: string): [string, number][] =>
  emojiTemplates.map(([template, num]) => [template.replaceAll("@", e), num]);

describe("Original fancy count", () => {
  it("Should return proper length for base plane examples", () => {
    const testCases: [string, number][] = [
      // Basic latin
      [
        "0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[/]^_`abcdefghijklmnopqrstuvwxyz{|}~",
        79,
      ],
      // Latin Extended-A and B
      [
        "ĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽžſƀƁƂƃƄƅƆƇƈƉƊƋƌƍƎƏƐƑƒƓƔƕƖƗƘƙƚƛƜƝƞƟƠơƢƣƤƥƦƧƨƩƪƫƬƭƮƯưƱƲƳƴƵƶƷƸƹƺƻƼƽƾƿǀǁǂǃǄǅǆǇǈǉǊǋǌǍǎǏǐǑǒǓǔǕǖǗǘǙǚǛǜǝǞǟǠǡǢǣǤǥǦǧǨǩǪǫǬǭǮǯǰǱǲǳǴǵǶǷǸǹǺǻǼǽǾǿȀȁȂȃȄȅȆȇȈȉȊȋȌȍȎȏȐȑȒȓȔȕȖȗȘșȚțȜȝȞȟȠȡȢȣȤȥȦȧȨȩȪȫȬȭȮȯȰȱȲȳȴȵȶȷȸȹȺȻȼȽȾȿɀɁɂɃɄɅɆɇɈɉɊɋɌɍɎɏ",
        336,
      ],
      // Cyrillic and Cyrillic supplement
      [
        "ЀЁЂЃЄЅІЇЈЉЊЋЌЍЎЏАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюяѐёђѓєѕіїјљњћќѝўџѠѡѢѣѤѥѦѧѨѩѪѫѬѭѮѯѰѱѲѳѴѵѶѷѸѹѺѻѼѽѾѿҀҁ҂ ҃ ҄ ҅ ҆ ҇ ҈ ҉ҊҋҌҍҎҏҐґҒғҔҕҖҗҘҙҚқҜҝҞҟҠҡҢңҤҥҦҧҨҩҪҫҬҭҮүҰұҲҳҴҵҶҷҸҹҺһҼҽҾҿӀӁӂӃӄӅӆӇӈӉӊӋӌӍӎӏӐӑӒӓӔӕӖӗӘәӚӛӜӝӞӟӠӡӢӣӤӥӦӧӨөӪӫӬӭӮӯӰӱӲӳӴӵӶӷӸӹӺӻӼӽӾӿԀԁԂԃԄԅԆԇԈԉԊԋԌԍԎԏԐԑԒԓԔԕԖԗԘԙԚԛԜԝԞԟԠԡԢԣԤԥԦԧԨԩԪԫԬԭԮԯ",
        311,
      ],
      // Greek and Coptyc
      [
        "ͰͱͲͳʹ͵Ͷͷ  ͺͻͼͽ;Ϳ΄΅Ά·ΈΉΊ Ό ΎΏΐΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡ ΣΤΥΦΧΨΩΪΫάέήίΰαβγδεζηθικλμνξοπρςστυφχψωϊϋόύώϏϐϑϒϓϔϕϖϗϘϙϚϛϜϝϞϟϠϡϢϣϤϥϦϧϨϩϪϫϬϭϮϯϰϱϲϳϴϵ϶ϷϸϹϺϻϼϽϾϿ",
        140,
      ],
      // Latin extended additional
      [
        "ḀḁḂḃḄḅḆḇḈḉḊḋḌḍḎḏḐḑḒḓḔḕḖḗḘḙḚḛḜḝḞḟḠḡḢḣḤḥḦḧḨḩḪḫḬḭḮḯḰḱḲḳḴḵḶḷḸḹḺḻḼḽḾḿṀṁṂṃṄṅṆṇṈṉṊṋṌṍṎṏṐṑṒṓṔṕṖṗṘṙṚṛṜṝṞṟṠṡṢṣṤṥṦṧṨṩṪṫṬṭṮṯṰṱṲṳṴṵṶṷṸṹṺṻṼṽṾṿẀẁẂẃẄẅẆẇẈẉẊẋẌẍẎẏẐẑẒẓẔẕẖẗẘẙẚẛẜẝẞẟẠạẢảẤấẦầẨẩẪẫẬậẮắẰằẲẳẴẵẶặẸẹẺẻẼẽẾếỀềỂểỄễỆệỈỉỊịỌọỎỏỐốỒồỔổỖỗỘộỚớỜờỞởỠỡỢợỤụỦủỨứỪừỬửỮữỰựỲỳỴỵỶỷỸỹỺỻỼỽỾỿ",
        256,
      ],
    ];
    for (const [val, expected] of testCases) {
      expect(characterCount(val)).toBe(expected);
    }
  });
  it("Should return proper length for emojis", () => {
    const emojis = ["💩", "❤️", "👪", "👨‍👩‍👧‍👧", "🤽🏿‍♀️", "👋🏻", "🏽"];
    const emojiCases = emojis.map(emoji => generateEmojiStrings(emoji)).flat();
    const testCases: [string, number][] = [
      ["Hello", 5],
      ...emojiCases,
      ["ﬀ", 1],
      ["ﬀ ligature", 10],
      ["Shake light tone hand, 👋🏻", 24],
      ["Dark skin tone 🏿 and light tone hand 👋🏻", 38],
      ["This is a couple 👩‍❤️‍💋‍👩 and this is a family 👨‍👩‍👧‍👧!", 42],
      ["Iñtërnâtiônàlizætiøn☃💩", 22],
    ];

    for (const [val, expected] of testCases) {
      const count = characterCount(val);
      if (count !== expected) console.log(val);
      expect(count).toBe(expected);
    }
  });
});
