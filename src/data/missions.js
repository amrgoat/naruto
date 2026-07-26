// ─────────────────────────────────────────────
//  missions.js  —  Shinobi Mission question bank
//
//  Each entry:
//    scenario : mission briefing (narrative, no direct question)
//    question : the actual trivia question
//    answers  : array of 4 strings  (answers[correct] is the right one)
//    correct  : index 0-3
//
//  All questions are from Naruto and Naruto Shippuden canon only.
//  Double-quoted strings throughout to safely allow apostrophes.
// ─────────────────────────────────────────────

const MISSIONS = {

  // ════════════════════════════════════════════
  //  D-RANK  •  Village Errand
  // ════════════════════════════════════════════

  D: [
    {
      scenario: "A new Academy student has approached you in the marketplace. They're studying shinobi history and are confused about the village's leadership.",
      question: "Who is the Fourth Hokage of the Hidden Leaf Village?",
      answers: ["Minato Namikaze", "Hiruzen Sarutobi", "Tobirama Senju", "Hashirama Senju"],
      correct: 0,
    },
    {
      scenario: "The Hokage Monument requires maintenance and a worker is asking shinobi for help identifying which faces are carved there.",
      question: "How many Hokages are depicted on the Hokage Monument at the start of the original series?",
      answers: ["Four", "Three", "Five", "Six"],
      correct: 0,
    },
    {
      scenario: "A genin has gotten into an argument with a classmate about which team Naruto belongs to.",
      question: "What is the squad number of Naruto, Sasuke, and Sakura's team?",
      answers: ["Team 7", "Team 8", "Team 10", "Team 9"],
      correct: 0,
    },
    {
      scenario: "The village library has been reorganised and a young shinobi can't find the record of the Nine-Tailed Fox's name.",
      question: "What is the name of the Nine-Tailed Fox sealed inside Naruto Uzumaki?",
      answers: ["Kurama", "Shukaku", "Gyuki", "Matatabi"],
      correct: 0,
    },
    {
      scenario: "A travelling merchant is asking locals about the ruling structure of the Hidden Leaf Village.",
      question: "Who holds the title of Third Hokage when Naruto is a genin?",
      answers: ["Hiruzen Sarutobi", "Minato Namikaze", "Tsunade", "Danzo Shimura"],
      correct: 0,
    },
    {
      scenario: "An Academy instructor has asked you to quiz a student on basic clan names.",
      question: "What is the name of Sasuke's clan?",
      answers: ["Uchiha", "Senju", "Hyuga", "Sarutobi"],
      correct: 0,
    },
    {
      scenario: "A shinobi from another village has asked who leads Team 7 during their early genin days.",
      question: "Who is the jonin sensei assigned to Team 7?",
      answers: ["Kakashi Hatake", "Asuma Sarutobi", "Kurenai Yuhi", "Might Guy"],
      correct: 0,
    },
    {
      scenario: "A young villager wants to know which village sits in the Land of Fire.",
      question: "What is the Japanese name for the Hidden Leaf Village?",
      answers: ["Konohagakure", "Sunagakure", "Kumogakure", "Kirigakure"],
      correct: 0,
    },
    {
      scenario: "During a patrol briefing, a chunin questions which village Gaara, Temari, and Kankuro represent.",
      question: "Which village are the Sand Siblings from?",
      answers: ["Hidden Sand Village", "Hidden Stone Village", "Hidden Mist Village", "Hidden Cloud Village"],
      correct: 0,
    },
    {
      scenario: "A rookie genin is confused about what Naruto is most famous for among his peers.",
      question: "What is Naruto Uzumaki's most iconic jutsu?",
      answers: ["Shadow Clone Jutsu", "Rasengan", "Summoning Jutsu", "Eight Gates"],
      correct: 0,
    },
    {
      scenario: "The mission records desk is looking for the name of Naruto's mother.",
      question: "What is the name of Naruto Uzumaki's mother?",
      answers: ["Kushina Uzumaki", "Mito Uzumaki", "Mikoto Uchiha", "Rin Nohara"],
      correct: 0,
    },
    {
      scenario: "A visitor from the Hidden Sand is asking about the Fifth Hokage after hearing rumours.",
      question: "Who serves as the Fifth Hokage of the Hidden Leaf Village?",
      answers: ["Tsunade", "Jiraiya", "Kakashi Hatake", "Danzo Shimura"],
      correct: 0,
    },
    {
      scenario: "An old man at the ramen shop is asking who Naruto considers his biggest rival.",
      question: "Who is Naruto Uzumaki's self-declared rival throughout the series?",
      answers: ["Sasuke Uchiha", "Neji Hyuga", "Rock Lee", "Gaara"],
      correct: 0,
    },
    {
      scenario: "A genin from another village asks which legendary ninja became Naruto's personal trainer.",
      question: "Which of the Legendary Sannin trained Naruto Uzumaki?",
      answers: ["Jiraiya", "Orochimaru", "Tsunade", "Kabuto Yakushi"],
      correct: 0,
    },
    {
      scenario: "Academy records need confirming. A student claims Naruto's father was a great ninja.",
      question: "What is the name of Naruto Uzumaki's father?",
      answers: ["Minato Namikaze", "Asuma Sarutobi", "Hiruzen Sarutobi", "Jiraiya"],
      correct: 0,
    },
    {
      scenario: "A young shinobi has asked you what clan the Byakugan belongs to.",
      question: "Which clan possesses the Byakugan?",
      answers: ["Hyuga", "Uchiha", "Senju", "Uzumaki"],
      correct: 0,
    },
    {
      scenario: "A traveller who just arrived in Konoha asks about the instructor who believed in Naruto when no one else did.",
      question: "Who is Naruto's Academy teacher who always supported him?",
      answers: ["Iruka Umino", "Kakashi Hatake", "Ebisu", "Konohamaru's grandfather"],
      correct: 0,
    },
    {
      scenario: "Intelligence confirms a missing-nin from the Hidden Mist was recently spotted near the Land of Waves. You need to brief your squad.",
      question: "Who is the demon of the Hidden Mist that Team 7 encounters on the Land of Waves mission?",
      answers: ["Zabuza Momochi", "Kisame Hoshigaki", "Raiga Kurosuki", "Mangetsu Hozuki"],
      correct: 0,
    },
    {
      scenario: "A villager is asking what the man-made bridge in the Land of Waves was named after.",
      question: "What is the name of the bridge built in the Land of Waves that is named after Naruto?",
      answers: ["Great Naruto Bridge", "Bridge of the Leaf", "Hero's Crossing", "Tazuna Bridge"],
      correct: 0,
    },
    {
      scenario: "A young shinobi asks who Rock Lee's jonin sensei is, having heard he is a legendary taijutsu master.",
      question: "Who is Rock Lee's sensei and the man known as Konoha's Sublime Green Beast of Prey?",
      answers: ["Might Guy", "Kakashi Hatake", "Asuma Sarutobi", "Gai Maito"],
      correct: 0,
    },
    {
      scenario: "The Hokage's office is reviewing which teams competed in the Chunin Exams. They need to know Team 10's members.",
      question: "Which three genin make up Team 10 in Part 1?",
      answers: ["Shikamaru, Ino, and Choji", "Kiba, Hinata, and Shino", "Naruto, Sakura, and Sasuke", "Neji, TenTen, and Lee"],
      correct: 0,
    },
    {
      scenario: "A genin asks which country the Hidden Leaf Village belongs to.",
      question: "The Hidden Leaf Village is located in which country?",
      answers: ["Land of Fire", "Land of Wind", "Land of Earth", "Land of Water"],
      correct: 0,
    },
    {
      scenario: "A civilian is asking what jutsu the famous Fourth Hokage was best known for creating.",
      question: "What is the spinning ball of chakra technique created by the Fourth Hokage, Minato Namikaze?",
      answers: ["Rasengan", "Flying Thunder God Technique", "Shadow Clone Jutsu", "Summoning Jutsu"],
      correct: 0,
    },
    {
      scenario: "A jonin is quizzing their squad on what test Kakashi used to evaluate Team 7.",
      question: "What test did Kakashi give Team 7 to determine if they were fit to be ninja?",
      answers: ["The Bell Test", "The Survival Test", "The Written Exam", "The Tracking Test"],
      correct: 0,
    },
    {
      scenario: "Records request: confirm the goal Naruto has always shouted about his future.",
      question: "What is Naruto Uzumaki's lifelong dream?",
      answers: ["To become Hokage", "To master all five nature transformations", "To surpass Sasuke", "To find his parents"],
      correct: 0,
    },
    {
      scenario: "A new recruit asks about the jonin who leads Team 8 and her speciality in genjutsu.",
      question: "Who is the jonin sensei of Team 8, which includes Kiba, Hinata, and Shino?",
      answers: ["Kurenai Yuhi", "Asuma Sarutobi", "Might Guy", "Anko Mitarashi"],
      correct: 0,
    },
    {
      scenario: "An Academy student doing a report on the Legendary Sannin asks what they are called collectively.",
      question: "What is the name of the group that includes Jiraiya, Tsunade, and Orochimaru?",
      answers: ["The Legendary Sannin", "The Three Shinobi", "The Konoha Elders", "The Hidden Leaf Saints"],
      correct: 0,
    },
    {
      scenario: "A patrol guard at the village gate is verifying details about Kiba Inuzuka's companion.",
      question: "What is the name of Kiba Inuzuka's partner ninken?",
      answers: ["Akamaru", "Kibamaru", "Pakkun", "Bull"],
      correct: 0,
    },
    {
      scenario: "Intelligence reports need confirmation: how many tails does the beast sealed inside Naruto have?",
      question: "How many tails does Kurama, the beast sealed inside Naruto, possess?",
      answers: ["Nine", "Eight", "Seven", "Ten"],
      correct: 0,
    },
    {
      scenario: "A chunin at the mission desk asks about the large slug Tsunade is known to summon.",
      question: "What is the name of Tsunade's summoning animal?",
      answers: ["Katsuyu", "Manda", "Gamabunta", "Enma"],
      correct: 0,
    },
    {
      scenario: "A student claims Rock Lee cannot use ninjutsu or genjutsu. A jonin wants confirmation.",
      question: "What is Rock Lee's only fighting method?",
      answers: ["Taijutsu", "Kenjutsu", "Fuinjutsu", "Senjutsu"],
      correct: 0,
    },
    {
      scenario: "A genin wants to know which hidden village Orochimaru created after leaving the Akatsuki.",
      question: "What is the name of the hidden village Orochimaru leads in the Land of Sound?",
      answers: ["Otogakure (Hidden Sound)", "Amegakure (Hidden Rain)", "Kusagakure (Hidden Grass)", "Yugakure (Hidden Hot Water)"],
      correct: 0,
    },
    {
      scenario: "Intel has confirmed that the toad contract holder who is Naruto's godfather has gone missing.",
      question: "Who is Naruto Uzumaki's godfather and one of the Legendary Sannin?",
      answers: ["Jiraiya", "Kakashi Hatake", "Hiruzen Sarutobi", "Minato Namikaze"],
      correct: 0,
    },
    {
      scenario: "A younger shinobi asks what technique Naruto used that involved creating thousands of clones.",
      question: "What technique did Naruto use during the Land of Waves arc that flooded the battlefield with clones?",
      answers: ["Multiple Shadow Clone Jutsu", "Rasengan", "Summoning Jutsu", "Giant Shadow Clone"],
      correct: 0,
    },
    {
      scenario: "A shinobi outside the gates needs to verify which team number Neji, TenTen, and Rock Lee belong to.",
      question: "What is the squad number of Neji, TenTen, and Rock Lee's team under Might Guy?",
      answers: ["Team 9", "Team 7", "Team 8", "Team 11"],
      correct: 0,
    },
  ],

  // ════════════════════════════════════════════
  //  C-RANK  •  Standard Assignment
  // ════════════════════════════════════════════

  C: [
    {
      scenario: "Reports indicate that a Chunin Exam proctor has gone rogue. We need to confirm who runs the first stage.",
      question: "Who is the intimidating proctor in charge of the first stage of the Chunin Exams?",
      answers: ["Ibiki Morino", "Anko Mitarashi", "Hayate Gekkō", "Genma Shiranui"],
      correct: 0,
    },
    {
      scenario: "A shinobi from another village asks what the second phase of the Chunin Exams involves.",
      question: "What is the objective during the second stage of the Chunin Exams in the Forest of Death?",
      answers: ["Collect both Heaven and Earth scrolls and reach the tower", "Eliminate all rival teams", "Survive for a full week alone", "Find and return a hidden flag"],
      correct: 0,
    },
    {
      scenario: "The second stage proctor is being discussed in the mission hall. A chunin can't recall her name.",
      question: "Who is the proctor for the second stage of the Chunin Exams held in the Forest of Death?",
      answers: ["Anko Mitarashi", "Ibiki Morino", "Kurenai Yuhi", "Shizune"],
      correct: 0,
    },
    {
      scenario: "A clan historian is verifying which clan passes down the Expansion Jutsu as a secret technique.",
      question: "Which clan is known for body-expansion jutsu and forms the Ino-Shika-Cho trio with the Nara and Yamanaka?",
      answers: ["Akimichi", "Aburame", "Inuzuka", "Sarutobi"],
      correct: 0,
    },
    {
      scenario: "A jonin is testing a student on who uses insects as their primary combat tool.",
      question: "Which clan raises insects inside their bodies and deploys them as weapons?",
      answers: ["Aburame", "Akimichi", "Nara", "Inuzuka"],
      correct: 0,
    },
    {
      scenario: "A shinobi needs to confirm which clan can transfer their consciousness into another person's body.",
      question: "Which clan uses mind-transfer jutsu and works alongside the Nara and Akimichi?",
      answers: ["Yamanaka", "Hyuga", "Uchiha", "Inuzuka"],
      correct: 0,
    },
    {
      scenario: "A jonin asks a student what technique Shikamaru Nara is best known for.",
      question: "What is the name of Shikamaru Nara's signature jutsu that binds enemies by merging with their shadow?",
      answers: ["Shadow Possession Jutsu", "Shadow Sewing Jutsu", "Mind Transfer Jutsu", "Shadow Bind Technique"],
      correct: 0,
    },
    {
      scenario: "An intelligence report mentions that the Sharingan can evolve. A chunin wants details.",
      question: "What is the name of the evolved Sharingan that certain Uchiha awaken after great emotional trauma?",
      answers: ["Mangekyō Sharingan", "Eternal Sharingan", "Rinnegan", "Rinne Sharingan"],
      correct: 0,
    },
    {
      scenario: "A clanless shinobi asks what makes the Sharingan so dangerous in combat.",
      question: "Which of the following is a primary ability of the Sharingan?",
      answers: ["Copying and predicting enemy jutsu and movements", "Seeing chakra pathways inside the body", "Communicating with summoned animals", "Absorbing an opponent's chakra"],
      correct: 0,
    },
    {
      scenario: "A researcher is reviewing files on Haku, the boy from the Land of Waves. They need to confirm his bloodline ability.",
      question: "What rare Kekkei Genkai did Haku possess, allowing him to create mirrors of ice?",
      answers: ["Ice Release", "Lava Release", "Crystal Release", "Wood Release"],
      correct: 0,
    },
    {
      scenario: "Intelligence reports that an Akatsuki pair has been spotted near the border. One member uses explosive clay.",
      question: "Which Akatsuki member uses clay infused with chakra to create living explosive sculptures?",
      answers: ["Deidara", "Sasori", "Hidan", "Kakuzu"],
      correct: 0,
    },
    {
      scenario: "A spy inside the Akatsuki has sent a report about the organization's goal. Verify its accuracy.",
      question: "What is the stated goal of the Akatsuki throughout Naruto Shippuden?",
      answers: ["Capture all nine tailed beasts to complete the Ten-Tails", "Destroy the Five Great Nations", "Assassinate all five Kage", "Overthrow the daimyo of the Land of Fire"],
      correct: 0,
    },
    {
      scenario: "Orochimaru's former student Kabuto has resurfaced. You've been asked to review Orochimaru's lineage.",
      question: "Who was Orochimaru's teacher before he became one of the Legendary Sannin?",
      answers: ["Hiruzen Sarutobi (Third Hokage)", "Tobirama Senju", "Jiraiya", "Danzo Shimura"],
      correct: 0,
    },
    {
      scenario: "A sand ninja delegation is asking about which summoning animal Jiraiya uses.",
      question: "What type of creature does Jiraiya summon using the toad contract?",
      answers: ["Toads", "Snakes", "Slugs", "Monkeys"],
      correct: 0,
    },
    {
      scenario: "Reports confirm that Orochimaru's summoning contract involves giant serpents.",
      question: "What is the name of the giant snake Orochimaru summons as his primary battle summon?",
      answers: ["Manda", "Aoda", "Susa", "Yamata"],
      correct: 0,
    },
    {
      scenario: "Reconnaissance near the Hidden Sound Village is required. Confirm who governs that village.",
      question: "Who is the leader of the Hidden Sound Village (Otogakure)?",
      answers: ["Orochimaru", "Kabuto Yakushi", "Kimimaro", "Tayuya"],
      correct: 0,
    },
    {
      scenario: "A Hyuga clan elder has been asked to verify which branch is subject to the Caged Bird Seal.",
      question: "Which part of the Hyuga clan has the Caged Bird Seal placed on them?",
      answers: ["The Branch House", "The Main House", "All members", "Only the heirs"],
      correct: 0,
    },
    {
      scenario: "A jonin is quizzing a genin on the Neji vs Naruto fight during the Chunin Exam finals.",
      question: "Who does Naruto face and defeat in the final rounds of the Chunin Exams?",
      answers: ["Neji Hyuga", "Gaara", "Kiba Inuzuka", "Sasuke Uchiha"],
      correct: 0,
    },
    {
      scenario: "A genin asks what Temari's main weapon is after watching her effortlessly defeat an opponent.",
      question: "What weapon does Temari use in battle?",
      answers: ["A giant iron fan", "Puppet strings", "A sand gourd", "Twin blades"],
      correct: 0,
    },
    {
      scenario: "An intelligence analyst confirms that Kisame's partner in the Akatsuki is an Uchiha.",
      question: "Which Uchiha is partnered with Kisame Hoshigaki in the Akatsuki?",
      answers: ["Itachi Uchiha", "Sasuke Uchiha", "Obito Uchiha", "Madara Uchiha"],
      correct: 0,
    },
    {
      scenario: "Konoha intel requires confirmation of Itachi Uchiha's most feared genjutsu technique.",
      question: "What is the name of Itachi Uchiha's Mangekyō genjutsu that traps victims in a world of his creation?",
      answers: ["Tsukuyomi", "Amaterasu", "Susanoo", "Izanagi"],
      correct: 0,
    },
    {
      scenario: "A genin studying Gentle Fist taijutsu is confused about which clan developed it.",
      question: "Which clan uses the Gentle Fist taijutsu style, striking chakra points with pinpoint precision?",
      answers: ["Hyuga", "Uchiha", "Sarutobi", "Senju"],
      correct: 0,
    },
    {
      scenario: "A patrol report mentions Asuma Sarutobi uses bladed knuckle knives. A recruit asks about his lineage.",
      question: "What is the relationship between Asuma Sarutobi and the Third Hokage, Hiruzen Sarutobi?",
      answers: ["Asuma is Hiruzen's son", "Asuma is Hiruzen's student", "Asuma is Hiruzen's brother", "Asuma is Hiruzen's nephew"],
      correct: 0,
    },
    {
      scenario: "A spy report mentions Sasuke's fire technique was the first jutsu he mastered under the Uchiha clan.",
      question: "What is the name of the Great Fireball Jutsu that serves as a rite of passage for Uchiha clan members?",
      answers: ["Katon: Gokakyu no Jutsu", "Katon: Phoenix Flower Jutsu", "Katon: Dragon Flame Jutsu", "Katon: Fire Dragon Bullet"],
      correct: 0,
    },
    {
      scenario: "Intel has confirmed a criminal group is watching the village. A chunin asks who gave the Sannin their title.",
      question: "Which legendary shinobi gave Jiraiya, Orochimaru, and Tsunade the title of Sannin?",
      answers: ["Hanzo of the Salamander", "The Second Hokage", "The Daimyo of Fire", "Madara Uchiha"],
      correct: 0,
    },
    {
      scenario: "A student is asking about Naruto's first large-scale summon during the battle on the bridge.",
      question: "What is the name of the giant toad boss that Naruto summons for the first time during the Land of Waves battle?",
      answers: ["Gamabunta", "Gamakichi", "Gamatatsu", "Fukasaku"],
      correct: 0,
    },
    {
      scenario: "Reconnaissance confirms a group of Orochimaru's elite bodyguards are on the move.",
      question: "What is the name of the group of four elite shinobi that serves as Orochimaru's primary bodyguards?",
      answers: ["Sound Four", "Sound Five", "Orochimaru's Guard", "The Four Pillars"],
      correct: 0,
    },
    {
      scenario: "A jonin is testing their team on which Hyuga fights Hinata in the Chunin Exams.",
      question: "Which Hyuga clan member fights Hinata in the Chunin Exam preliminary rounds?",
      answers: ["Neji Hyuga", "Hanabi Hyuga", "Hiashi Hyuga", "Ko Hyuga"],
      correct: 0,
    },
    {
      scenario: "A genin wants to know what power Rock Lee unleashed at full force against Gaara during the exams.",
      question: "What hidden power does Rock Lee reveal against Gaara during the Chunin Exams final rounds?",
      answers: ["The Eight Inner Gates", "Primary Lotus", "Strong Fist barrage", "Dynamic Entry"],
      correct: 0,
    },
    {
      scenario: "Intelligence confirms that Kankuro uses a specific type of weapon during combat.",
      question: "What type of weapon does Kankuro specialize in?",
      answers: ["Puppets", "Sand manipulation", "Poisons only", "Giant fans"],
      correct: 0,
    },
    {
      scenario: "A civilian scholar asks which technique Ino Yamanaka uses that allows her to take over a person's body.",
      question: "What is the name of Ino Yamanaka's signature clan jutsu?",
      answers: ["Mind Transfer Jutsu", "Shadow Possession Jutsu", "Expansion Jutsu", "Gentle Fist"],
      correct: 0,
    },
    {
      scenario: "A jonin has been asked to confirm the team number Asuma Sarutobi leads.",
      question: "What is the squad number of the team Asuma Sarutobi leads, consisting of Shikamaru, Ino, and Choji?",
      answers: ["Team 10", "Team 7", "Team 8", "Team 9"],
      correct: 0,
    },
    {
      scenario: "A genin has heard that the Uchiha clan's eyes grow more powerful under extreme emotional distress.",
      question: "What is the Uchiha clan's basic dojutsu called?",
      answers: ["Sharingan", "Byakugan", "Rinnegan", "Rinne Sharingan"],
      correct: 0,
    },
    {
      scenario: "A spy mentions that one Akatsuki member is immortal and uses a ritual involving blood circles to kill enemies.",
      question: "Which Akatsuki member is immortal and uses a cursed ritual technique linked to his blood to kill targets?",
      answers: ["Hidan", "Kakuzu", "Deidara", "Kisame"],
      correct: 0,
    },
    {
      scenario: "A records clerk wants to know what the Hidden Leaf's country name is in official documents.",
      question: "What is the name of the country where the Hidden Leaf Village is located?",
      answers: ["Land of Fire", "Land of Wind", "Land of Earth", "Land of Lightning"],
      correct: 0,
    },
    {
      scenario: "A chunin exam registrar asks which village Gaara enters the exams representing.",
      question: "Which hidden village do Gaara, Temari, and Kankuro represent in the Chunin Exams?",
      answers: ["Hidden Sand Village", "Hidden Mist Village", "Hidden Stone Village", "Hidden Cloud Village"],
      correct: 0,
    },
  ],

  // ════════════════════════════════════════════
  //  B-RANK  •  Dangerous Operation
  // ════════════════════════════════════════════

  B: [
    {
      scenario: "Intelligence has identified the jinchuriki of the One-Tailed beast Shukaku. Confirm his identity.",
      question: "Who is the jinchuriki of Shukaku, the One-Tailed beast?",
      answers: ["Gaara", "Yugito Nii", "Utakata", "Roshi"],
      correct: 0,
    },
    {
      scenario: "A spy embedded in the Akatsuki has confirmed Pain's six bodies are under a single consciousness.",
      question: "What are Pain's six reanimated bodies collectively called?",
      answers: ["Six Paths of Pain", "Rinnegan Avatars", "The Ame Orphans", "Akatsuki Vanguard"],
      correct: 0,
    },
    {
      scenario: "A reconnaissance team has confirmed Kakuzu's unique survivability in combat. Explain the anomaly to command.",
      question: "Why is Kakuzu nearly impossible to kill in standard combat?",
      answers: ["He possesses five hearts — four stored as masked elemental creatures", "He can regenerate using stolen chakra", "He is immortal through a Jashin ritual", "He absorbs the life force of opponents"],
      correct: 0,
    },
    {
      scenario: "Akatsuki movements confirm that Sasori is using a powerful puppet as his main weapon. Identify it.",
      question: "What is Sasori's most fearsome puppet, which was converted from a real person?",
      answers: ["The Third Kazekage", "Hiruko", "Kankuro's Crow", "White Secret Technique"],
      correct: 0,
    },
    {
      scenario: "A Konoha jonin needs briefing on the forbidden technique Orochimaru uses to reanimate dead shinobi.",
      question: "What is the name of Orochimaru's forbidden technique that brings back the dead as immortal soldiers?",
      answers: ["Reanimation Jutsu (Edo Tensei)", "Living Corpse Reincarnation", "Soul Transfer Jutsu", "Summoning: Impure World"],
      correct: 0,
    },
    {
      scenario: "The Fifth Mizukage has requested a background check on her predecessor, who was reportedly controlled by an outside force.",
      question: "Which Mizukage was secretly under the genjutsu control of Obito Uchiha, earning the Hidden Mist its bloody reputation?",
      answers: ["Yagura (Fourth Mizukage)", "Mei Terumi (Fifth Mizukage)", "The Third Mizukage", "Ao"],
      correct: 0,
    },
    {
      scenario: "Intel on Killer B has arrived. Confirm which tailed beast is sealed within him.",
      question: "Which tailed beast is sealed within Killer B of the Hidden Cloud Village?",
      answers: ["Gyuki, the Eight-Tails", "Chomei, the Seven-Tails", "Kokuo, the Five-Tails", "Son Goku, the Four-Tails"],
      correct: 0,
    },
    {
      scenario: "The Hidden Cloud Village's Raikage is being briefed on Killer B's status. Confirm who the Fourth Raikage is.",
      question: "What is the name of the Fourth Raikage who leads the Hidden Cloud Village?",
      answers: ["A", "B", "Darui", "Omoi"],
      correct: 0,
    },
    {
      scenario: "A spy reports that the Two-Tails jinchuriki was recently captured by the Akatsuki. Confirm her identity.",
      question: "Who is the jinchuriki of Matatabi, the Two-Tailed Cat?",
      answers: ["Yugito Nii", "Fu", "Utakata", "Han"],
      correct: 0,
    },
    {
      scenario: "Intel confirms that the Akatsuki's field leader uses the Rinnegan and controls multiple bodies.",
      question: "Who is the field leader of the Akatsuki known as Pain, and what is his true name?",
      answers: ["Nagato", "Yahiko", "Obito Uchiha", "Madara Uchiha"],
      correct: 0,
    },
    {
      scenario: "You have been assigned to gather intel on the Village Hidden in the Rain. Confirm its Japanese name.",
      question: "What is the Japanese name for the Village Hidden in the Rain, Pain's base of operations?",
      answers: ["Amegakure", "Otogakure", "Yukigakure", "Kusagakure"],
      correct: 0,
    },
    {
      scenario: "Konoha intelligence confirms the death of Jiraiya during a mission. Determine who killed him.",
      question: "Who kills Jiraiya during his infiltration of the Hidden Rain Village?",
      answers: ["Pain (Nagato)", "Orochimaru", "Itachi Uchiha", "Kisame Hoshigaki"],
      correct: 0,
    },
    {
      scenario: "Records show that Minato sealed the Nine-Tails into Naruto. Confirm who else participated.",
      question: "Who performed the technique that sealed the Nine-Tailed Fox into Naruto on the night of his birth?",
      answers: ["Minato Namikaze and Kushina Uzumaki", "Hiruzen Sarutobi alone", "Minato alone using the Dead Demon Consuming Seal", "Jiraiya with Minato's assistance"],
      correct: 0,
    },
    {
      scenario: "A spy mentions that a masked figure claiming to be Madara has been manipulating the Akatsuki behind the scenes.",
      question: "What is the alias used by the masked man who posed as Madara Uchiha during early Shippuden?",
      answers: ["Tobi", "Zetsu", "Pein", "Juubi"],
      correct: 0,
    },
    {
      scenario: "An ANBU captain reports that Danzo leads a secret splinter faction within Konoha's forces. Identify it.",
      question: "What is the name of the secret ANBU subdivision founded and controlled by Danzo Shimura?",
      answers: ["Root (Foundation)", "Shadow Corps", "Black Ops Division", "Cipher Unit"],
      correct: 0,
    },
    {
      scenario: "The Nine-Tails' prior host before Kushina has been identified in historical records. Confirm who that was.",
      question: "Who was the jinchuriki of the Nine-Tails before Kushina Uzumaki?",
      answers: ["Mito Uzumaki", "Karin Uzumaki", "Rin Nohara", "An unnamed Senju"],
      correct: 0,
    },
    {
      scenario: "Reconnaissance reports that the Fifth Mizukage possesses two unique kekkei genkai. Confirm one of them.",
      question: "Which kekkei genkai does Mei Terumi, the Fifth Mizukage, possess?",
      answers: ["Lava Release and Boil Release", "Ice Release", "Wood Release", "Storm Release"],
      correct: 0,
    },
    {
      scenario: "Records indicate that Sasori was originally from the Hidden Sand Village and was the grandson of a clan elder.",
      question: "What is the name of Sasori's grandmother who is also a puppet master and helps fight him?",
      answers: ["Chiyo", "Pakura", "Ebizo", "Monzaemon"],
      correct: 0,
    },
    {
      scenario: "A jonin asks who among the Akatsuki serves a unique solo role and can split into two separate beings.",
      question: "Which Akatsuki member can separate into two distinct forms and has no permanent partner?",
      answers: ["Zetsu", "Konan", "Tobi", "Kisame"],
      correct: 0,
    },
    {
      scenario: "The Hidden Stone Village wants to establish diplomatic contact. Confirm who their Kage is.",
      question: "Who is the Third Tsuchikage leading the Hidden Stone Village during the events of Shippuden?",
      answers: ["Onoki", "Mu", "Han", "Kurotsuchi"],
      correct: 0,
    },
    {
      scenario: "A Hidden Mist shinobi mentions that Kisame's sword eats chakra rather than the user.",
      question: "What is the name of Kisame Hoshigaki's living sword that absorbs the chakra of its victims?",
      answers: ["Samehada", "Kubikiribōchō", "Nuibari", "Kabutowari"],
      correct: 0,
    },
    {
      scenario: "An intelligence dossier on the Uzumaki clan has been flagged as urgent.",
      question: "What are the Uzumaki clan renowned for, which caused other nations to fear and destroy them?",
      answers: ["Sealing jutsu and massive chakra reserves", "Dojutsu and visual prowess", "Wood Release and healing", "Taijutsu and physical endurance"],
      correct: 0,
    },
    {
      scenario: "A jonin needs to know which two elders on Mount Myoboku taught Jiraiya to enter Sage Mode.",
      question: "Which two elder toads trained Jiraiya in Sage Mode on Mount Myoboku?",
      answers: ["Fukasaku and Shima", "Gamabunta and Gamakichi", "Gamamaru and Gamahiro", "Gamaken and Fukasaku"],
      correct: 0,
    },
    {
      scenario: "Konoha intel has confirmed that Hidan's body cannot die through normal means.",
      question: "What is Hidan's unique ability that makes him virtually immortal?",
      answers: ["He cannot be killed due to Jashin rituals and uses a cursed link to share damage with victims", "He possesses multiple hearts stolen from other shinobi", "He regenerates by absorbing his enemy's chakra", "He uses forbidden clay to recreate his body"],
      correct: 0,
    },
    {
      scenario: "Records on the Akatsuki's Konan reveal she was one of its original co-founders.",
      question: "Which village did Konan, Nagato, and Yahiko originally come from and found the early Akatsuki in?",
      answers: ["Hidden Rain Village (Amegakure)", "Hidden Leaf Village", "Hidden Stone Village", "Hidden Waterfall Village"],
      correct: 0,
    },
    {
      scenario: "A patrol confirms that Might Guy's fighting style involves dangerously opening internal gates.",
      question: "What is the name of the technique Might Guy and Rock Lee use that forcibly opens the body's chakra limiters?",
      answers: ["Eight Inner Gates", "Eight Trigrams", "Lotus Gates", "Heavenly Gates Technique"],
      correct: 0,
    },
    {
      scenario: "Intel confirms that Sasuke formed his own team after leaving Konoha. Identify the team's initial name.",
      question: "What was Sasuke's team first called when he formed it to hunt down Itachi?",
      answers: ["Hebi (Snake)", "Taka (Hawk)", "Karasu (Crow)", "Ryu (Dragon)"],
      correct: 0,
    },
    {
      scenario: "A chunin asks who trained Minato Namikaze when he was a genin.",
      question: "Who was Minato Namikaze's jonin sensei when he was a student?",
      answers: ["Jiraiya", "Hiruzen Sarutobi", "Tobirama Senju", "Orochimaru"],
      correct: 0,
    },
    {
      scenario: "The Five Kage Summit has concluded. Identify who Sasuke assassinated following the event.",
      question: "Who does Sasuke kill following the Five Kage Summit, completing his revenge mission?",
      answers: ["Danzo Shimura", "Hiruzen Sarutobi", "The Fourth Raikage", "Onoki"],
      correct: 0,
    },
    {
      scenario: "A spy report confirms the jinchuriki of the Six-Tails has been identified. Verify the name.",
      question: "Who is the jinchuriki of Saiken, the Six-Tailed Slug?",
      answers: ["Utakata", "Roshi", "Fu", "Han"],
      correct: 0,
    },
    {
      scenario: "A shinobi asks what gave the Hidden Mist Village the nickname Village of the Bloody Mist.",
      question: "What brutal graduation practice gave the Hidden Mist Village its fearsome nickname?",
      answers: ["Graduates were forced to kill each other to pass", "Students had to defeat a jonin in combat", "All failing students were executed", "Students fought wild beasts to graduate"],
      correct: 0,
    },
    {
      scenario: "The Hidden Leaf council is discussing the origins of the Third Hokage's training.",
      question: "Who trained Hiruzen Sarutobi (Third Hokage) during his years as a genin?",
      answers: ["Hashirama and Tobirama Senju", "Jiraiya and Orochimaru", "Minato Namikaze", "Danzo Shimura"],
      correct: 0,
    },
    {
      scenario: "An intelligence unit confirms that Kabuto has been surgically modifying himself in the Shippuden era.",
      question: "Whose DNA did Kabuto integrate into himself to dramatically boost his power?",
      answers: ["Orochimaru's", "Madara Uchiha's", "Hashirama Senju's", "The First Hokage's cells"],
      correct: 0,
    },
    {
      scenario: "Command needs to know what the signature move of the Fourth Hokage was that made him a legend.",
      question: "What technique allowed Minato Namikaze to teleport instantly to any marked location?",
      answers: ["Flying Thunder God Technique (Hiraishin)", "Body Flicker Jutsu", "Kamui", "Space-Time Barrier"],
      correct: 0,
    },
    {
      scenario: "A hidden contact has sent a report on the Akatsuki's paired member arrangement. Identify Konan's partner.",
      question: "Who was Konan paired with in the Akatsuki?",
      answers: ["Pain (Nagato)", "Itachi Uchiha", "Zetsu", "Kisame Hoshigaki"],
      correct: 0,
    },
    {
      scenario: "A jonin asks why Naruto could not enter Sage Mode the same way Jiraiya did.",
      question: "Why was Naruto unable to gather natural energy for Sage Mode the same way as Jiraiya?",
      answers: ["He couldn't stay still long enough, so he used Shadow Clones to gather it for him", "He lacked a toad contract strong enough", "His chakra network was incompatible with natural energy", "He had not yet mastered the Rasengan fully"],
      correct: 0,
    },
  ],

  // ════════════════════════════════════════════
  //  A-RANK  •  High Priority Mission
  // ════════════════════════════════════════════

  A: [
    {
      scenario: "Classified historical records confirm that the Akatsuki was not originally a criminal organization.",
      question: "Who founded the original Akatsuki as a peace-seeking organization before it became criminal?",
      answers: ["Yahiko", "Nagato", "Obito Uchiha", "Hanzo of the Salamander"],
      correct: 0,
    },
    {
      scenario: "Highly classified records reveal that Minato's three genin students included two who became critical to history.",
      question: "Who were the three genin on Minato Namikaze's team?",
      answers: ["Kakashi Hatake, Obito Uchiha, and Rin Nohara", "Kakashi Hatake, Rin Nohara, and Might Guy", "Obito Uchiha, Kakashi, and Kurenai", "Kakashi, Obito, and Asuma"],
      correct: 0,
    },
    {
      scenario: "An ANBU dossier has been declassified. Confirm Kakashi Hatake's ANBU codename.",
      question: "What was Kakashi Hatake's codename during his time as an ANBU operative?",
      answers: ["Inu (Dog)", "Neko (Cat)", "Tori (Bird)", "Uma (Horse)"],
      correct: 0,
    },
    {
      scenario: "A classified file confirms Yamato served in ANBU under a different name. Verify his former codename.",
      question: "What was Yamato's original name and ANBU codename before he was assigned to Team Kakashi?",
      answers: ["Tenzo", "Kinoe", "Neko", "Sai"],
      correct: 0,
    },
    {
      scenario: "Declassified intelligence confirms that Orochimaru attempted to take over Itachi's body but was severely repelled.",
      question: "Before targeting Sasuke, whose body did Orochimaru originally desire for his immortality ritual?",
      answers: ["Itachi Uchiha", "Kakashi Hatake", "Naruto Uzumaki", "The Third Hokage"],
      correct: 0,
    },
    {
      scenario: "An ANBU analyst confirms that Shisui Uchiha possessed the most powerful genjutsu eye in Uchiha history.",
      question: "What is the name of Shisui Uchiha's most powerful Mangekyō Sharingan technique?",
      answers: ["Kotoamatsukami", "Tsukuyomi", "Amaterasu", "Izanami"],
      correct: 0,
    },
    {
      scenario: "Intelligence confirms that the Uchiha clan massacre was not carried out on Itachi's sole initiative.",
      question: "Who ordered Itachi Uchiha to massacre the Uchiha clan to prevent a coup?",
      answers: ["Danzo Shimura and the village elders with Hiruzen's reluctant consent", "Hiruzen Sarutobi alone", "The Fire Daimyo", "Tobirama Senju through Edo Tensei"],
      correct: 0,
    },
    {
      scenario: "A historian confirms that Madara Uchiha co-founded the Hidden Leaf Village despite being considered an enemy.",
      question: "Who co-founded the Hidden Leaf Village alongside Hashirama Senju?",
      answers: ["Madara Uchiha", "Tobirama Senju", "Izuna Uchiha", "Hiruzen Sarutobi"],
      correct: 0,
    },
    {
      scenario: "A top-secret document reveals how Madara Uchiha survived his supposed death after fighting Hashirama.",
      question: "How did Madara Uchiha survive his battle with Hashirama at the Valley of the End?",
      answers: ["He used Izanagi with the First Hokage's stolen cells to fake his death", "He transferred his soul into another body", "He activated Edo Tensei on himself", "He fled using the Flying Thunder God Technique"],
      correct: 0,
    },
    {
      scenario: "A classified record confirms that Hashirama Senju had a wife from another notable clan.",
      question: "Who was Hashirama Senju's wife and the first jinchuriki of the Nine-Tailed Fox?",
      answers: ["Mito Uzumaki", "Kushina Uzumaki", "Karin Uzumaki", "Tayuya"],
      correct: 0,
    },
    {
      scenario: "Counterintelligence has flagged the Uchiha clan's forbidden eye techniques that trade sight for power.",
      question: "What are the names of the two forbidden Uchiha eye techniques that consume the user's sight?",
      answers: ["Izanagi and Izanami", "Tsukuyomi and Amaterasu", "Susanoo and Kamui", "Kotoamatsukami and Izanagi"],
      correct: 0,
    },
    {
      scenario: "A covert operative confirms that Obito Uchiha's Mangekyō technique allows him to warp things into another dimension.",
      question: "What is the name of Obito Uchiha's Mangekyō Sharingan technique that transports targets to another dimension?",
      answers: ["Kamui", "Tsukuyomi", "Amaterasu", "Susanoo"],
      correct: 0,
    },
    {
      scenario: "An old record reveals that Nagato, Konan, and Yahiko were orphans trained by a legendary ninja.",
      question: "Which legendary Sannin taught Nagato, Konan, and Yahiko to become shinobi?",
      answers: ["Jiraiya", "Orochimaru", "Hanzo of the Salamander", "Danzo Shimura"],
      correct: 0,
    },
    {
      scenario: "A classified mission report from the Third Great Ninja War references a tragedy involving Minato's team.",
      question: "Who was the teammate of Kakashi and Obito who was later captured and used in a scheme involving the Three-Tails?",
      answers: ["Rin Nohara", "Kushina Uzumaki", "Yugao Uzuki", "Anko Mitarashi"],
      correct: 0,
    },
    {
      scenario: "A Hidden Leaf ANBU operative suspects that the Fourth Kazekage attempted to have his own son killed. Verify.",
      question: "What did the Fourth Kazekage Rasa decide to do with Gaara after deeming him a failed weapon?",
      answers: ["Have him assassinated", "Seal Shukaku away from him", "Exile him from the village", "Imprison him beneath the Sand"],
      correct: 0,
    },
    {
      scenario: "A recovered scroll details the origin of the Rinnegan. Confirm how Nagato came to possess it.",
      question: "Who transplanted the Rinnegan into Nagato as a child without his knowledge?",
      answers: ["Madara Uchiha", "Obito Uchiha", "Hashirama Senju", "Zetsu"],
      correct: 0,
    },
    {
      scenario: "Intelligence confirms that Shisui Uchiha died under suspicious circumstances. Determine what happened.",
      question: "What did Danzo Shimura steal from Shisui Uchiha, driving him to sacrifice himself?",
      answers: ["His right eye (Kotoamatsukami)", "His Susanoo technique", "His fragment scrolls", "His clan seal"],
      correct: 0,
    },
    {
      scenario: "A deep-cover agent reports that the masked man behind the Nine-Tails' attack on Konoha has been identified.",
      question: "Who used the Sharingan to summon and direct the Nine-Tails to attack Konoha on the night Naruto was born?",
      answers: ["Obito Uchiha", "Madara Uchiha", "Zetsu", "An unknown Uchiha rogue"],
      correct: 0,
    },
    {
      scenario: "An ANBU file reveals that Might Guy's father sacrificed himself using a legendary forbidden technique.",
      question: "What technique did Might Guy's father, Might Duy, use to sacrifice himself to save his son?",
      answers: ["Opening all Eight Inner Gates at once", "Primary Lotus combined with self-destruction", "A forbidden Sealing Jutsu", "Dynamic Entry with explosive tags"],
      correct: 0,
    },
    {
      scenario: "A classified record shows that the Uchiha clan was planning a coup against the Hidden Leaf.",
      question: "What event triggered the Uchiha clan to begin plotting their coup against the Hidden Leaf leadership?",
      answers: ["Being blamed for the Nine-Tails' attack and relocated to the village outskirts", "The death of Fugaku Uchiha", "The Chunin Exams massacre", "Danzo's assassination attempt on Shisui"],
      correct: 0,
    },
    {
      scenario: "A deep lore investigation reveals that Orochimaru was caught performing terrible acts inside Konoha.",
      question: "Why did Orochimaru leave the Hidden Leaf Village and become a missing-nin?",
      answers: ["He was caught performing forbidden experiments on living humans to achieve immortality", "He attempted to assassinate the Third Hokage first", "He joined the Akatsuki against the village's orders", "He defected after losing a match against Jiraiya"],
      correct: 0,
    },
    {
      scenario: "An operative reports that the Uzumaki clan's homeland was destroyed generations ago.",
      question: "What was the name of the Uzumaki clan's homeland that was destroyed out of fear of their sealing arts?",
      answers: ["Uzushiogakure", "Amegakure", "Kukagakure", "Uzugakure"],
      correct: 0,
    },
    {
      scenario: "An intelligence dossier on Sasuke's eye techniques lists a black flame that cannot be extinguished.",
      question: "What is the name of Itachi and Sasuke's Mangekyō technique that produces inextinguishable black flames?",
      answers: ["Amaterasu", "Tsukuyomi", "Kagutsuchi", "Susanoo Flame Arrow"],
      correct: 0,
    },
    {
      scenario: "A classified scroll notes that Naruto's wind-enhanced Rasengan was considered impossible by Kakashi.",
      question: "What is the name of the wind-nature Rasengan that Naruto created, which even Minato could not complete?",
      answers: ["Rasenshuriken", "Wind Release Rasengan", "Tornado Rasengan", "Spiraling Wind Ball"],
      correct: 0,
    },
    {
      scenario: "A Hidden Leaf historian asks about the founding clan dynamics that originally created village alliances.",
      question: "What was the primary reason the Senju and Uchiha clans originally agreed to form the Hidden Leaf Village?",
      answers: ["To end the cycle of war and create a stable society for children", "To combine their armies against the Hidden Stone", "To share the secrets of the Sharingan and Wood Release", "The Fire Daimyo ordered the merger"],
      correct: 0,
    },
    {
      scenario: "A recovered Akatsuki scroll lists a member who could split his body into two separate beings.",
      question: "What are the two distinct forms Zetsu can separate into, each with different abilities?",
      answers: ["Black Zetsu and White Zetsu", "Dark Zetsu and Light Zetsu", "Shadow Zetsu and Bone Zetsu", "Void Zetsu and Flesh Zetsu"],
      correct: 0,
    },
    {
      scenario: "A deep-cover operative has confirmed the true identity of the masked man manipulating the Akatsuki.",
      question: "What is the true identity of the masked man called Tobi who manipulated the Akatsuki?",
      answers: ["Obito Uchiha", "Madara Uchiha", "Izuna Uchiha", "An unknown Uchiha clone"],
      correct: 0,
    },
    {
      scenario: "An ANBU record confirms that Kakashi gained his Sharingan from a dying teammate.",
      question: "How did Kakashi Hatake obtain his Sharingan?",
      answers: ["Obito Uchiha gave it to him as he lay dying, crushed under rubble", "He transplanted it from a fallen enemy during the war", "Minato performed surgery to give it to him", "He awakened it himself after witnessing Rin's death"],
      correct: 0,
    },
    {
      scenario: "A classified Hyuga clan record details the main house's method of controlling the branch family.",
      question: "What is the name of the seal placed on Hyuga branch members that destroys their Byakugan upon death?",
      answers: ["Caged Bird Seal (Juinjutsu)", "Cursed Seal of Heaven", "Mind Bind Seal", "Byakugan Suppress Seal"],
      correct: 0,
    },
    {
      scenario: "An operative reveals that Sasori converted himself into a puppet long before his death.",
      question: "What did Sasori do to himself that made him both a puppet master and a puppet simultaneously?",
      answers: ["He converted his own body into a puppet, keeping only his living core inside", "He merged his chakra permanently with his puppets", "He used Orochimaru's immortality technique", "He transferred his soul into Hiruko permanently"],
      correct: 0,
    },
    {
      scenario: "Classified records reveal the original technique that gave rise to all ninjutsu.",
      question: "What is Hagoromo Otsutsuki, the Sage of Six Paths, credited with creating?",
      answers: ["Ninshu, the original chakra-sharing art that became ninjutsu", "The first Sharingan transplant technique", "The Rinnegan transplant technique", "The Reanimation Jutsu"],
      correct: 0,
    },
    {
      scenario: "An ancient scroll details the monstrous beast that the Sage of Six Paths divided into the nine tailed beasts.",
      question: "What is the name of the original beast that Kaguya Otsutsuki transformed into and was later split into the nine tailed beasts?",
      answers: ["Ten-Tails (Juubi)", "Nine-Tails (Kurama)", "Infinite Tsukuyomi Beast", "God Tree Beast"],
      correct: 0,
    },
    {
      scenario: "A sealed village document reveals where Naruto trained to prepare for his first encounter with Pain.",
      question: "In which location did Naruto train to master Sage Mode before facing Pain?",
      answers: ["Mount Myoboku", "The Land of Toads", "The Sacred Toad Mountain", "Shikkotsu Forest"],
      correct: 0,
    },
    {
      scenario: "A recovered letter from a battlefield reveals that Itachi left something inside Naruto before his death.",
      question: "What did Itachi Uchiha secretly place inside Naruto before his death, which activated later to protect Sasuke?",
      answers: ["A crow with Shisui's Kotoamatsukami eye implanted", "A fragment of the Mangekyō Sharingan", "Amaterasu encoded into Naruto's eye", "A sealed letter with Uchiha clan secrets"],
      correct: 0,
    },
    {
      scenario: "Classified files confirm that Obito's Sharingan awakening was triggered by a specific incident in the Third Shinobi War.",
      question: "What triggered Obito Uchiha's Sharingan awakening during the Third Great Ninja War?",
      answers: ["Seeing Rin kidnapped and his friends in mortal danger", "Being crushed by the boulder", "Witnessing Kakashi's near-death from an enemy attack", "The death of his team's mission target"],
      correct: 0,
    },
    {
      scenario: "An ANBU record references the legendary final battle between the founders of the Hidden Leaf.",
      question: "What is the name of the location where Madara Uchiha and Hashirama Senju had their legendary final battle?",
      answers: ["Valley of the End", "Final Clash Gorge", "The Senju-Uchiha Crossing", "Konoha's Northern Front"],
      correct: 0,
    },
  ],
};

module.exports = { MISSIONS };
