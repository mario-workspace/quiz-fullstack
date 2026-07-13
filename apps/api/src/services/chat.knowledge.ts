import type { UserRole } from '../types';
import { matchesExpression, prepareChatText } from './chat.normalize';
import { pickRandom } from './chat.expressions';
import {
  ADMIN_USER_PHRASES,
  CAPABILITIES_PHRASES,
  ENROLLMENT_PHRASES,
  LOGIN_PHRASES,
  LOGOUT_PHRASES,
  PORTAL_INFO_PHRASES,
  STUDENT_VIEW_GRADES_PHRASES,
  TEACHER_ASSIGNMENT_SETUP_PHRASES,
  TEACHER_CLASS_SETUP_PHRASES,
  THEME_PHRASES,
} from './chat.phrases';

export interface StaticChatRule {
  phrases: string[];
  roles?: UserRole[];
  replies: string[];
}

export const STATIC_CHAT_RULES: StaticChatRule[] = [
  {
    phrases: PORTAL_INFO_PHRASES,
    replies: [
      'School Portal is where admins manage users, teachers run classes, and students submit work and check grades.',
      'Think of it as your school hub — classes, assignments, and grades all in one place.',
    ],
  },
  {
    phrases: LOGIN_PHRASES,
    replies: [
      'Head to the Login page and sign in with GitHub. Admins can also use email and password.',
      'Use the Login page — GitHub sign-in works for most users, and admins have email login too.',
    ],
  },
  {
    phrases: LOGOUT_PHRASES,
    replies: [
      'Click Logout in the top-right corner of the navbar.',
      'Hit the Logout button up top on the right — easy as that.',
    ],
  },
  {
    phrases: THEME_PHRASES,
    replies: [
      'Tap the sun/moon icon in the navbar — right next to the chat button.',
      'Use the theme toggle in the navbar to switch between light and dark mode.',
    ],
  },
  {
    phrases: TEACHER_CLASS_SETUP_PHRASES,
    roles: ['teacher'],
    replies: [
      'Go to Classes on your dashboard and fill in the form — name and description, then save.',
      'Open Classes from the teacher menu and create one with a name and optional description.',
    ],
  },
  {
    phrases: TEACHER_ASSIGNMENT_SETUP_PHRASES,
    roles: ['teacher'],
    replies: [
      'Open Assignments, pick a class, and add title + description + due date. Publish when students should see it.',
      'Head to Assignments, choose a class, create the task, then hit Publish when you\'re ready.',
    ],
  },
  {
    phrases: [
      'submit assignment',
      'submit work',
      'turn in homework',
      'hand in homework',
      'how do i submit',
      'how to submit',
      'upload homework',
    ],
    roles: ['student'],
    replies: [
      'Go to Assignments → View → write your answer → Submit before the due date.',
      'Open the assignment, type your work in the box, and click Submit — just watch the deadline!',
    ],
  },
  {
    phrases: STUDENT_VIEW_GRADES_PHRASES,
    roles: ['student'],
    replies: [
      'Check the grade column on Assignments, or your dashboard overview widget.',
      'Your scores show up on the Assignments page and on your dashboard overview.',
    ],
  },
  {
    phrases: ADMIN_USER_PHRASES,
    roles: ['admin'],
    replies: [
      'Admins handle users on the Users page — create, edit roles, suspend, or remove accounts.',
      'Open Users from the admin menu to manage people and their roles.',
    ],
  },
  {
    phrases: ENROLLMENT_PHRASES,
    roles: ['teacher'],
    replies: [
      'Open a class detail page, search students, and use the multi-select to enroll or remove them.',
      'Go to a class from your dashboard — enrollment is on the class detail page.',
    ],
  },
  {
    phrases: CAPABILITIES_PHRASES,
    replies: [
      'I can chat about classes, assignments, grades, and portal tips — plus look up live stats!\nTry: "How many classes do I have?" or "Give me my stats".',
      'Ask about your role, counts, grades, or how to do things here.\nExample: "What is my average grade?"',
    ],
  },
];

export function matchStaticRule(text: string, role: UserRole): string | null {
  for (const rule of STATIC_CHAT_RULES) {
    if (rule.roles && !rule.roles.includes(role)) continue;
    if (matchesExpression(text, rule.phrases)) {
      return pickRandom(rule.replies);
    }
  }
  return null;
}

export function fallbackReply(role: UserRole, userName?: string): string {
  const name = userName ? userName.split(' ')[0] : 'there';
  const suggestions: Record<UserRole, string[]> = {
    admin: [
      'How many teachers are in the school?',
      'How many students are enrolled?',
      'How do I suspend a user?',
      'List all classes',
    ],
    teacher: [
      'How many classes do I teach?',
      'How many assignments do I have?',
      'How do I grade submissions?',
      'How do I enroll students?',
    ],
    student: [
      'How many classes am I in?',
      'How many assignments do I have?',
      'What is my average grade?',
      'How do I submit homework?',
    ],
  };

  const openers = [
    `Hmm, I'm not quite sure about that one, ${name}. I'm the School Portal assistant — try:`,
    `I didn't catch that. As your platform guide, I can help with:`,
    `Not sure I follow — here are School Portal topics:`,
  ];

  const platformHints = [
    'What is School Portal?',
    'Tell me about school life',
    ...suggestions[role],
  ];

  return [
    pickRandom(openers),
    ...platformHints.map((q) => `• "${q}"`),
    'Or say "help" for the full platform guide.',
  ].join('\n');
}

export function matchesAny(text: string, phrases: string[]): boolean {
  return matchesExpression(text, phrases);
}

export function normalizeForMatch(message: string): string {
  return prepareChatText(message);
}

/** Skip small-talk matching when the user is clearly asking for portal data. */
export function isDataQuery(text: string): boolean {
  return /\b(how many|how much|list|show my|give me|stats|summary|average|grade|grades|score|class|classes|course|assignment|homework|submit|who am i|my role|teachers|students|users|enroll|due)\b/.test(
    text,
  );
}
