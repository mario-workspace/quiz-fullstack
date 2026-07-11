import { Pool } from 'pg';
import { config } from '../config';
import { hashPassword } from '../services/auth.service';

const statements = [
  `CREATE EXTENSION IF NOT EXISTS "pgcrypto"`,
  `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
    suspended BOOLEAN NOT NULL DEFAULT FALSE,
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS teacher_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS teacher_group_members (
    teacher_group_id UUID NOT NULL REFERENCES teacher_groups(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (teacher_group_id, teacher_id)
  )`,
  `CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS class_enrollments (
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (class_id, student_id)
  )`,
  `CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (assignment_id, student_id)
  )`,
  `CREATE TABLE IF NOT EXISTS grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID UNIQUE NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    feedback TEXT,
    graded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
];

export async function migrate(): Promise<void> {
  const pool = new Pool({ connectionString: config.DATABASE_URL });

  for (const statement of statements) {
    await pool.query(statement);
  }

  const admin = await pool.query(`SELECT id FROM users WHERE email = $1`, ['admin@school.edu']);
  if (admin.rows.length === 0) {
    await pool.query(
      `INSERT INTO users (email, name, password_hash, role, suspended) VALUES ($1, $2, $3, $4, $5)`,
      ['admin@school.edu', 'System Admin', hashPassword('admin123'), 'admin', false],
    );
    console.log('Seeded admin user: admin@school.edu / admin123');
  }

  await pool.end();
  console.log('Migration complete');
}

if (require.main === module) {
  migrate().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
