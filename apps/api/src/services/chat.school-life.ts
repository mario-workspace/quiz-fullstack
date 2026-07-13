import type { UserRole } from '../types';
import { matchesExpression } from './chat.normalize';
import { pickRandom } from './chat.expressions';

export interface SchoolLifeDialogue {
  expressions: string[];
  replies: string[];
  roles?: UserRole[];
}

/** School-life topics — every reply ties back to this School Portal platform. */
export const SCHOOL_LIFE_DIALOGUES: SchoolLifeDialogue[] = [
  {
    expressions: [
      'about our school',
      'about the school',
      'tell me about school',
      'what is this school',
      'school introduction',
      'introduce the school',
      'school overview',
      'our school',
      'this school',
      'school info',
      'school information',
      'learn about school',
    ],
    replies: [
      'This School Portal connects everyone on campus — admins manage accounts, teachers run classes, and students submit work online. Ask me about your role or say "Give me my stats"!',
      'Our school runs digitally through this portal: classes, homework, and grades all live here. I can show you your classes or explain how your role works.',
      'Think of this platform as the online home for school life — schedules, assignments, and grading. What would you like to explore first?',
    ],
  },
  {
    expressions: [
      'school life',
      'life in school',
      'life at school',
      'daily school life',
      'school day',
      'typical school day',
      'what is school like',
      'what is school life like',
      'day at school',
      'campus life',
      'student life',
      'life as a student',
    ],
    replies: [
      'School life here means checking your dashboard, keeping up with classes, finishing assignments on time, and tracking grades — all inside this portal.',
      'A typical day: log in, check your overview, see what\'s due on Assignments, and submit work before deadlines. I can pull up your stats anytime!',
      'Campus life on this platform is about staying organized — classes, homework, and feedback in one place. Ask "How many assignments do I have?" to see where you stand.',
    ],
  },
  {
    expressions: [
      'first day',
      'first day of school',
      'new semester',
      'new term',
      'starting school',
      'beginning of school',
      'back to school',
      'first week',
      'just started school',
      'new school year',
    ],
    replies: [
      'Welcome! Start on your dashboard overview, then open Classes to see where you\'re enrolled. If you\'re new, ask me "How do I use this platform?"',
      'First day tip: log in, check the sidebar for your role\'s pages, and browse Assignments for anything due soon. I\'m your platform guide!',
      'New semester? Visit your dashboard, review your classes, and check due dates on Assignments. Say "List my classes" and I\'ll help you get oriented.',
    ],
  },
  {
    expressions: [
      'about teachers',
      'tell me about teachers',
      'who are teachers',
      'what do teachers do',
      'teacher role',
      'teachers on platform',
      'teacher life',
      'life as a teacher',
      'being a teacher',
      'teacher job',
      'teacher duties',
    ],
    replies: [
      'Teachers on this platform create classes, post assignments, enroll students, and grade submissions. Open Classes and Assignments from the teacher dashboard.',
      'Teachers manage the classroom digitally here — set homework, publish tasks, review student work, and give scores from 0–100 with feedback.',
      'A teacher\'s workflow: create a class → add students → create assignments → publish → grade submissions. Ask "How many classes do I teach?" for your snapshot.',
    ],
    roles: ['teacher', 'admin'],
  },
  {
    expressions: [
      'about students',
      'tell me about students',
      'who are students',
      'what do students do',
      'student role',
      'students on platform',
      'being a student',
      'student duties',
      'student responsibilities',
      'what should students do',
    ],
    replies: [
      'Students enroll in classes, view published assignments, submit work before due dates, and check grades on the Assignments page and dashboard.',
      'Student life on the portal: attend classes virtually here, complete homework, and track scores. Past-due assignments become view-only.',
      'As a student, check My Classes for your teachers, then Assignments for homework and grades. Try "How am I doing?" for a progress summary!',
    ],
    roles: ['student', 'admin', 'teacher'],
  },
  {
    expressions: [
      'about admins',
      'tell me about admins',
      'admin role',
      'what do admins do',
      'administrator',
      'school admin',
      'admin duties',
      'admin job',
      'who is admin',
    ],
    replies: [
      'Admins run the platform — manage users, assign roles, suspend accounts, and organize teacher groups on the Users and Groups pages.',
      'Administrators keep the school portal running: create accounts, handle suspensions, and organize teachers. Ask "How many teachers?" for live counts.',
      'Admin workflow: Users page for accounts, Groups page for teacher organization, plus school-wide stats. I can pull user counts whenever you need.',
    ],
    roles: ['admin'],
  },
  {
    expressions: [
      'classroom',
      'in the classroom',
      'class room',
      'my classroom',
      'online classroom',
      'virtual classroom',
      'class environment',
      'what is a class',
      'how classes work',
    ],
    replies: [
      'Each class on this platform has a name, description, enrolled students, and linked assignments. Teachers manage them from the Classes page.',
      'Classes are the heart of the portal — students join classes, teachers post work there, and grades stay tied to each assignment.',
      'Open My Classes to see yours. Teachers can drill into a class to enroll students and view class-specific assignments.',
    ],
  },
  {
    expressions: [
      'classmates',
      'my classmates',
      'other students',
      'fellow students',
      'peers',
      'students in my class',
      'who is in my class',
      'who else is in class',
    ],
    replies: [
      'Classmates are the students enrolled in your classes. Teachers see the full roster on each class detail page and can manage enrollments.',
      'Your classmates share the same class on this platform. Teachers enroll students from the class page — students see classmates through shared assignments.',
      'To see who\'s in your classes, check My Classes. Teachers can search and bulk-enroll students on the class detail page.',
    ],
  },
  {
    expressions: [
      'homework life',
      'homework routine',
      'doing homework',
      'study habits',
      'studying',
      'study tips',
      'how to study',
      'prepare for class',
      'keep up with school',
      'stay on top',
      'stay organized',
    ],
    replies: [
      'Stay on top of schoolwork here by checking Assignments daily, noting due dates, and submitting before deadlines. Ask "What\'s due?" to see your workload.',
      'Study tip for this platform: start at your dashboard overview, then filter Assignments by class. Submit early so you\'re never locked out after the due date.',
      'Organization on the portal = check due dates on Assignments, submit on time, and review grades for feedback. Say "Give me my stats" for a quick check-in.',
    ],
  },
  {
    expressions: [
      'report card',
      'report cards',
      'grades at school',
      'grading system',
      'how grading works',
      'score system',
      'percentage grade',
      'letter grade',
      'pass or fail',
      'grading policy',
    ],
    replies: [
      'Marks on this platform are numeric scores from 0–100 (shown as marks, not percentages). Teachers mark submissions with optional feedback; students see results on Assignments and the dashboard.',
      'Our portal uses marks out of 100, not letter grades or percent signs. School-wide averages are tracked too — ask "What is the average grade?" anytime.',
      'After teachers mark your work, marks appear on the Assignments page. Students can ask "What is my average grade?" for a summary.',
    ],
  },
  {
    expressions: [
      'school schedule',
      'my schedule',
      'class schedule',
      'timetable',
      'time table',
      'when is class',
      'school timetable',
      'daily schedule',
    ],
    replies: [
      'Your schedule on this portal is your enrolled classes — say "List my classes" to see them. Assignment due dates are on the Assignments page.',
      'Check My Classes for your course list and Assignments for deadlines. That\'s your digital schedule here!',
      'The portal tracks classes and due dates rather than period bells. Ask "List my classes" or "What\'s due?" to plan your week.',
    ],
  },
  {
    expressions: [
      'teacher student relationship',
      'talk to teacher',
      'contact teacher',
      'message teacher',
      'ask teacher',
      'feedback from teacher',
      'teacher feedback',
      'communication with teacher',
    ],
    replies: [
      'Teachers leave feedback when grading submissions — check your graded assignments for comments. Assignment details show your teacher\'s name on each class.',
      'On this platform, feedback comes through graded submissions. Open an assignment you\'ve submitted to see scores and teacher comments.',
      'See your teacher\'s name on My Classes. After grading, their feedback appears on your submission in the Assignments view.',
    ],
    roles: ['student'],
  },
  {
    expressions: [
      'school rules',
      'portal rules',
      'platform rules',
      'what are the rules',
      'policies',
      'due date policy',
      'late work policy',
      'submission policy',
    ],
    replies: [
      'Key platform rules: assignments must be submitted before the due date (then they become view-only), only published assignments are visible to students, and suspended users cannot access the portal.',
      'Important policies here: submit before deadlines, teachers must publish assignments for students to see them, and admins can suspend accounts when needed.',
      'Rule of thumb on this portal — don\'t miss due dates, check published assignments only, and keep your account in good standing. Ask me about submitting or grading!',
    ],
  },
  {
    expressions: [
      'school community',
      'school family',
      'school spirit',
      'school culture',
      'school environment',
      'friendly school',
      'welcome to school',
    ],
    replies: [
      'Our school community connects through this portal — teachers guide classes, students learn together, and admins keep everything running smoothly.',
      'School spirit here is about collaboration: shared classes, shared assignments, and transparent grading. Explore your dashboard to join in!',
      'This platform brings the school together online. Check your classes, support classmates by staying on track, and ask me anything about how it works.',
    ],
  },
  {
    expressions: [
      'extracurricular',
      'clubs',
      'sports',
      'activities',
      'after school',
      'school events',
    ],
    replies: [
      'This portal focuses on classes, assignments, and grades — extracurriculars aren\'t tracked here yet. For coursework, check Assignments!',
      'Clubs and events aren\'t part of the platform right now — I specialize in classes, homework, and grading. Ask about your assignments or classes!',
      'Sports and clubs live outside this app for now. I\'m your guide for the academic side — classes, submissions, and scores.',
    ],
  },
  {
    expressions: [
      'parents',
      'parent portal',
      'parent access',
      'my parents',
      'guardian',
      'family access',
    ],
    replies: [
      'This platform currently serves admins, teachers, and students. Parents don\'t have a separate portal role yet — students track their own grades here.',
      'There\'s no parent login on this platform yet. Students can view their grades on Assignments and share progress with family directly.',
      'Family access isn\'t built in yet — students see their own grades and assignments when logged in. Ask about your grades or classes!',
    ],
  },
];

/** Platform-specific assistant dialogues — who the bot is and what this app does. */
export const PLATFORM_ASSISTANT_DIALOGUES: SchoolLifeDialogue[] = [
  {
    expressions: [
      'what is school portal',
      'what is this platform',
      'about this platform',
      'about platform',
      'what does this platform do',
      'what is this website',
      'what is this app for',
      'purpose of portal',
      'platform purpose',
      'why this portal',
      'explain the platform',
      'platform overview',
      'platform introduction',
    ],
    replies: [
      'School Portal is this platform — a digital hub where admins manage users, teachers run classes and assignments, and students submit work and view grades.',
      'This platform connects the whole school online: user management, class enrollment, homework, grading, and stats — all in one place.',
      'I\'m the assistant for School Portal. It handles classes, assignments, submissions, and grades so school life runs smoothly online.',
    ],
  },
  {
    expressions: [
      'platform features',
      'platform tools',
      'what features',
      'main features',
      'key features',
      'platform functions',
      'what can the platform do',
      'portal features',
      'app features',
    ],
    replies: [
      'Platform features: user management (admin), class & assignment management (teacher), homework submission & grade viewing (student), plus school-wide stats.',
      'Key tools here — Admin: Users & Groups. Teacher: Classes, Assignments, grading. Student: My Classes, Assignments, grade tracking. I can explain any of these!',
      'This portal does accounts, classes, assignments, submissions, grading, and analytics. Ask me about your role to see what\'s available to you.',
    ],
  },
  {
    expressions: [
      'platform roles',
      'user roles',
      'three roles',
      'role types',
      'admin teacher student',
      'difference between roles',
      'roles explained',
      'what roles exist',
    ],
    replies: [
      'Three roles on this platform:\n• Admin — manage users, groups, suspensions\n• Teacher — classes, assignments, grading\n• Student — view classes, submit work, see grades',
      'Roles define what you can do here. Admins run the system, teachers manage classrooms, students complete and submit work. Ask "Who am I?" to see your role.',
      'Admin, teacher, or student — each role sees a different dashboard. Say "Who am I?" and I\'ll tell you which one you have.',
    ],
  },
  {
    expressions: [
      'platform assistant',
      'portal assistant',
      'school portal assistant',
      'what is your job',
      'what do you help with',
      'why are you here',
      'your purpose',
      'your role',
      'how can you assist',
      'assistant for what',
    ],
    replies: [
      'I\'m the School Portal assistant — I help you use this platform: find classes, check assignments, understand grades, and navigate features for your role.',
      'My job is to make this portal easy! I answer questions about school life here, look up your live stats, and guide you through submitting or grading work.',
      'I\'m built specifically for this platform — not general chat. Ask about classes, homework, grades, or say "help" to see everything I know.',
    ],
  },
  {
    expressions: [
      'how to use platform',
      'how to use portal',
      'use this platform',
      'navigate platform',
      'platform guide',
      'platform tutorial',
      'platform help',
      'learn the platform',
      'platform instructions',
      'how does platform work',
    ],
    replies: [
      'Platform guide: log in → dashboard overview → sidebar (Classes & Assignments) → use pages for your role. Chat with me anytime for step-by-step help!',
      'Start at /dashboard, use the sidebar on desktop (navbar on mobile), and explore pages for your role. Try "Show me around" or ask about a specific task.',
      'Quick start: dashboard first, then Classes and Assignments. Admins also have Users and Groups. I can walk you through any feature — just ask!',
    ],
  },
  {
    expressions: [
      'platform for teachers',
      'teacher platform',
      'teacher tools on platform',
      'teacher section',
      'teacher dashboard',
      'teacher portal',
    ],
    replies: [
      'The teacher section has Classes (create & enroll students) and Assignments (create, publish, grade). Your dashboard shows class and assignment counts.',
      'Teachers use this platform to run classes digitally — create assignments, publish them, review submissions, and enter scores with feedback.',
      'Teacher dashboard → Classes for rosters, Assignments for homework and grading. Ask "How do I grade submissions?" for a walkthrough.',
    ],
    roles: ['teacher'],
  },
  {
    expressions: [
      'platform for students',
      'student platform',
      'student tools on platform',
      'student section',
      'student dashboard',
      'student portal',
    ],
    replies: [
      'The student section has My Classes (with teacher names) and Assignments (submit work, view grades). Your dashboard shows a grade summary widget.',
      'Students use this platform to see enrolled classes, complete homework, submit before due dates, and track scores.',
      'Student dashboard → My Classes, then Assignments for homework and grades. Try "How do I submit homework?" if you\'re stuck!',
    ],
    roles: ['student'],
  },
  {
    expressions: [
      'platform for admin',
      'admin platform',
      'admin tools on platform',
      'admin section',
      'admin dashboard',
      'admin portal',
    ],
    replies: [
      'The admin section has Users (create, suspend, delete) and Groups (organize teachers). You can ask me for school-wide teacher and student counts.',
      'Admins manage the whole platform — user accounts, role assignment, suspensions, and teacher groups. Users and Groups pages are your main tools.',
      'Admin dashboard → Users for account management, Groups for teacher organization. Ask "How many students?" for live stats.',
    ],
    roles: ['admin'],
  },
  {
    expressions: [
      'is this platform safe',
      'platform security',
      'secure platform',
      'data safe',
      'privacy on platform',
      'who sees my grades',
      'grade privacy',
    ],
    replies: [
      'This platform uses secure login (GitHub OAuth or admin email/password). Students see their own grades; teachers see their class submissions; admins manage accounts.',
      'Grades are private to you and your teachers on this platform. Login is required for all pages — suspended accounts are blocked from access.',
      'Security here: authenticated access only, role-based permissions, and admin suspension controls. Your data stays within your role\'s view.',
    ],
  },
  {
    expressions: [
      'platform tech',
      'what tech',
      'built with',
      'technology stack',
      'how platform built',
      'backend frontend',
    ],
    replies: [
      'School Portal runs on Next.js + Fastify, PostgreSQL for data, and Redis for caching. You don\'t need to worry about the tech — just use the features!',
      'Built with modern web tech (Next.js frontend, Fastify API, PostgreSQL database). As a user, focus on Classes, Assignments, and Grades — I handle the rest!',
      'The platform uses Next.js, Node.js, PostgreSQL, and Redis under the hood. For daily use, stick to your dashboard and sidebar — ask me if you\'re lost!',
    ],
  },
];

export function matchSchoolLifeDialogue(text: string, role: UserRole): string | null {
  for (const dialogue of [...PLATFORM_ASSISTANT_DIALOGUES, ...SCHOOL_LIFE_DIALOGUES]) {
    if (dialogue.roles && !dialogue.roles.includes(role)) continue;
    if (matchesExpression(text, dialogue.expressions)) {
      return pickRandom(dialogue.replies);
    }
  }
  return null;
}
