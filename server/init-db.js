import pool from "./db.js";

const schema = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    display_name TEXT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    country TEXT,
    national_id TEXT,
    email_type TEXT,
    employment_doc TEXT,
    profile_photo TEXT,
    field TEXT,
    sub_field TEXT,
    degree TEXT,
    university TEXT,
    faculty TEXT,
    interests TEXT[] DEFAULT '{}',
    orcid TEXT,
    scholar TEXT,
    scopus TEXT,
    lang_pref TEXT DEFAULT 'ar',
    action_pref TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS verification_codes (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description TEXT DEFAULT '',
    description_en TEXT DEFAULT '',
    field TEXT DEFAULT '',
    field_en TEXT DEFAULT '',
    sub_field TEXT DEFAULT '',
    sub_field_en TEXT DEFAULT '',
    type TEXT DEFAULT 'empirical',
    research_lang TEXT DEFAULT 'arabic',
    join_questions TEXT[] DEFAULT '{}',
    start_date DATE,
    end_date DATE,
    max_members INTEGER DEFAULT 4,
    leader_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active',
    completion INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS project_members (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    member_order INTEGER DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS join_requests (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT DEFAULT '',
    answers TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    due_date DATE,
    status TEXT DEFAULT 'in-progress',
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS ad_requests (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT,
    subject TEXT,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS ip_complaints (
    id SERIAL PRIMARY KEY,
    reporter_email TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
`;

async function initDb() {
  try {
    await pool.query(schema);
    console.log("Database tables initialized successfully.");
  } catch (err) {
    console.error("Database init failed:", err.message);
    process.exit(1);
  }
}

initDb();
