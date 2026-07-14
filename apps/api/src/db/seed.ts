import { Pool } from 'pg';
import { config } from '../config';
import { hashPassword } from '../services/auth.service';
import { migrate } from './migrate';

const STUDENT_COUNT = 100;
const TEACHER_COUNT = 30;
const STUDENT_PASSWORD = 'student123';
const TEACHER_PASSWORD = 'teacher123';

const FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Morgan', 'Jamie', 'Avery',
  'Quinn', 'Rowan', 'Sage', 'Emerson', 'Harper', 'Reese', 'Parker', 'Drew',
  'Skyler', 'Dakota', 'Cameron', 'Hayden', 'Kai', 'Micah', 'Noel', 'Blake',
  'Charlie', 'Finley', 'Marlowe', 'Nico', 'Remy', 'Salem',
];

const LAST_NAMES = [
  'Nguyen', 'Patel', 'Kim', 'Garcia', 'Chen', 'Silva', 'Khan', 'Rossi',
  'Muller', 'Johnson', 'Okafor', 'Haddad', 'Novak', 'Costa', 'Ivanov',
  'Suzuki', 'Andersen', 'Reyes', 'Cohen', 'Diallo', 'Tanaka', 'Fischer',
  'Moreau', 'Santos', 'Adebayo', 'Petrov', 'Lopez', 'Yamamoto', 'Dubois', 'Ali',
];

function buildName(index: number): string {
  const first = FIRST_NAMES[index % FIRST_NAMES.length];
  const last = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];
  return `${first} ${last}`;
}

export async function seed(): Promise<void> {
  // Ensure tables (and the base admin user) exist before seeding.
  await migrate();

  const pool = new Pool({ connectionString: config.DATABASE_URL });

  try {
    const teacherHash = hashPassword(TEACHER_PASSWORD);
    const studentHash = hashPassword(STUDENT_PASSWORD);

    let teachersCreated = 0;
    for (let i = 1; i <= TEACHER_COUNT; i += 1) {
      const result = await pool.query(
        `INSERT INTO users (email, name, password_hash, role, suspended)
         VALUES ($1, $2, $3, 'teacher', FALSE)
         ON CONFLICT (email) DO NOTHING`,
        [`teacher${i}@school.edu`, buildName(i), teacherHash],
      );
      teachersCreated += result.rowCount ?? 0;
    }

    let studentsCreated = 0;
    for (let i = 1; i <= STUDENT_COUNT; i += 1) {
      const result = await pool.query(
        `INSERT INTO users (email, name, password_hash, role, suspended)
         VALUES ($1, $2, $3, 'student', FALSE)
         ON CONFLICT (email) DO NOTHING`,
        [`student${i}@school.edu`, buildName(i + TEACHER_COUNT), studentHash],
      );
      studentsCreated += result.rowCount ?? 0;
    }

    console.log(
      `Seed complete: ${teachersCreated} teachers and ${studentsCreated} students inserted ` +
        `(${TEACHER_COUNT} teachers / ${STUDENT_COUNT} students total).`,
    );
    console.log(
      `Logins: teacher1@school.edu … teacher${TEACHER_COUNT}@school.edu / ${TEACHER_PASSWORD}, ` +
        `student1@school.edu … student${STUDENT_COUNT}@school.edu / ${STUDENT_PASSWORD}`,
    );
  } finally {
    await pool.end();
  }
}

const isDirectRun = typeof require !== 'undefined' && require.main === module;

if (isDirectRun) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
