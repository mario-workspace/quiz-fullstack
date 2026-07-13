import type { UserRole } from '../types';
import { matchesExpression } from './chat.normalize';
import {
  AFFIRMATIVE_PHRASES,
  BOT_IDENTITY_PHRASES,
  CONFUSION_PHRASES,
  GETTING_STARTED_PHRASES,
  GOODBYE_PHRASES,
  GREETING_PHRASES,
  HELP_NEEDED_PHRASES,
  HOW_ARE_YOU_PHRASES,
  HUMOR_PHRASES,
  MOTIVATION_PHRASES,
  NEGATIVE_PHRASES,
  PRAISE_PHRASES,
  SORRY_PHRASES,
  THANKS_PHRASES,
} from './chat.phrases';

export interface ConversationalIntent {
  expressions: string[];
  replies: string[];
  roles?: UserRole[];
}

export const CONVERSATIONAL_INTENTS: ConversationalIntent[] = [
  {
    expressions: GREETING_PHRASES,
    replies: [
      "Hey! I'm the School Portal assistant — ask about school life, classes, or your stats.",
      "Hi! I help with this platform — teachers, students, homework, and grades.",
      "Hello! Welcome to School Portal. Ask about school life or say \"help\" for topics.",
      "Hey! Nice to chat — I'm here to guide you through this platform.",
      "Hi! I'm your platform assistant for classes, assignments, and school life.",
    ],
  },
  {
    expressions: HOW_ARE_YOU_PHRASES,
    replies: [
      "I'm doing great, thanks for asking! How can I help you with the portal?",
      "All good on my end! Ready when you are — classes, assignments, or grades?",
      "I'm here and happy to help! What would you like to know?",
      "Doing well! Need a hand with homework, grades, or navigation?",
    ],
  },
  {
    expressions: THANKS_PHRASES,
    replies: [
      "You're very welcome! Happy to help anytime.",
      "No problem at all — glad I could help!",
      "Anytime! Just message me if something else comes up.",
      "My pleasure! Good luck with everything.",
      "You got it! I'm here whenever you need me.",
    ],
  },
  {
    expressions: GOODBYE_PHRASES,
    replies: [
      "Bye! Come back anytime you need a hand.",
      "See you later! Good luck with your work.",
      "Take care! I'll be here when you need me.",
      "Catch you later — you've got this!",
      "Goodbye! Don't hesitate to reach out again.",
    ],
  },
  {
    expressions: BOT_IDENTITY_PHRASES,
    replies: [
      "I'm the School Portal assistant — your guide to this platform's classes, assignments, and grades.",
      "I'm built for School Portal only. I help you navigate the platform and answer school-life questions here.",
      "Name's School Portal Assistant! I explain how this platform works and look up your stats.",
      "I'm your platform helper — ask about school life, your role, classes, or homework on this app.",
    ],
  },
  {
    expressions: AFFIRMATIVE_PHRASES,
    replies: [
      "Great! What would you like to know next?",
      "Awesome — ask me anything whenever you're ready.",
      "Cool! I'm here if you need more help.",
      "Sounds good! Feel free to keep the questions coming.",
    ],
  },
  {
    expressions: NEGATIVE_PHRASES,
    replies: [
      "No worries! I'm here if you change your mind.",
      "Alright! Just ping me anytime you need something.",
      "Got it — I'll be around if you need me later.",
      "Okay! Have a great day.",
    ],
  },
  {
    expressions: SORRY_PHRASES,
    replies: [
      "No need to apologize! Ask anything — that's what I'm here for.",
      "You're totally fine! What would you like to ask instead?",
      "Don't worry about it! How can I help?",
      "All good! Feel free to rephrase or ask something else.",
    ],
  },
  {
    expressions: CONFUSION_PHRASES,
    replies: [
      'Sorry about that! Try "How many classes do I have?" or type "help".',
      "Let me clarify — I help with classes, assignments, grades, and portal tips. What topic do you want?",
      'My bad! Could you rephrase? Or type "help" to see what I can do.',
      'Try something like "List my classes" or "Give me my stats".',
    ],
  },
  {
    expressions: HELP_NEEDED_PHRASES,
    replies: [
      "I hear you — tell me what you're trying to do (submit homework, check grades, enroll students, etc.).",
      "No stress! Describe what you're stuck on and I'll walk you through it.",
      "Happy to help! Are you looking for something, submitting work, or checking stats?",
      "Let's take it step by step — what's the task you're working on?",
    ],
  },
  {
    expressions: PRAISE_PHRASES,
    replies: [
      "Thanks! Glad I could help.",
      "That's kind of you! Anything else I can look up?",
      "Appreciate that! Let me know if you need more info.",
      "Happy to help! What else can I do for you?",
    ],
  },
  {
    expressions: HUMOR_PHRASES,
    replies: [
      "Glad I could lighten the mood! Need anything else?",
      "Haha — anyway, I'm here for portal questions!",
      "Happy to chat! What would you like to know about the portal?",
    ],
  },
  {
    expressions: GETTING_STARTED_PHRASES,
    replies: [
      "Welcome! Start at your dashboard, then use the sidebar — Classes and Assignments are the main spots.",
      "New here? Check the dashboard first, then explore from the menu.",
      "Easy start: open your dashboard, pick a section, and ask me if you get stuck!",
    ],
  },
  {
    expressions: MOTIVATION_PHRASES,
    replies: [
      "You've got this! Focus on one assignment at a time — ask me about due work or your grades anytime.",
      "School can be tough, but you're making progress. Want your stats or a list of what's due?",
      "Hang in there! Check your dashboard overview — and I'm here if you need directions.",
      "One step at a time. Ask me \"How am I doing?\" for a quick progress snapshot.",
    ],
  },
];

export function matchConversationalIntent(text: string, role: UserRole): string | null {
  for (const intent of CONVERSATIONAL_INTENTS) {
    if (intent.roles && !intent.roles.includes(role)) continue;
    if (matchesExpression(text, intent.expressions)) {
      return pickRandom(intent.replies);
    }
  }
  return null;
}

export function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

export function humanizeDataReply(intros: string[], content: string): string {
  return `${pickRandom(intros)} ${content}`;
}

export const DATA_REPLY_INTROS = {
  lookup: [
    'Let me check that for you —',
    'Sure thing!',
    'One moment —',
    'Got it —',
    'Here you go —',
    'Alright —',
    'Okay —',
  ],
  empty: [
    "Looks like there isn't anything there yet —",
    "Hmm, I couldn't find any —",
    'So far nothing on that —',
  ],
  stats: [
    "Here's your snapshot —",
    'Quick summary for you —',
    "Alright, here's what I found —",
    'Pulling it up —',
  ],
};
