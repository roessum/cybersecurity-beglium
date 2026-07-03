import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

process.loadEnvFile?.();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type SeedQuestion = {
  text: string;
  timeLimitSec?: number;
  choices: { text: string; correct?: boolean }[];
};

const questions: SeedQuestion[] = [
  {
    text: "You get an email 'Your account is locked, click here to verify within 24h'. What is this most likely?",
    choices: [
      { text: "A phishing attempt", correct: true },
      { text: "A routine security update" },
      { text: "A message from your bank you must act on" },
      { text: "A harmless newsletter" },
    ],
  },
  {
    text: "Which of these is the strongest password?",
    choices: [
      { text: "Password123!" },
      { text: "correct-horse-battery-staple-42", correct: true },
      { text: "Summer2026" },
      { text: "qwerty" },
    ],
  },
  {
    text: "What does MFA (multi-factor authentication) add on top of your password?",
    timeLimitSec: 15,
    choices: [
      { text: "A second, independent proof of identity", correct: true },
      { text: "A longer password" },
      { text: "A faster login" },
      { text: "Automatic password changes" },
    ],
  },
  {
    text: "A caller says he's from IT and needs your password to 'fix your account'. You should:",
    choices: [
      { text: "Give it so they can fix it quickly" },
      { text: "Refuse — IT never needs your password", correct: true },
      { text: "Give a slightly wrong one" },
      { text: "Ask them to email it to you" },
    ],
  },
  {
    text: "The 's' in 'https://' tells you that...",
    timeLimitSec: 15,
    choices: [
      { text: "The site is government-approved" },
      { text: "The connection is encrypted", correct: true },
      { text: "The site can never be malicious" },
      { text: "The site is faster" },
    ],
  },
  {
    text: "You find a USB stick in the office parking lot. The safest action is to:",
    choices: [
      { text: "Plug it in to find the owner" },
      { text: "Hand it to IT/security without plugging it in", correct: true },
      { text: "Take it home to check it" },
      { text: "Plug it into a colleague's PC" },
    ],
  },
  {
    text: "What is 'ransomware'?",
    choices: [
      { text: "Malware that encrypts your files and demands payment", correct: true },
      { text: "Software that speeds up your PC" },
      { text: "A type of firewall" },
      { text: "A password manager" },
    ],
  },
  {
    text: "Best way to spot a fake login page?",
    timeLimitSec: 25,
    choices: [
      { text: "It always looks obviously broken" },
      { text: "Check the exact domain in the address bar", correct: true },
      { text: "It will have no logo" },
      { text: "Your browser will always block it" },
    ],
  },
];

async function main() {
  await prisma.playerAnswer.deleteMany();
  await prisma.player.deleteMany();
  await prisma.game.deleteMany();
  await prisma.choice.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();

  const quiz = await prisma.quiz.create({
    data: {
      title: "Cybersecurity Awareness",
      description: "Test your instincts on phishing, passwords, MFA and social engineering.",
      questions: {
        create: questions.map((q, qi) => ({
          order: qi,
          text: q.text,
          timeLimitSec: q.timeLimitSec ?? 20,
          choices: {
            create: q.choices.map((c, ci) => ({
              order: ci,
              text: c.text,
              isCorrect: c.correct ?? false,
            })),
          },
        })),
      },
    },
  });

  console.log(`Seeded quiz "${quiz.title}" (${quiz.id}) with ${questions.length} questions.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
