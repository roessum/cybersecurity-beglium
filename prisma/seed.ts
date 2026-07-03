import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

try {
  process.loadEnvFile?.();
} catch {
  // no local .env file (env vars injected by the platform) — fine
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type SeedQuestion = {
  text: string;
  timeLimitSec?: number;
  choices: { text: string; correct?: boolean }[];
};

type SeedQuiz = {
  department: string;
  icon: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  title: string;
  description: string;
  questions: SeedQuestion[];
};

const quizzes: SeedQuiz[] = [
  {
    department: "Cleaning & Facilities",
    icon: "🧹",
    difficulty: "Beginner",
    title: "Security on the Ground",
    description: "Physical security basics for the people who keep the building running.",
    questions: [
      {
        text: "Someone in a delivery uniform follows you through a badge-only door, hands full. What do you do?",
        choices: [
          { text: "Hold the door — they look busy" },
          { text: "Politely ask them to badge in themselves", correct: true },
          { text: "Ignore them, not your job" },
          { text: "Badge them in with your own card" },
        ],
      },
      {
        text: "You find a USB stick while cleaning a meeting room. Best action?",
        choices: [
          { text: "Plug it into a PC to find the owner" },
          { text: "Keep it for yourself" },
          { text: "Hand it to IT/security without plugging it in", correct: true },
          { text: "Throw it in the bin" },
        ],
      },
      {
        text: "You leave your workstation for a break. You should…",
        timeLimitSec: 15,
        choices: [
          { text: "Lock the screen (Win+L / Ctrl+Cmd+Q)", correct: true },
          { text: "Leave it — you'll be quick" },
          { text: "Turn the monitor off only" },
          { text: "Ask a colleague to watch it" },
        ],
      },
      {
        text: "A stranger asks for the door code 'because they forgot theirs'. You…",
        choices: [
          { text: "Give it — they seem friendly" },
          { text: "Never share door codes; direct them to reception", correct: true },
          { text: "Write it down for them" },
          { text: "Let them in this once" },
        ],
      },
      {
        text: "Printed documents left on a desk overnight are best…",
        choices: [
          { text: "Left where they are" },
          { text: "Locked away or shredded if sensitive", correct: true },
          { text: "Recycled with everything else" },
          { text: "Photographed for safekeeping" },
        ],
      },
      {
        text: "You notice someone photographing screens in an empty office. You should…",
        choices: [
          { text: "Assume it's fine" },
          { text: "Report it to security straight away", correct: true },
          { text: "Ask to see the photos" },
          { text: "Take a photo of them and leave" },
        ],
      },
    ],
  },
  {
    department: "Reception & Front Desk",
    icon: "🛎️",
    difficulty: "Beginner",
    title: "Front Line Defence",
    description: "Visitor handling, phone pretexting and delivery scams at the front desk.",
    questions: [
      {
        text: "A caller claims to be 'IT support' and asks you to read out a code sent to your phone. You…",
        choices: [
          { text: "Read it out to be helpful" },
          { text: "Refuse — never share verification codes", correct: true },
          { text: "Read only half of it" },
          { text: "Ask them to call back later" },
        ],
      },
      {
        text: "A visitor arrives for a meeting but isn't on the list. Best step?",
        choices: [
          { text: "Wave them through" },
          { text: "Call the host to confirm before granting access", correct: true },
          { text: "Give them a badge and hope for the best" },
          { text: "Ask them to sign in and wander freely" },
        ],
      },
      {
        text: "A 'courier' insists on delivering a package directly to the CEO's desk. You…",
        choices: [
          { text: "Escort them up personally" },
          { text: "Accept it at reception and follow normal delivery process", correct: true },
          { text: "Give them directions to the office" },
          { text: "Let them go alone" },
        ],
      },
      {
        text: "Someone on the phone pressures you with urgency and name-drops an executive. This is a classic sign of…",
        timeLimitSec: 15,
        choices: [
          { text: "A social engineering / pretexting attempt", correct: true },
          { text: "A normal busy day" },
          { text: "A wrong number" },
          { text: "A VIP you must obey" },
        ],
      },
      {
        text: "Visitor badges should be…",
        choices: [
          { text: "Kept by visitors as souvenirs" },
          { text: "Returned and logged when the visitor leaves", correct: true },
          { text: "Reused without tracking" },
          { text: "Optional for short visits" },
        ],
      },
      {
        text: "A caller asks 'who's in today and when does the manager leave?' You…",
        choices: [
          { text: "Answer — it's just scheduling" },
          { text: "Don't disclose staff movements to unknown callers", correct: true },
          { text: "Give approximate times only" },
          { text: "Transfer them to the manager's desk" },
        ],
      },
    ],
  },
  {
    department: "Finance & Accounting",
    icon: "💶",
    difficulty: "Intermediate",
    title: "Follow the Money",
    description: "Invoice fraud, business email compromise and payment verification.",
    questions: [
      {
        text: "A supplier emails that their bank details have changed — pay the new account. Best action?",
        choices: [
          { text: "Update and pay immediately" },
          { text: "Verify by calling a known number, not one in the email", correct: true },
          { text: "Reply to the email to confirm" },
          { text: "Pay a small test amount first, then the rest" },
        ],
      },
      {
        text: "The 'CEO' emails urgently requesting a confidential wire transfer, bypassing normal process. This is…",
        timeLimitSec: 15,
        choices: [
          { text: "Business Email Compromise (BEC)", correct: true },
          { text: "A normal executive request" },
          { text: "A system error" },
          { text: "A test you should pass by paying fast" },
        ],
      },
      {
        text: "An email from 'accounts@supp1ier.com' (note the digit) is a sign of…",
        choices: [
          { text: "A rebranding" },
          { text: "A look-alike / spoofed domain", correct: true },
          { text: "A typo you can ignore" },
          { text: "A new supplier contact" },
        ],
      },
      {
        text: "Strongest control against fraudulent payments is…",
        choices: [
          { text: "Trusting the requester's seniority" },
          { text: "Segregation of duties + out-of-band approval", correct: true },
          { text: "Paying faster to avoid penalties" },
          { text: "Keeping one person in charge of everything" },
        ],
      },
      {
        text: "A vendor requests payment in gift cards. You should…",
        choices: [
          { text: "Buy them quietly" },
          { text: "Treat it as a scam — legitimate vendors don't do this", correct: true },
          { text: "Ask which brand they prefer" },
          { text: "Split it across several cards" },
        ],
      },
      {
        text: "Before a large first-time payment to a new account, you should…",
        choices: [
          { text: "Rely on the invoice PDF" },
          { text: "Independently verify the beneficiary via a trusted channel", correct: true },
          { text: "Assume finance already checked" },
          { text: "Pay and reconcile later" },
        ],
      },
    ],
  },
  {
    department: "HR & People",
    icon: "🧑‍💼",
    difficulty: "Intermediate",
    title: "People & Data Care",
    description: "Malicious applications, data privacy and payroll diversion.",
    questions: [
      {
        text: "A job applicant's CV arrives as a macro-enabled document (.docm) asking to 'Enable Content'. You…",
        choices: [
          { text: "Enable content to read it" },
          { text: "Don't enable macros; open safely or request a PDF", correct: true },
          { text: "Forward it to the hiring manager to open" },
          { text: "Print it to be safe" },
        ],
      },
      {
        text: "An employee emails asking to change their salary bank account. Best practice?",
        choices: [
          { text: "Update it on the email alone" },
          { text: "Verify the request through a second, known channel", correct: true },
          { text: "Ask for the change in writing only" },
          { text: "Change it if the email looks right" },
        ],
      },
      {
        text: "Sharing a spreadsheet of all staff personal data with an external recruiter is…",
        timeLimitSec: 20,
        choices: [
          { text: "Fine if they asked nicely" },
          { text: "A data-protection risk needing a lawful basis and minimisation", correct: true },
          { text: "Required for recruitment" },
          { text: "Okay if you remove surnames only" },
        ],
      },
      {
        text: "Under GDPR-style rules, personal data should be…",
        choices: [
          { text: "Collected as much as possible, just in case" },
          { text: "Limited to what's necessary and kept only as long as needed", correct: true },
          { text: "Shared freely within the company" },
          { text: "Stored forever for reference" },
        ],
      },
      {
        text: "A 'candidate' calls asking detailed questions about your internal tools and team structure. This could be…",
        choices: [
          { text: "Genuine enthusiasm — tell them everything" },
          { text: "Reconnaissance for a later attack — stay guarded", correct: true },
          { text: "A journalist you should help" },
          { text: "Not worth thinking about" },
        ],
      },
      {
        text: "Where should you store a scanned copy of an employee's passport?",
        choices: [
          { text: "On your desktop for quick access" },
          { text: "In the approved, access-controlled HR system", correct: true },
          { text: "In a shared drive everyone can read" },
          { text: "Emailed to yourself as backup" },
        ],
      },
    ],
  },
  {
    department: "IT & Security (Red Team)",
    icon: "🖥️",
    difficulty: "Advanced",
    title: "Break It Before They Do",
    description: "Advanced threats for the technical crowd: auth, secrets and supply chain.",
    questions: [
      {
        text: "Which best resists modern MFA-phishing (adversary-in-the-middle) proxies?",
        timeLimitSec: 25,
        choices: [
          { text: "SMS one-time codes" },
          { text: "TOTP authenticator apps" },
          { text: "Phishing-resistant FIDO2 / WebAuthn passkeys", correct: true },
          { text: "Email magic links" },
        ],
      },
      {
        text: "You must store user passwords. The right approach is…",
        choices: [
          { text: "Encrypt them with AES so they're reversible" },
          { text: "Hash with a slow, salted algorithm (argon2/bcrypt/scrypt)", correct: true },
          { text: "SHA-256 once, unsalted" },
          { text: "Store plaintext behind a firewall" },
        ],
      },
      {
        text: "An API fetches a URL supplied by the user and returns the response. The key risk is…",
        choices: [
          { text: "Cross-site scripting (XSS)" },
          { text: "Server-Side Request Forgery (SSRF)", correct: true },
          { text: "Clickjacking" },
          { text: "Cookie theft" },
        ],
      },
      {
        text: "A secret was accidentally committed and pushed to a repo. First priority is…",
        timeLimitSec: 20,
        choices: [
          { text: "Delete the commit and move on" },
          { text: "Rotate/revoke the secret — assume it's compromised", correct: true },
          { text: "Make the repo private" },
          { text: "Add it to .gitignore" },
        ],
      },
      {
        text: "Best defence against a malicious dependency in your build pipeline?",
        choices: [
          { text: "Always use 'latest' tags" },
          { text: "Pin versions + lockfiles + verify integrity/provenance", correct: true },
          { text: "Trust popular packages implicitly" },
          { text: "Disable the lockfile for flexibility" },
        ],
      },
      {
        text: "A user reports a MFA push they didn't request, repeatedly. This is likely…",
        choices: [
          { text: "A glitch to ignore" },
          { text: "MFA-fatigue / push-bombing — investigate and lock down", correct: true },
          { text: "Normal background noise" },
          { text: "A reason to disable MFA" },
        ],
      },
    ],
  },
];

async function main() {
  // Idempotent + non-destructive: upsert each department by its unique name and
  // refresh only that quiz's questions. Live games/players are left untouched,
  // so this is safe to run repeatedly (including against production).
  // Sequential so createdAt reflects the intended display order on first seed.
  for (const q of quizzes) {
    const quiz = await prisma.quiz.upsert({
      where: { department: q.department },
      update: {
        title: q.title,
        description: q.description,
        icon: q.icon,
        difficulty: q.difficulty,
      },
      create: {
        title: q.title,
        description: q.description,
        department: q.department,
        icon: q.icon,
        difficulty: q.difficulty,
      },
    });

    await prisma.question.deleteMany({ where: { quizId: quiz.id } });
    await prisma.quiz.update({
      where: { id: quiz.id },
      data: {
        questions: {
          create: q.questions.map((question, qi) => ({
            order: qi,
            text: question.text,
            timeLimitSec: question.timeLimitSec ?? 20,
            choices: {
              create: question.choices.map((c, ci) => ({
                order: ci,
                text: c.text,
                isCorrect: c.correct ?? false,
              })),
            },
          })),
        },
      },
    });
  }

  console.log(`Seeded ${quizzes.length} department sessions:`);
  for (const q of quizzes) console.log(`  ${q.icon} ${q.department} — ${q.questions.length} questions (${q.difficulty})`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
