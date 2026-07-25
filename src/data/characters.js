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
    image: 'https://i.pinimg.com/originals/2d/e2/e6/2de2e62109e0ec45585f7c6a686b4011.jpg',
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
    image: 'https://i.pinimg.com/originals/f9/ad/e5/f9ade5861832986958958dac6d105f46.jpg',
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
    image: 'https://i.pinimg.com/originals/e1/a3/7d/e1a37d43d28cb87473b2b86f622b40fe.jpg',
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
    image: 'https://media.easy-peasy.ai/27feb2bb-aeb4-4a83-9fb6-8f3f2a15885e/8452e0a4-7b9a-470b-b68d-0fe2b5c705f1_thumb.webp',
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
    image: 'https://b.thumbs.redditmedia.com/enmWW2WxnfDytYNslhYIgDNHBtyHq1gkjbjPHft_zpM.jpg',
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
    image: 'https://static0.srcdn.com/wordpress/wp-content/uploads/2017/11/Team-Dosu-Naruto.jpg?q=70&fit=crop&w=825&dpr=1',
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
    image: 'https://i.pinimg.com/originals/37/f0/d5/37f0d52e0442f0db0e5b1f1f69a5e28d.jpg',
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
    image: 'https://static0.cbrimages.com/wordpress/wp-content/uploads/2020/03/Iruka-Umino-1.jpg?q=50&fit=crop&w=825&dpr=1.5',
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
    image: 'https://i.pinimg.com/originals/50/71/c0/5071c02d36c1931240213150761000b2.jpg',
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
    image: 'https://gbaike-image.cdn.bcebos.com/cc11728b4710b912c8fcea8145a7eb039245d6888400/cc11728b4710b912c8fcea8145a7eb039245d6888400_url?x-bce-process=image/format,f_auto/resize,m_lfit,h_400,limit_1',
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
    image: 'https://m.media-amazon.com/images/I/51uldCLMnLL.jpg',
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
    image: 'https://i.pinimg.com/originals/f0/3c/1e/f03c1e3d6d8bb7434fbefa750f30a96e.jpg',
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
    image: 'https://getwallpapers.com/wallpaper/full/d/0/1/809686-cool-choji-akimichi-wallpapers-1700x2186.jpg',
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
    image: 'https://www.creativeuncut.com/gallery-22/art/nuns-kiba-inuzuka.jpg',
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
    image: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/60e03beb-7a94-4141-b310-9a77ba5dec35/dge5m9x-c9759302-c2c1-49c7-8de7-f4298700e486.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzYwZTAzYmViLTdhOTQtNDE0MS1iMzEwLTlhNzdiYTVkZWMzNVwvZGdlNW05eC1jOTc1OTMwMi1jMmMxLTQ5YzctOGRlNy1mNDI5ODcwMGU0ODYucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.jawKheWqOsCXQDoaLaccDzcad4Icqag6aGou2wMX1FQ',
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
    image: 'https://wallpapercat.com/w/full/1/c/2/739345-1730x3060-samsung-hd-hinata-hyuga-wallpaper-photo.jpg',
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
    image: 'https://wallpaperaccess.com/full/5641858.png',
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
    image: 'https://images.alphacoders.com/964/thumbbig-96421.webp',
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
    image: 'https://ami.animecharactersdatabase.com/images/naruto/Yoroi_Akadou.png',
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
    image: 'https://ami.animecharactersdatabase.com/uploads/chars/5688-663522538.jpg',
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
    image: 'https://aiartes.com/works/naruto-uzumaki-midjourney-art-style-of-claire-wendling-small.jpg',
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
    image: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/028079fc-266f-4466-bf55-8911883760c0/diigtd6-f73e1320-810c-43d2-b955-955820d3e6a9.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzAyODA3OWZjLTI2NmYtNDQ2Ni1iZjU1LTg5MTE4ODM3NjBjMFwvZGlpZ3RkNi1mNzNlMTMyMC04MTBjLTQzZDItYjk1NS05NTU4MjBkM2U2YTkuanBnIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.SQDkjTw1JclSOBb3wROCAjQWLLEiLGtN6VE31GzeOw8',
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
    image: 'https://a.thumbs.redditmedia.com/MrifkHEWyFBqHuqXVlNCkjGM5W3Yy8tH5ePh4HWHSj0.jpg',
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
    image: 'https://w0.peakpx.com/wallpaper/895/55/HD-wallpaper-neji-neji-hyuga-naruto-shippuden-anime-sad-otaku-anime-art-hyuga-anime-thumbnail.jpg',
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
    image: 'https://render.fineartamerica.com/images/images-profile-flow/400/images/artworkimages/mediumlarge/3/3-naruto-anime-hai-dang.jpg',
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
    image: 'https://i.ebayimg.com/images/g/XG4AAeSwhBRpRPir/s-l500.jpg',
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
    image: 'https://i.pinimg.com/originals/f0/d0/bd/f0d0bd4fda219db2fccc6528ef3e777a.jpg',
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
    image: 'https://www.creativeuncut.com/gallery-22/art/nscnr3-kabuto-yakushi.jpg',
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
    image: 'https://www.pngplay.com/wp-content/uploads/12/Anko-Mitarashi-Free-PNG.png',
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
    image: 'https://i.pinimg.com/originals/44/77/4e/44774eccb403b0947b9a62cf6a71c7fc.jpg',
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
    image: 'https://i.pinimg.com/originals/9e/8f/81/9e8f81af16cb53a2947adf60229aa465.jpg',
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
    image: 'https://www.creativeuncut.com/gallery-22/art/nscnr3-baki.jpg',
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
    image: 'https://www.pngplay.com/wp-content/uploads/12/Kakashi-Hatake-Background-PNG-Image.png',
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
    image: 'https://i.redd.it/zohmg4zfmyp81.jpg',
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
    image: 'https://wallpaperaccess.com/full/6833858.jpg',
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
    image: 'https://www.pngplay.com/wp-content/uploads/12/Zabuza-Momochi-Download-Free-PNG.png',
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
    image: 'https://wallpapercave.com/wp/wp7885791.jpg',
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
    image: 'https://i.pinimg.com/originals/4e/06/68/4e06688efd63f3bff89f4ee0836c16c7.jpg',
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
    image: 'https://i.pinimg.com/originals/77/38/c8/7738c81657f145706b7fc482c440b511.jpg',
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
    image: 'https://i.pinimg.com/originals/19/2f/0a/192f0aa42cd63339d6521503ba22d39a.jpg',
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
    image: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/402e21b1-03cb-4a1c-8292-5acc83968c94/da27t4h-1fbe3a89-e8b3-4dd9-8cb3-c9c2d19461e1.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi80MDJlMjFiMS0wM2NiLTRhMWMtODI5Mi01YWNjODM5NjhjOTQvZGEyN3Q0aC0xZmJlM2E4OS1lOGIzLTRkZDktOGNiMy1jOWMyZDE5NDYxZTEuanBnIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.D_Z4w_IDvG0CCC-jGqqzd2ikQjxvRp5oxdxa4RizK10',
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
    image: 'https://b.thumbs.redditmedia.com/-nhRXE_FoByKwTDBzURdWF2LOAKEoOg7dcntclSuQmg.jpg',
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
    image: 'https://m.media-amazon.com/images/I/710SSnA+m3S.jpg',
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
    image: 'https://s.ecrater.com/stores/488421/63773d3798b22_488421b.jpg',
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
    image: 'https://i.pinimg.com/originals/90/a5/43/90a5430e7a0832b3663c8846b51afa42.jpg',
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
    image: 'https://w0.peakpx.com/wallpaper/79/109/HD-wallpaper-uchiha-itachi-itachi-anime-manga-naruto-naruto-shippuden-akatsuki-itachi-uchiha-digital-art-digital-painting-thumbnail.jpg',
  },

  orochimaru: {
    id: 'orochimaru',
    name: 'Orochimaru',
    rarity: 'S',
    type: 'Combat',
    description: "A shinobi who passed his serpent arts and Curse Mark onto chosen students, striking with fang and blade.",
    baseAtkMin: 95, baseAtkMax: 136, atkGrowth: 4.4,
    baseHp: 620,    hpGrowth: 16,
    baseSpd: 112,   spdGrowth: 1.7,
    critRate: 10,
    image: 'https://y0.wallpaperyeah.com/wallpaperimgs/789/767/desktop-wallpaper-orochimaru-sannin-snake-naruto-thumbnail.jpg',
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
    image: 'https://www.pngplay.com/wp-content/uploads/12/Hiruzen-Sarutobi-PNG-Pic-Background.png',
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
    image: 'https://wallpapers.com/images/hd/tsunade-senju-naruto-hokage-ninja-art-creation-rebirth-5iaeh3tebvnkukch.jpg',
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
    image: 'https://daddyjim.ai/_next/image?url=https://cdn.daddyjim.com/naruto/characters/teuchi-featured-2c48d4a3.webp&w=3840&q=90',
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
