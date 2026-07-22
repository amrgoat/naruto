// ─────────────────────────────────────────────
//  characters.js  —  Classic Naruto character roster
//
//  Stats at Level 1 (Mastery 1, 0 Stars):
//    atkMin / atkMax  — damage range
//    atkGrowth        — added to BOTH min and max per level gained
//    hp               — base health
//    hpGrowth         — HP gained per level
//    spd              — speed (determines turn order)
//    spdGrowth        — SPD gained per level
//    critRate         — crit chance in %
//
//  Rank order (weakest → strongest): D → C → B → A → S
//  SS and UR exist but are locked from pulls.
// ─────────────────────────────────────────────

const CHARACTERS = {

  // ════════════════════════
  //  D-Rank  (40% pull rate)  —  weakest
  // ════════════════════════

  konohamaru: {
    id: 'konohamaru',
    name: 'Konohamaru',
    rarity: 'D',
    type: 'Combat',
    description: "Naruto's enthusiastic student, determined to become Hokage.",
    baseAtkMin: 8,  baseAtkMax: 14, atkGrowth: 0.4,
    baseHp: 100,    hpGrowth: 3,
    baseSpd: 38,    spdGrowth: 0.4,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/8/8a/Konohamaru_Sarutobi.png/revision/latest',
  },

  moegi: {
    id: 'moegi',
    name: 'Moegi',
    rarity: 'D',
    type: 'Combat',
    description: 'A spirited kunoichi-in-training and member of the Konohamaru Corps.',
    baseAtkMin: 6,  baseAtkMax: 10, atkGrowth: 0.3,
    baseHp: 80,     hpGrowth: 2,
    baseSpd: 42,    spdGrowth: 0.4,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/7/7f/Moegi.png/revision/latest',
  },

  udon: {
    id: 'udon',
    name: 'Udon',
    rarity: 'D',
    type: 'Combat',
    description: 'A timid but loyal genin, always seen alongside Konohamaru and Moegi.',
    baseAtkMin: 6,  baseAtkMax: 10, atkGrowth: 0.3,
    baseHp: 85,     hpGrowth: 2,
    baseSpd: 32,    spdGrowth: 0.3,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/d/d8/Udon.png/revision/latest',
  },

  inari: {
    id: 'inari',
    name: 'Inari',
    rarity: 'D',
    type: 'Combat',
    description: 'A Wave Country boy who found courage through Naruto\'s example.',
    baseAtkMin: 5,  baseAtkMax: 9,  atkGrowth: 0.3,
    baseHp: 75,     hpGrowth: 2,
    baseSpd: 28,    spdGrowth: 0.3,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/3/3d/Inari.png/revision/latest',
  },

  tazuna: {
    id: 'tazuna',
    name: 'Tazuna',
    rarity: 'D',
    type: 'Combat',
    description: 'The stubborn master bridge builder whose dream united Wave Country.',
    baseAtkMin: 7,  baseAtkMax: 12, atkGrowth: 0.3,
    baseHp: 110,    hpGrowth: 3,
    baseSpd: 20,    spdGrowth: 0.2,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/a/ae/Tazuna.png/revision/latest',
  },

  mizuki: {
    id: 'mizuki',
    name: 'Mizuki',
    rarity: 'D',
    type: 'Combat',
    description: 'A traitorous chunin who underestimated Naruto\'s resolve.',
    baseAtkMin: 10, baseAtkMax: 16, atkGrowth: 0.5,
    baseHp: 115,    hpGrowth: 3,
    baseSpd: 44,    spdGrowth: 0.5,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/e/e1/Mizuki.png/revision/latest',
  },

  ebisu: {
    id: 'ebisu',
    name: 'Ebisu',
    rarity: 'D',
    type: 'Combat',
    description: 'An elite private tutor jonin known for his strict training methods.',
    baseAtkMin: 11, baseAtkMax: 18, atkGrowth: 0.5,
    baseHp: 120,    hpGrowth: 3,
    baseSpd: 46,    spdGrowth: 0.5,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/f/f8/Ebisu.png/revision/latest',
  },

  iruka: {
    id: 'iruka',
    name: 'Iruka Umino',
    rarity: 'D',
    type: 'Combat',
    description: 'The warm-hearted chunin sensei who believed in Naruto from the start.',
    baseAtkMin: 12, baseAtkMax: 20, atkGrowth: 0.6,
    baseHp: 130,    hpGrowth: 4,
    baseSpd: 50,    spdGrowth: 0.5,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/5/5f/Iruka_Umino.png/revision/latest',
  },

  kin_tsuchi: {
    id: 'kin_tsuchi',
    name: 'Kin Tsuchi',
    rarity: 'D',
    type: 'Combat',
    description: 'A Sound genin who uses bells and wires to disorient her enemies.',
    baseAtkMin: 10, baseAtkMax: 17, atkGrowth: 0.5,
    baseHp: 95,     hpGrowth: 3,
    baseSpd: 52,    spdGrowth: 0.5,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/4/49/Kin_Tsuchi.png/revision/latest',
  },

  zaku_abumi: {
    id: 'zaku_abumi',
    name: 'Zaku Abumi',
    rarity: 'D',
    type: 'Combat',
    description: 'A Sound genin with air-pressure tubes in his arms for devastating blasts.',
    baseAtkMin: 11, baseAtkMax: 19, atkGrowth: 0.5,
    baseHp: 100,    hpGrowth: 3,
    baseSpd: 48,    spdGrowth: 0.5,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/5/56/Zaku_Abumi.png/revision/latest',
  },

  // ════════════════════════
  //  C-Rank  (30% pull rate)
  // ════════════════════════

  sakura: {
    id: 'sakura',
    name: 'Sakura Haruno',
    rarity: 'C',
    type: 'Combat',
    description: "Tsunade's apprentice with exceptional chakra control.",
    baseAtkMin: 16, baseAtkMax: 26, atkGrowth: 0.9,
    baseHp: 250,    hpGrowth: 7,
    baseSpd: 62,    spdGrowth: 0.8,
    critRate: 10,
    image: 'https://images4.alphacoders.com/124/thumb-440-1241754.webp',
  },

  ino: {
    id: 'ino',
    name: 'Ino Yamanaka',
    rarity: 'C',
    type: 'Combat',
    description: 'A kunoichi from the Yamanaka clan, skilled in mind techniques.',
    baseAtkMin: 14, baseAtkMax: 22, atkGrowth: 0.8,
    baseHp: 175,    hpGrowth: 5,
    baseSpd: 66,    spdGrowth: 0.8,
    critRate: 10,
    image: 'https://wallpapers.com/images/hd/ino-yamanaka-lt6ixygfn2mn0ani.jpg',
  },

  choji: {
    id: 'choji',
    name: 'Choji Akimichi',
    rarity: 'C',
    type: 'Combat',
    description: 'The Akimichi clan powerhouse with the highest stamina on his team.',
    baseAtkMin: 18, baseAtkMax: 30, atkGrowth: 1.0,
    baseHp: 420,    hpGrowth: 12,
    baseSpd: 24,    spdGrowth: 0.3,
    critRate: 10,
    image: 'https://i.pinimg.com/originals/00/99/80/009980c3ae8877db3bfa1cb31eb17583.jpg',
  },

  kiba: {
    id: 'kiba',
    name: 'Kiba Inuzuka',
    rarity: 'C',
    type: 'Combat',
    description: 'The wild Inuzuka clan member, always in sync with Akamaru.',
    baseAtkMin: 18, baseAtkMax: 28, atkGrowth: 0.9,
    baseHp: 168,    hpGrowth: 5,
    baseSpd: 72,    spdGrowth: 0.9,
    critRate: 10,
    image: 'https://i.pinimg.com/originals/f6/72/7e/f6727edb43842cb44fe6a2c02108e482.jpg',
  },

  shino: {
    id: 'shino',
    name: 'Shino Aburame',
    rarity: 'C',
    type: 'Combat',
    description: 'The stoic Aburame heir, master of insect-based techniques.',
    baseAtkMin: 14, baseAtkMax: 22, atkGrowth: 0.8,
    baseHp: 210,    hpGrowth: 6,
    baseSpd: 40,    spdGrowth: 0.5,
    critRate: 10,
    image: 'https://i.pinimg.com/originals/19/d2/6b/19d26b746f2e17eacaf78bdcd47dfe7e.jpg',
  },

  hinata: {
    id: 'hinata',
    name: 'Hinata Hyuga',
    rarity: 'C',
    type: 'Combat',
    description: 'The gentle Hyuga heiress with precise Byakugan strikes.',
    baseAtkMin: 16, baseAtkMax: 24, atkGrowth: 0.8,
    baseHp: 192,    hpGrowth: 5,
    baseSpd: 58,    spdGrowth: 0.7,
    critRate: 10,
    image: 'https://wallpapercat.com/w/full/2/f/2/739419-1080x1920-mobile-full-hd-hinata-hyuga-background-image.jpg',
  },

  tenten: {
    id: 'tenten',
    name: 'Tenten',
    rarity: 'C',
    type: 'Combat',
    description: 'A weapons specialist from Team Guy with excellent accuracy.',
    baseAtkMin: 20, baseAtkMax: 32, atkGrowth: 1.0,
    baseHp: 180,    hpGrowth: 5,
    baseSpd: 68,    spdGrowth: 0.8,
    critRate: 10,
    image: 'https://i.pinimg.com/originals/2a/e5/c6/2ae5c64d4e39d8790b02ad03a6e85739.jpg',
  },

  dosu: {
    id: 'dosu',
    name: 'Dosu Kinuta',
    rarity: 'C',
    type: 'Combat',
    description: 'A Sound genin who uses resonating sound waves to destroy from within.',
    baseAtkMin: 20, baseAtkMax: 34, atkGrowth: 1.1,
    baseHp: 195,    hpGrowth: 6,
    baseSpd: 44,    spdGrowth: 0.5,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/3/31/Dosu_Kinuta.png/revision/latest',
  },

  yoroi: {
    id: 'yoroi',
    name: 'Yoroi Akado',
    rarity: 'C',
    type: 'Combat',
    description: 'A mysterious genin who absorbs chakra through his gloves to drain opponents.',
    baseAtkMin: 18, baseAtkMax: 28, atkGrowth: 0.9,
    baseHp: 185,    hpGrowth: 5,
    baseSpd: 54,    spdGrowth: 0.6,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/5/55/Yoroi_Akado.png/revision/latest',
  },

  misumi: {
    id: 'misumi',
    name: 'Misumi Tsurugi',
    rarity: 'C',
    type: 'Combat',
    description: 'A genin who can dislocate every joint to envelop and crush enemies.',
    baseAtkMin: 16, baseAtkMax: 26, atkGrowth: 0.9,
    baseHp: 178,    hpGrowth: 5,
    baseSpd: 60,    spdGrowth: 0.7,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/1/13/Misumi_Tsurugi.png/revision/latest',
  },

  // ════════════════════════
  //  B-Rank  (20% pull rate)
  // ════════════════════════

  naruto: {
    id: 'naruto',
    name: 'Naruto Uzumaki',
    rarity: 'B',
    type: 'Combat',
    description: "The unpredictable ninja whose determination never falters.",
    baseAtkMin: 38, baseAtkMax: 58, atkGrowth: 1.8,
    baseHp: 320,    hpGrowth: 9,
    baseSpd: 88,    spdGrowth: 1.2,
    critRate: 10,
    image: 'https://i.pinimg.com/originals/1b/5c/cd/1b5ccd57b3afc64a56cbf52857d6ca64.jpg',
  },

  sasuke: {
    id: 'sasuke',
    name: 'Sasuke Uchiha',
    rarity: 'B',
    type: 'Combat',
    description: 'The last Uchiha whose Sharingan predicts every move.',
    baseAtkMin: 44, baseAtkMax: 66, atkGrowth: 2.0,
    baseHp: 290,    hpGrowth: 7,
    baseSpd: 102,   spdGrowth: 1.4,
    critRate: 10,
    image: 'https://i.pinimg.com/originals/fc/5d/e4/fc5de4889521dc7fa660f97ef213c901.jpg',
  },

  rock_lee: {
    id: 'rock_lee',
    name: 'Rock Lee',
    rarity: 'B',
    type: 'Combat',
    description: 'The Taijutsu genius who proves hard work surpasses talent.',
    baseAtkMin: 40, baseAtkMax: 62, atkGrowth: 1.9,
    baseHp: 270,    hpGrowth: 7,
    baseSpd: 148,   spdGrowth: 1.9,
    critRate: 10,
    image: 'https://i.redd.it/6fdytiehhhu51.jpg',
  },

  neji: {
    id: 'neji',
    name: 'Neji Hyuga',
    rarity: 'B',
    type: 'Combat',
    description: 'A Hyuga prodigy whose Gentle Fist strikes with unmatched precision.',
    baseAtkMin: 38, baseAtkMax: 56, atkGrowth: 1.7,
    baseHp: 260,    hpGrowth: 7,
    baseSpd: 80,    spdGrowth: 1.0,
    critRate: 10,
    image: 'https://static.zerochan.net/Hyuuga.Neji.full.100872.jpg',
  },

  shikamaru: {
    id: 'shikamaru',
    name: 'Shikamaru Nara',
    rarity: 'B',
    type: 'Combat',
    description: 'A strategic genius who plays the long game in every battle.',
    baseAtkMin: 34, baseAtkMax: 52, atkGrowth: 1.6,
    baseHp: 280,    hpGrowth: 7,
    baseSpd: 82,    spdGrowth: 1.1,
    critRate: 10,
    image: 'https://wallpapers.com/images/hd/shikamaru-shadow-art-0nakqq6659wq0vk0.jpg',
  },

  kankuro: {
    id: 'kankuro',
    name: 'Kankuro',
    rarity: 'B',
    type: 'Combat',
    description: 'The Sand puppet master whose Karasu and Kuroari crush enemies from afar.',
    baseAtkMin: 36, baseAtkMax: 54, atkGrowth: 1.6,
    baseHp: 275,    hpGrowth: 7,
    baseSpd: 70,    spdGrowth: 0.9,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/2/2e/Kankuro.png/revision/latest',
  },

  temari: {
    id: 'temari',
    name: 'Temari',
    rarity: 'B',
    type: 'Combat',
    description: 'The Wind Release kunoichi who overwhelms with sheer destructive force.',
    baseAtkMin: 42, baseAtkMax: 62, atkGrowth: 1.9,
    baseHp: 268,    hpGrowth: 7,
    baseSpd: 86,    spdGrowth: 1.1,
    critRate: 10,
    image: 'https://w0.peakpx.com/wallpaper/531/680/HD-wallpaper-anime-naruto-minimalist-temari-naruto-shikamaru-nara-thumbnail.jpg',
  },

  kabuto: {
    id: 'kabuto',
    name: 'Kabuto Yakushi',
    rarity: 'B',
    type: 'Combat',
    description: "Orochimaru's cunning spy whose medical ninjutsu can turn the tide of battle.",
    baseAtkMin: 36, baseAtkMax: 56, atkGrowth: 1.7,
    baseHp: 310,    hpGrowth: 8,
    baseSpd: 76,    spdGrowth: 1.0,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/e/e4/Kabuto_Yakushi.png/revision/latest',
  },

  anko: {
    id: 'anko',
    name: 'Anko Mitarashi',
    rarity: 'B',
    type: 'Combat',
    description: "Orochimaru's former student whose reckless aggression makes her unpredictable.",
    baseAtkMin: 40, baseAtkMax: 60, atkGrowth: 1.8,
    baseHp: 285,    hpGrowth: 7,
    baseSpd: 92,    spdGrowth: 1.2,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/b/b8/Anko_Mitarashi.png/revision/latest',
  },

  hayate: {
    id: 'hayate',
    name: 'Hayate Gekko',
    rarity: 'B',
    type: 'Combat',
    description: 'A skilled jonin swordsman whose Moon-Splitting technique is razor-sharp.',
    baseAtkMin: 38, baseAtkMax: 58, atkGrowth: 1.7,
    baseHp: 265,    hpGrowth: 7,
    baseSpd: 84,    spdGrowth: 1.1,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/9/9d/Hayate_Gekko.png/revision/latest',
  },

  genma: {
    id: 'genma',
    name: 'Genma Shiranui',
    rarity: 'B',
    type: 'Combat',
    description: 'A steely jonin who fights with precision, always calm under pressure.',
    baseAtkMin: 36, baseAtkMax: 54, atkGrowth: 1.6,
    baseHp: 270,    hpGrowth: 7,
    baseSpd: 80,    spdGrowth: 1.0,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/6/6f/Genma_Shiranui.png/revision/latest',
  },

  baki: {
    id: 'baki',
    name: 'Baki',
    rarity: 'B',
    type: 'Combat',
    description: 'The Sand jonin commander whose Wind Blade technique cuts through anything.',
    baseAtkMin: 42, baseAtkMax: 64, atkGrowth: 1.9,
    baseHp: 295,    hpGrowth: 8,
    baseSpd: 88,    spdGrowth: 1.1,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/a/a0/Baki.png/revision/latest',
  },

  // ════════════════════════
  //  A-Rank  (8% pull rate)
  // ════════════════════════

  kakashi: {
    id: 'kakashi',
    name: 'Kakashi Hatake',
    rarity: 'A',
    type: 'Combat',
    description: 'The Copy Ninja who has mastered over a thousand jutsu.',
    baseAtkMin: 68, baseAtkMax: 98, atkGrowth: 3.0,
    baseHp: 480,    hpGrowth: 12,
    baseSpd: 118,   spdGrowth: 1.7,
    critRate: 10,
    image: 'https://i.pinimg.com/originals/68/a3/dc/68a3dcbaf7fb3958bd5b78359e21ffc1.jpg',
  },

  might_guy: {
    id: 'might_guy',
    name: 'Might Guy',
    rarity: 'A',
    type: 'Combat',
    description: "Konoha's Sublime Green Beast of Prey whose Eight Gates transcend human limits.",
    baseAtkMin: 80, baseAtkMax: 115, atkGrowth: 3.5,
    baseHp: 520,    hpGrowth: 13,
    baseSpd: 155,   spdGrowth: 2.1,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/6/6f/Might_Guy.png/revision/latest',
  },

  gaara: {
    id: 'gaara',
    name: 'Gaara of the Sand',
    rarity: 'A',
    type: 'Combat',
    description: "The Sand village's feared jinchuriki whose iron sand is an impenetrable fortress.",
    baseAtkMin: 62, baseAtkMax: 90, atkGrowth: 2.8,
    baseHp: 680,    hpGrowth: 18,
    baseSpd: 30,    spdGrowth: 0.4,
    critRate: 10,
    image: 'https://wallpapers.com/images/hd/cool-gaara-digital-art-hzux6z9g8huvmvz0.jpg',
  },

  zabuza: {
    id: 'zabuza',
    name: 'Zabuza Momochi',
    rarity: 'A',
    type: 'Combat',
    description: 'The Demon of the Hidden Mist whose silent killing technique is merciless.',
    baseAtkMin: 75, baseAtkMax: 108, atkGrowth: 3.3,
    baseHp: 510,    hpGrowth: 13,
    baseSpd: 105,   spdGrowth: 1.5,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/0/01/Zabuza_Momochi.png/revision/latest',
  },

  haku: {
    id: 'haku',
    name: 'Haku',
    rarity: 'A',
    type: 'Combat',
    description: 'A mysterious shinobi with a rare bloodline, wielding ice mirrors to trap prey.',
    baseAtkMin: 65, baseAtkMax: 94, atkGrowth: 2.9,
    baseHp: 440,    hpGrowth: 11,
    baseSpd: 148,   spdGrowth: 2.0,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/e/eb/Haku.png/revision/latest',
  },

  asuma: {
    id: 'asuma',
    name: 'Asuma Sarutobi',
    rarity: 'A',
    type: 'Combat',
    description: "Konoha's cigarette-smoking jonin whose chakra blades slice through defence.",
    baseAtkMin: 70, baseAtkMax: 100, atkGrowth: 3.1,
    baseHp: 490,    hpGrowth: 12,
    baseSpd: 100,   spdGrowth: 1.4,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/e/ef/Asuma_Sarutobi.png/revision/latest',
  },

  kurenai: {
    id: 'kurenai',
    name: 'Kurenai Yuhi',
    rarity: 'A',
    type: 'Combat',
    description: "Konoha's premier genjutsu master who can trap minds in inescapable illusions.",
    baseAtkMin: 62, baseAtkMax: 90, atkGrowth: 2.8,
    baseHp: 430,    hpGrowth: 11,
    baseSpd: 96,    spdGrowth: 1.3,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/e/e4/Kurenai_Yuhi.png/revision/latest',
  },

  kimimaro: {
    id: 'kimimaro',
    name: 'Kimimaro',
    rarity: 'A',
    type: 'Combat',
    description: "Orochimaru's most powerful vessel whose bone kekkei genkai is a lethal weapon.",
    baseAtkMin: 78, baseAtkMax: 112, atkGrowth: 3.4,
    baseHp: 500,    hpGrowth: 13,
    baseSpd: 112,   spdGrowth: 1.6,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/1/1f/Kimimaro.png/revision/latest',
  },

  jirobo: {
    id: 'jirobo',
    name: 'Jirobo',
    rarity: 'A',
    type: 'Combat',
    description: 'The powerhouse of the Sound Four who absorbs chakra and crushes foes bare-handed.',
    baseAtkMin: 72, baseAtkMax: 104, atkGrowth: 3.2,
    baseHp: 640,    hpGrowth: 16,
    baseSpd: 52,    spdGrowth: 0.7,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/a/a4/Jirobo.png/revision/latest',
  },

  kidomaru: {
    id: 'kidomaru',
    name: 'Kidomaru',
    rarity: 'A',
    type: 'Combat',
    description: 'The six-armed archer of the Sound Four whose golden web ensnares any target.',
    baseAtkMin: 66, baseAtkMax: 96, atkGrowth: 2.9,
    baseHp: 455,    hpGrowth: 11,
    baseSpd: 108,   spdGrowth: 1.5,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/5/57/Kidomaru.png/revision/latest',
  },

  tayuya: {
    id: 'tayuya',
    name: 'Tayuya',
    rarity: 'A',
    type: 'Combat',
    description: 'The foul-mouthed flute player of the Sound Four whose melody creates deadly phantoms.',
    baseAtkMin: 64, baseAtkMax: 92, atkGrowth: 2.8,
    baseHp: 435,    hpGrowth: 11,
    baseSpd: 104,   spdGrowth: 1.4,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/f/f3/Tayuya.png/revision/latest',
  },

  sakon: {
    id: 'sakon',
    name: 'Sakon & Ukon',
    rarity: 'A',
    type: 'Combat',
    description: 'The twin brothers of the Sound Four who merge bodies to unleash cellular destruction.',
    baseAtkMin: 74, baseAtkMax: 106, atkGrowth: 3.2,
    baseHp: 475,    hpGrowth: 12,
    baseSpd: 118,   spdGrowth: 1.6,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/3/37/Sakon_and_Ukon.png/revision/latest',
  },

  // ════════════════════════
  //  S-Rank  (2% pull rate)  —  strongest
  // ════════════════════════

  jiraiya: {
    id: 'jiraiya',
    name: 'Jiraiya',
    rarity: 'S',
    type: 'Combat',
    description: 'The Toad Sage and legendary Sannin of the Hidden Leaf.',
    baseAtkMin: 92, baseAtkMax: 132, atkGrowth: 4.2,
    baseHp: 600,    hpGrowth: 16,
    baseSpd: 105,   spdGrowth: 1.6,
    critRate: 10,
    image: 'https://wallpapers.com/images/hd/jiraiya-vector-art-y4idgbli8v127x5v.jpg',
  },

  itachi: {
    id: 'itachi',
    name: 'Itachi Uchiha',
    rarity: 'S',
    type: 'Combat',
    description: "An Uchiha prodigy whose Mangekyō Sharingan is nearly omniscient.",
    baseAtkMin: 100, baseAtkMax: 142, atkGrowth: 4.6,
    baseHp: 440,     hpGrowth: 11,
    baseSpd: 122,    spdGrowth: 1.9,
    critRate: 10,
    image: 'https://www.turtlewings.co/cdn/shop/files/u6348236244_Full-body_shot_of_a_heroic_anime-style_scene_of_Ita_b7b684de-9307-47fa-b679-0b2cdb5778f9-2.jpg?v=1753098096&width=1445',
  },

  orochimaru: {
    id: 'orochimaru',
    name: 'Orochimaru',
    rarity: 'S',
    type: 'Combat',
    description: 'The serpent Sannin who sacrificed his humanity in pursuit of immortality.',
    baseAtkMin: 95, baseAtkMax: 136, atkGrowth: 4.4,
    baseHp: 620,    hpGrowth: 16,
    baseSpd: 112,   spdGrowth: 1.7,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/2/21/Orochimaru.png/revision/latest',
  },

  hiruzen: {
    id: 'hiruzen',
    name: 'Hiruzen Sarutobi',
    rarity: 'S',
    type: 'Combat',
    description: 'The God of Shinobi and Third Hokage, master of all five nature transformations.',
    baseAtkMin: 90, baseAtkMax: 128, atkGrowth: 4.1,
    baseHp: 680,    hpGrowth: 18,
    baseSpd: 96,    spdGrowth: 1.5,
    critRate: 10,
    image: 'https://static.wikia.nocookie.net/naruto/images/8/8c/Hiruzen_Sarutobi.png/revision/latest',
  },

  tsunade: {
    id: 'tsunade',
    name: 'Tsunade',
    rarity: 'S',
    type: 'Combat',
    description: 'The Fifth Hokage whose monstrous strength shatters the earth.',
    baseAtkMin: 98, baseAtkMax: 140, atkGrowth: 4.5,
    baseHp: 820,    hpGrowth: 22,
    baseSpd: 84,    spdGrowth: 1.3,
    critRate: 10,
    image: 'https://b.thumbs.redditmedia.com/ZXzl2hMuhIDLdvCQoX7SEj-7QdITrBfct0t5kcZ6iZU.jpg',
  },

  // ════════════════════════
  //  Support Cards  —  pullLocked, cannot battle
  // ════════════════════════

  teuchi: {
    id: 'teuchi',
    name: 'Teuchi',
    rarity: 'S',
    type: 'Support',
    pullLocked: true,   // obtained through events, not normal pulls
    description: 'The legendary ramen chef of Ichiraku whose bowls restore any ninja\'s spirit.',
    baseAtkMin: 1, baseAtkMax: 1, atkGrowth: 0,
    baseHp: 1,     hpGrowth: 0,
    baseSpd: 1,    spdGrowth: 0,
    critRate: 0,
    image: 'https://static.wikia.nocookie.net/naruto/images/9/9b/Teuchi.png/revision/latest',
  },

};

/** Characters available in the pull pool, grouped by rarity.
 *  Characters with pullLocked: true are excluded. */
const PULL_POOL = {};
for (const [id, char] of Object.entries(CHARACTERS)) {
  if (char.pullLocked) continue;
  const r = char.rarity;
  if (!PULL_POOL[r]) PULL_POOL[r] = [];
  PULL_POOL[r].push(id);
}

module.exports = { CHARACTERS, PULL_POOL };
