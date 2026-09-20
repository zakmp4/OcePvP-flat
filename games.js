/* ============================================================
   OcePvP - games list
   ------------------------------------------------------------
   This is the only file you edit to change the Games page (and
   the games preview on the home page). No database - just edit,
   save, and refresh.

   Each game looks like this. Copy the block, fill it in, and put
   a comma between games:

   {
     name: "Bedwars",
     icon: "🛏️",                          // any emoji
     description: "Protect your bed, destroy theirs.",
     players: "2-16 players",             // optional
     tags: ["Teams", "PvP"],              // optional
     status: "New"                        // optional: "New", "Beta", "Coming soon"
   },

   Games show up in the order they are listed here.
   ============================================================ */

const GAMES = [
  {
    name: "Sumo",
    icon: "🤼",
    description: "Knock your opponent off the platform. No damage, just knockback — last one standing wins.",
    tags: ["PvP", "Knockback"]
  },
  {
    name: "Spleef",
    icon: "❄️",
    description: "Break the floor out from under everyone else. Fall through and you're out.",
    tags: ["Last one standing"]
  },
  {
    name: "Parkour",
    icon: "🏃",
    description: "Jump your way through the course. Beat it, then beat your time.",
    tags: ["Movement"]
  },
  {
    name: "Pillars of Fortune",
    icon: "🎲",
    description: "Everyone starts on their own pillar with random items. Build, bridge and knock the others off.",
    tags: ["PvP", "Random items"]
  },
  {
    name: "KOTH",
    icon: "👑",
    description: "King of the Hill. Take the hill, hold it, and stay on top the longest to win.",
    tags: ["PvP", "Objective"]
  },
  {
    name: "Capture the Flag",
    icon: "🚩",
    description: "Grab the enemy flag and bring it back to your base — without losing your own.",
    tags: ["Teams", "Objective"]
  },
  {
    name: "BowKB",
    icon: "🏹",
    description: "Bows with knockback. Blast everyone else off the map.",
    tags: ["PvP", "Knockback"]
  },
  {
    name: "Bedwars",
    icon: "🛏️",
    description: "Protect your bed, destroy theirs. Once your bed is gone, you don't respawn.",
    tags: ["Teams", "PvP"]
  }
];
