/**
 * Giglet — seed script
 *
 * Creates the curated Scratch mission library plus a realistic demo family:
 *
 *   Parent   demo@giglet.app     / demo1234   (Laila, mother of Maya & Adam)
 *   Donor    grandma@giglet.app  / demo1234   (Grandma Rose, member of Maya's circle)
 *   Donor    samy@giglet.app     / demo1234   (Uncle Samy, member of Maya's circle)
 */
import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

type TaskSeed = {
  slug: string;
  ageBand: "AGE_8_10" | "AGE_11_13" | "AGE_14_17";
  title: string;
  summary: string;
  instructions: string;
  deliverable: string;
  rubric: string[];
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  points: number;
  estimatedMinutes: number;
  order: number;
};

const tasks: TaskSeed[] = [
  // ── Ages 8–10 · Foundations ──────────────────────────────────
  {
    slug: "draw-with-code",
    ageBand: "AGE_8_10",
    title: "Draw with Code: Your First Sprite",
    summary: "Create your very own sprite and make it respond when someone clicks it.",
    instructions:
      "Open Scratch and either draw a brand-new sprite in the Paint Editor or heavily customize an existing one (new costume, colors, accessories).\n\nThen add code so that when the sprite is clicked, it does at least two things — for example it changes color, plays a sound, and says something.",
    deliverable: "A shared Scratch project link. The project must be named, and clicking the sprite must trigger at least two effects.",
    rubric: [
      "Sprite is drawn or visibly customized (not a default costume)",
      "Clicking the sprite triggers at least two different effects",
      "A sound effect is used somewhere",
      "Project is saved, named, and shared with a public link",
    ],
    difficulty: "BEGINNER",
    points: 10,
    estimatedMinutes: 25,
    order: 1,
  },
  {
    slug: "say-hello-robot",
    ageBand: "AGE_8_10",
    title: "Say Hello, Robot",
    summary: "Write a short scripted conversation between two characters using speech bubbles.",
    instructions:
      "Create a scene with two characters. When the green flag is clicked, the two characters should have a short conversation — at least 4 lines total, back and forth.\n\nUse 'say ... for 2 seconds' blocks and 'wait' blocks so the timing feels like a real conversation, not everyone talking at once.",
    deliverable: "A shared Scratch project link where pressing the green flag plays the full conversation automatically.",
    rubric: [
      "Two characters are present on stage",
      "At least 4 lines of dialogue, alternating between characters",
      "Timing blocks used so lines don't overlap",
      "Conversation starts from the green flag",
    ],
    difficulty: "BEGINNER",
    points: 10,
    estimatedMinutes: 20,
    order: 2,
  },
  {
    slug: "maze-starter",
    ageBand: "AGE_8_10",
    title: "Maze Starter",
    summary: "Draw a maze backdrop and guide a sprite through it with the arrow keys.",
    instructions:
      "Draw your own maze as a stage backdrop in the Paint Editor (use one clear wall color).\n\nProgram a sprite to move with the arrow keys. If the sprite touches the wall color, it must go back to the start position. Reaching the goal shows a 'You win!' message.",
    deliverable: "A shared Scratch project link: arrow keys move the sprite, touching walls resets position, and the goal shows a win message.",
    rubric: [
      "Maze backdrop is hand-drawn with clear walls",
      "Sprite moves smoothly with all four arrow keys",
      "Touching a wall sends the sprite back to start",
      "A win condition with a message exists",
    ],
    difficulty: "BEGINNER",
    points: 10,
    estimatedMinutes: 35,
    order: 3,
  },
  {
    slug: "click-the-cat",
    ageBand: "AGE_8_10",
    title: "Click the Cat",
    summary: "Build a clicker game with a score variable — your first game with memory.",
    instructions:
      "Make a clicking game: a character moves to a random position every second, and the player clicks it to score points.\n\nCreate a variable called 'Score'. Each successful click adds 1 point and plays a sound. Add a 30-second timer that ends the game and shows the final score.",
    deliverable: "A shared Scratch project link with a working score variable, random movement, and a timed game-over screen.",
    rubric: [
      "Uses a Score variable that updates correctly on clicks",
      "Sprite teleports to random positions on an interval",
      "A 30-second timer ends the game cleanly",
      "Final score is displayed when time runs out",
    ],
    difficulty: "BEGINNER",
    points: 10,
    estimatedMinutes: 35,
    order: 4,
  },
  {
    slug: "music-band",
    ageBand: "AGE_8_10",
    title: "One-Kid Band",
    summary: "Turn your keyboard into an instrument with at least four playable notes or sounds.",
    instructions:
      "Build a musical instrument: pressing different keys (e.g. A, S, D, F) plays different notes or drum sounds.\n\nAdd at least four keys. Dress it up — the sprite should do something visual (change color, bounce) when each note plays. Bonus: add a 'record' button made of a list that remembers the last notes played.",
    deliverable: "A shared Scratch project link where 4+ keyboard keys each produce a distinct sound with a matching visual effect.",
    rubric: [
      "At least 4 keys mapped to distinct sounds",
      "A visual reaction accompanies each sound",
      "Notes use the Music extension or uploaded sounds",
      "Project runs from the green flag",
    ],
    difficulty: "INTERMEDIATE",
    points: 20,
    estimatedMinutes: 40,
    order: 5,
  },
  {
    slug: "catch-the-stars",
    ageBand: "AGE_8_10",
    title: "Catch the Falling Stars",
    summary: "Use clones to make stars fall from the sky and catch them with a basket.",
    instructions:
      "Program a game where stars fall from random positions at the top of the screen. The player moves a basket left and right with the arrow keys to catch them.\n\nYou must use 'create clone of' blocks for the falling stars. Catching a star scores a point; missing one loses a life. You start with 3 lives.",
    deliverable: "A shared Scratch project link with clone-based falling stars, a score variable, and a 3-strikes game over.",
    rubric: [
      "Clones are used for the falling objects",
      "Basket moves with arrow keys",
      "Score increases on catch; lives decrease on miss",
      "Game over screen appears at 0 lives",
    ],
    difficulty: "INTERMEDIATE",
    points: 20,
    estimatedMinutes: 50,
    order: 6,
  },
  {
    slug: "quiz-show",
    ageBand: "AGE_8_10",
    title: "Quiz Show Host",
    summary: "Build an interactive quiz with the ask/answer block, score tracking, and a finale.",
    instructions:
      "Create a quiz with at least 5 questions about any topic you love (space, animals, football — your pick).\n\nUse 'ask ... and wait' and the 'answer' block to check responses. Track a Score variable, react to right and wrong answers differently, and give the player a grade at the end based on their score.",
    deliverable: "A shared Scratch project link with 5+ questions, answer checking, scoring, and an end-of-quiz grade message.",
    rubric: [
      "At least 5 questions using ask/answer",
      "Answers checked with conditionals (if/else)",
      "Score variable tracked and shown",
      "Different final message depending on score",
    ],
    difficulty: "INTERMEDIATE",
    points: 20,
    estimatedMinutes: 45,
    order: 7,
  },
  {
    slug: "animated-story",
    ageBand: "AGE_8_10",
    title: "Animated Story: Two Scenes",
    summary: "Tell a story across two backdrops using broadcasts to move between scenes.",
    instructions:
      "Create a short animated story (30–60 seconds) with at least two different backdrops and two characters.\n\nUse 'broadcast' and 'when I receive' messages to switch scenes and coordinate what characters do. Something interesting should happen — a surprise, a joke, a plot twist.",
    deliverable: "A shared Scratch project link: green flag starts the story, broadcasts drive scene changes, and the story ends gracefully.",
    rubric: [
      "At least 2 backdrops and 2 characters",
      "Broadcasts coordinate the action between sprites",
      "Story has a beginning, middle, and end",
      "Runs start-to-finish from the green flag",
    ],
    difficulty: "INTERMEDIATE",
    points: 20,
    estimatedMinutes: 60,
    order: 8,
  },
  {
    slug: "virtual-pet",
    ageBand: "AGE_8_10",
    title: "Virtual Pet",
    summary: "Keep a pet alive using hunger and happiness variables and care buttons.",
    instructions:
      "Create a virtual pet. It has two variables: Hunger and Happiness, both starting at 50. Hunger slowly rises over time; Happiness slowly falls.\n\nAdd buttons (sprites) to Feed and Play with the pet, which adjust the variables. If Hunger hits 100 or Happiness hits 0, the pet runs away (game over). If you keep it happy for 2 minutes, you win.",
    deliverable: "A shared Scratch project link with working Hunger/Happiness variables, care buttons, and both win and lose conditions.",
    rubric: [
      "Two variables change automatically over time",
      "Feed/Play buttons correctly affect the variables",
      "Lose condition triggers properly",
      "Win condition triggers after surviving 2 minutes",
    ],
    difficulty: "ADVANCED",
    points: 30,
    estimatedMinutes: 70,
    order: 9,
  },
  {
    slug: "paint-studio",
    ageBand: "AGE_8_10",
    title: "Paint Studio",
    summary: "Build a drawing app with the pen extension: color picker, brush sizes, and eraser.",
    instructions:
      "Using the Pen extension, build an app where the user draws with the mouse.\n\nAdd at least: 4 color choices, 2 brush sizes, an eraser, and a 'clear canvas' button. Buttons should be clickable sprites on the side of the stage, like a real app toolbar.",
    deliverable: "A shared Scratch project link of a working paint app with its own toolbar UI.",
    rubric: [
      "Pen follows the mouse only while drawing",
      "4+ colors and 2+ brush sizes selectable",
      "Eraser and clear-canvas both work",
      "Toolbar is laid out like a real app UI",
    ],
    difficulty: "ADVANCED",
    points: 30,
    estimatedMinutes: 75,
    order: 10,
  },
  // ── Ages 11–13 · Real game architecture ──────────────────────
  {
    slug: "dodge-the-lasers",
    ageBand: "AGE_11_13",
    title: "Dodge the Lasers",
    summary: "Survive waves of laser clones in an arcade dodger with escalating difficulty.",
    instructions:
      "Build an arcade survival game. The player ship moves with the arrow keys. Laser clones spawn from the edges at increasing speed.\n\nTrack survival Time as the score. Every 15 seconds, the spawn rate increases (use a 'Level' variable). One hit and it's game over — show the final time and a 'New best!' message if the player beat their best time (stored in a variable).",
    deliverable: "A shared Scratch project link with clone-based hazards, a difficulty ramp, and a persistent best-time variable.",
    rubric: [
      "Clones spawn from screen edges with random directions",
      "Level variable increases difficulty over time",
      "Collision ends the game immediately",
      "Best-time tracking works across runs in one session",
    ],
    difficulty: "INTERMEDIATE",
    points: 20,
    estimatedMinutes: 60,
    order: 11,
  },
  {
    slug: "flappy-jumper",
    ageBand: "AGE_11_13",
    title: "Flappy-Style Jumper",
    summary: "Recreate gravity and jumping physics with pipe clones and a score counter.",
    instructions:
      "Build a flappy-style game: holding space makes the character flap; gravity constantly pulls it down.\n\nPipes spawn as clones from the right and scroll left. Passing a pipe scores 1 point; touching a pipe or the ground ends the game. Physics must feel smooth — use a 'y-velocity' variable, not fixed glides.",
    deliverable: "A shared Scratch project link with velocity-based gravity, scrolling pipe clones, and scoring.",
    rubric: [
      "Gravity and flap use a velocity variable (smooth physics)",
      "Pipes spawn as clones with a random gap position",
      "Score increments only when passing a pipe",
      "Game over on pipe or ground collision",
    ],
    difficulty: "ADVANCED",
    points: 30,
    estimatedMinutes: 70,
    order: 12,
  },
  {
    slug: "weather-wizard",
    ageBand: "AGE_11_13",
    title: "Weather Wizard",
    summary: "Use lists and string logic to build a command-based weather forecaster.",
    instructions:
      "Build an app that answers weather questions. Store at least 8 weather conditions in a list with matching advice in a second list ('sunny' → 'Wear sunscreen!').\n\nThe user types a condition ('sunny', 'rainy', 'snowy'...). Your wizard sprite looks it up in the list and responds with the matching advice, plus a random fun fact pulled from a third list. Handle unknown inputs politely.",
    deliverable: "A shared Scratch project link using 2+ parallel lists, lookup logic, and graceful handling of unknown words.",
    rubric: [
      "Parallel lists store conditions and advice",
      "Lookup uses a loop or 'item # of' correctly",
      "A random fun-fact list is integrated",
      "Unknown words get a friendly fallback response",
    ],
    difficulty: "INTERMEDIATE",
    points: 20,
    estimatedMinutes: 50,
    order: 13,
  },
  {
    slug: "space-shooter",
    ageBand: "AGE_11_13",
    title: "Space Shooter: Wave Defense",
    summary: "Nested clones, lives, scoring and waves — a complete arcade loop.",
    instructions:
      "Build a space shooter: the ship moves left/right and fires projectiles with space (projectile clones). Alien clones move down in waves.\n\nDestroying an alien scores points. If an alien reaches the bottom or hits the ship, you lose one of 3 lives. Clearing a wave spawns a faster next wave. Include a start screen, game-over screen, and score display.",
    deliverable: "A shared Scratch project link with two clone types (projectiles + aliens), waves, lives, and full game states.",
    rubric: [
      "Two independent clone systems (shots and enemies)",
      "Waves escalate in speed or count",
      "3-life system with correct game over",
      "Start and game-over screens both exist",
    ],
    difficulty: "ADVANCED",
    points: 30,
    estimatedMinutes: 90,
    order: 14,
  },
  {
    slug: "platformer-proto",
    ageBand: "AGE_11_13",
    title: "Platformer Prototype",
    summary: "Real platforming: gravity, jumping between platforms, and a goal flag.",
    instructions:
      "Build a one-level platformer with at least 5 platforms at different heights. The character runs with arrow keys and jumps with space.\n\nImplement gravity with a y-velocity variable, and collision so the character lands on platforms (no sinking through). Reach the flag at the end to win; falling off the bottom returns you to the start.",
    deliverable: "A shared Scratch project link with smooth platform physics, 5+ platforms, win flag, and fall-reset.",
    rubric: [
      "Jump/gravity uses velocity, feels smooth",
      "Landing on platforms works (no falling through)",
      "At least 5 platforms requiring real jumps",
      "Win flag + fall reset both implemented",
    ],
    difficulty: "ADVANCED",
    points: 30,
    estimatedMinutes: 90,
    order: 15,
  },
  {
    slug: "escape-room",
    ageBand: "AGE_11_13",
    title: "Escape Room: Three Puzzles",
    summary: "Design a 3-room escape game with inventory, clickable hotspots, and a final code.",
    instructions:
      "Build an escape-room game across 3 backdrops (rooms). Each room has clickable hotspots (objects).\n\nRoom 1: find a hidden key to unlock the door. Room 2: solve a riddle using the ask/answer block. Room 3: enter a 3-digit code found by combining clues from the previous rooms. Track found items in a list called 'Inventory'. Finishing shows your escape time.",
    deliverable: "A shared Scratch project link with 3 rooms, an Inventory list, and a timed win screen.",
    rubric: [
      "3 distinct rooms with clickable hotspots",
      "Inventory list correctly tracks collected items",
      "Riddle and code-lock puzzles both validate input",
      "Escape timer displayed on the win screen",
    ],
    difficulty: "ADVANCED",
    points: 30,
    estimatedMinutes: 120,
    order: 16,
  },
];

// Small helper: themed SVG "screenshot" placeholders for seeded proof-of-work.
function proofSvg(title: string, hue: number): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='400' viewBox='0 0 640 400'>
  <rect width='640' height='400' fill='hsl(${hue} 45% 12%)'/>
  <rect x='24' y='24' width='592' height='352' rx='12' fill='hsl(${hue} 40% 18%)'/>
  <rect x='48' y='52' width='180' height='34' rx='8' fill='hsl(${hue} 70% 55%)'/>
  <rect x='48' y='100' width='150' height='34' rx='8' fill='hsl(${hue} 65% 62%)'/>
  <rect x='48' y='148' width='196' height='34' rx='8' fill='hsl(${(hue + 40) % 360} 65% 58%)'/>
  <rect x='48' y='196' width='120' height='34' rx='8' fill='hsl(${hue} 60% 50%)'/>
  <circle cx='480' cy='200' r='72' fill='hsl(${(hue + 80) % 360} 70% 60%)'/>
  <text x='320' y='356' font-family='sans-serif' font-size='20' text-anchor='middle' fill='hsl(${hue} 30% 85%)'>${title}</text>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function weekKeyOf(d: Date): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((+date - +yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

const daysAgo = (n: number, hour = 12) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 15, 0, 0);
  return d;
};

async function main() {
  console.log("Seeding task library…");
  for (const t of tasks) {
    await db.task.upsert({
      where: { slug: t.slug },
      update: { ...t, rubric: t.rubric },
      create: { ...t, rubric: t.rubric },
    });
  }
  console.log(`  ${tasks.length} missions ready.`);

  const password = await bcrypt.hash("demo1234", 10);

  const laila = await db.user.upsert({
    where: { email: "demo@giglet.app" },
    update: {},
    create: { email: "demo@giglet.app", name: "Laila Hassan", passwordHash: password, role: "PARENT" },
  });
  const rose = await db.user.upsert({
    where: { email: "grandma@giglet.app" },
    update: {},
    create: { email: "grandma@giglet.app", name: "Rose Mahmoud", passwordHash: password, role: "DONOR" },
  });
  const samy = await db.user.upsert({
    where: { email: "samy@giglet.app" },
    update: {},
    create: { email: "samy@giglet.app", name: "Samy Hassan", passwordHash: password, role: "DONOR" },
  });

  // Wipe and rebuild the demo children so the seed is idempotent-ish and clean.
  await db.child.deleteMany({ where: { parentId: laila.id } });

  const maya = await db.child.create({
    data: { parentId: laila.id, firstName: "Maya", ageBand: "AGE_8_10", avatarColor: "emerald", weeklyGoalCents: 2500 },
  });
  await db.child.create({
    data: { parentId: laila.id, firstName: "Adam", ageBand: "AGE_11_13", avatarColor: "sky", weeklyGoalCents: 3000 },
  });

  const task = (slug: string) => db.task.findUniqueOrThrow({ where: { slug } });

  // ── Maya's submissions ──────────────────────────────────────
  const s1 = await db.submission.create({
    data: {
      childId: maya.id,
      taskId: (await task("draw-with-code")).id,
      note: "I drew a purple dragon called Fawzy! When you click him he flaps his wings, roars, and says good morning in Arabic. It took me three tries to make the wings move right.",
      proofImage: proofSvg("Fawzy the Dragon — click me!", 280),
      status: "APPROVED",
      createdAt: daysAgo(12, 16),
      reviewedAt: daysAgo(12, 20),
    },
  });
  const s2 = await db.submission.create({
    data: {
      childId: maya.id,
      taskId: (await task("say-hello-robot")).id,
      note: "Two robots argue about who makes better breakfast. One only knows how to make toast. I used wait blocks so they don't talk over each other.",
      proofImage: proofSvg("Robot Breakfast Argument — green flag to play", 200),
      status: "APPROVED",
      createdAt: daysAgo(6, 15),
      reviewedAt: daysAgo(6, 21),
    },
  });
  await db.submission.create({
    data: {
      childId: maya.id,
      taskId: (await task("catch-the-stars")).id,
      note: "My stars fall from random spots and the basket is a magic carpet. I made a clone for the stars and you lose a life if one hits the ground. Grandma got 14 points!",
      proofImage: proofSvg("Catch the Falling Stars — score: 14", 45),
      status: "PENDING",
      createdAt: daysAgo(0, 18),
    },
  });
  await db.submission.create({
    data: {
      childId: maya.id,
      taskId: (await task("click-the-cat")).id,
      note: "The cat teleports every second and you click it for points. I added a timer but the game-over screen doesn't show the score yet.",
      proofImage: proofSvg("Click the Cat — work in progress", 330),
      status: "CHANGES_REQUESTED",
      feedback:
        "Great work on the random movement, Maya! Two things from the rubric before this goes on your wall: (1) make the 30-second timer actually end the game, and (2) show the final score on the game-over screen. You're very close!",
      createdAt: daysAgo(3, 17),
      reviewedAt: daysAgo(2, 19),
    },
  });

  // ── Maya's family circle ─────────────────────────────────────
  await db.circleMember.createMany({
    data: [
      { childId: maya.id, donorId: rose.id, relationLabel: "Grandma", createdAt: daysAgo(14) },
      { childId: maya.id, donorId: samy.id, relationLabel: "Uncle", createdAt: daysAgo(13) },
    ],
  });

  const invite = await db.invite.create({
    data: {
      code: "MAYA-FAM-26",
      childId: maya.id,
      createdById: laila.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  // ── Donations: old ones already paid out, recent ones pending ─
  const paidDonations: Prisma.DonationCreateInput[] = [
    { child: { connect: { id: maya.id } }, donor: { connect: { id: rose.id } }, submission: { connect: { id: s1.id } }, amountCents: 1000, message: "Bravo ya Maya! The dragon is wonderful.", weekKey: weekKeyOf(daysAgo(12)), createdAt: daysAgo(12, 21) },
    { child: { connect: { id: maya.id } }, donor: { connect: { id: samy.id } }, submission: { connect: { id: s1.id } }, amountCents: 1500, message: "Next I want a dragon that flies to school for you 😄", weekKey: weekKeyOf(daysAgo(11)), createdAt: daysAgo(11, 9) },
    { child: { connect: { id: maya.id } }, donor: { connect: { id: rose.id } }, submission: { connect: { id: s2.id } }, amountCents: 1100, message: "The toast robot made me laugh out loud.", weekKey: weekKeyOf(daysAgo(6)), createdAt: daysAgo(5, 10) },
  ];

  const payout = await db.payout.create({
    data: {
      childId: maya.id,
      amountCents: 3600,
      donationCount: paidDonations.length,
      weekKeys: [...new Set(paidDonations.map((d) => d.weekKey))].join(","),
      createdAt: daysAgo(4, 8),
    },
  });
  for (const d of paidDonations) {
    await db.donation.create({
      data: { ...d, status: "PAID_OUT", payout: { connect: { id: payout.id } } },
    });
  }

  const pendingDonations: Prisma.DonationCreateInput[] = [
    { child: { connect: { id: maya.id } }, donor: { connect: { id: samy.id } }, submission: { connect: { id: s2.id } }, amountCents: 2000, message: "Keep building, engineer! 🤖", weekKey: weekKeyOf(daysAgo(1)), createdAt: daysAgo(1, 14) },
    { child: { connect: { id: maya.id } }, donor: { connect: { id: rose.id } }, amountCents: 500, message: "For my favorite coder, just because.", weekKey: weekKeyOf(daysAgo(0)), createdAt: daysAgo(0, 11) },
  ];
  for (const d of pendingDonations) {
    await db.donation.create({ data: d });
  }

  console.log("Demo family ready.");
  console.log(`  Parent: demo@giglet.app / demo1234`);
  console.log(`  Donors: grandma@giglet.app, samy@giglet.app / demo1234`);
  console.log(`  Invite code for Maya's circle: ${invite.code}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
