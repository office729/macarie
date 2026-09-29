const { Pool } = require('pg');

// Same convention as fundraising-academy's main app: a Supabase Postgres
// project, connected through the Supavisor pooler (DATABASE_URL). The
// Vercel-Postgres var names are kept as a fallback in case this project
// ever moves to that instead.
const CONNECTION_STRING =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

let pool = null;
function getPool() {
  if (!CONNECTION_STRING) {
    throw new Error('NO_DATABASE_CONFIGURED');
  }
  if (!pool) {
    pool = new Pool({ connectionString: CONNECTION_STRING, ssl: { rejectUnauthorized: false } });
    pool.on('error', () => {});
  }
  return pool;
}

let migrated = false;
async function ensureCoreSchema() {
  if (migrated) return;
  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS f230_submissions (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      nume TEXT, prenume TEXT, initiala TEXT, cnp TEXT,
      email TEXT, telefon TEXT,
      strada TEXT, numar TEXT, judet TEXT, localitate TEXT,
      cod_postal TEXT, bloc TEXT, scara TEXT, apartament TEXT,
      distribuire_2ani BOOLEAN DEFAULT false,
      signature_png TEXT,
      status TEXT NOT NULL DEFAULT 'nou'
    );
    CREATE TABLE IF NOT EXISTS agenda_bookings (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      booking_date TEXT, booking_time TEXT,
      name TEXT, phone TEXT, details TEXT,
      calendar_event_id TEXT,
      status TEXT NOT NULL DEFAULT 'nou'
    );
    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      prenume TEXT, nume TEXT, email TEXT, telefon TEXT,
      subiect TEXT, mesaj TEXT,
      status TEXT NOT NULL DEFAULT 'nou'
    );
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL, description TEXT, price TEXT,
      tag TEXT, category TEXT, perioada TEXT,
      img_url TEXT, is_new BOOLEAN DEFAULT false,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS agenda_events (
      id SERIAL PRIMARY KEY,
      event_date TEXT NOT NULL, title TEXT NOT NULL, location TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS contract20_submissions (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      denumire TEXT, cui TEXT, reg_com TEXT,
      adresa TEXT, cod_postal TEXT, judet TEXT, localitate TEXT,
      iban TEXT, banca TEXT, suma TEXT,
      admin_prenume TEXT, admin_nume TEXT, admin_email TEXT, admin_telefon TEXT,
      cnp TEXT, ci_numar TEXT, ci_serie TEXT, ci_eliberata_de TEXT, ci_data TEXT,
      signature_png TEXT,
      status TEXT NOT NULL DEFAULT 'nou'
    );
    CREATE TABLE IF NOT EXISTS donations (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      name TEXT, email TEXT, phone TEXT,
      amount_ron NUMERIC, anonymous BOOLEAN DEFAULT false,
      status TEXT NOT NULL DEFAULT 'nou'
    );
    CREATE TABLE IF NOT EXISTS tiktok_videos (
      id SERIAL PRIMARY KEY,
      url TEXT NOT NULL, title TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS sinaxar_days (
      id SERIAL PRIMARY KEY,
      month INTEGER NOT NULL, day INTEGER NOT NULL,
      sfinti TEXT NOT NULL, tropar BOOLEAN DEFAULT false, condac BOOLEAN DEFAULT false,
      tropar_text TEXT, condac_text TEXT,
      tropar_audio_url TEXT, condac_audio_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(month, day)
    );
    ALTER TABLE sinaxar_days ADD COLUMN IF NOT EXISTS tropar_text TEXT;
    ALTER TABLE sinaxar_days ADD COLUMN IF NOT EXISTS condac_text TEXT;
    ALTER TABLE sinaxar_days ADD COLUMN IF NOT EXISTS tropar_audio_url TEXT;
    ALTER TABLE sinaxar_days ADD COLUMN IF NOT EXISTS condac_audio_url TEXT;
  `);
  migrated = true;
}

// Tables for the dashboard-managed "Ascultă" section (audio, glasuri, YouTube, links).
// Best effort: if this ever fails, the rest of the site keeps working and it is retried on the next request.
let extraMigrated = false;
async function ensureExtraSchema() {
  if (extraMigrated) return;
  try {
    await getPool().query(`
    CREATE TABLE IF NOT EXISTS audio_files (
      id SERIAL PRIMARY KEY,
      filename TEXT, mime TEXT NOT NULL DEFAULT 'audio/mpeg',
      size INTEGER NOT NULL, chunk_size INTEGER NOT NULL,
      complete BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS audio_chunks (
      file_id INTEGER NOT NULL REFERENCES audio_files(id) ON DELETE CASCADE,
      idx INTEGER NOT NULL, data BYTEA NOT NULL,
      PRIMARY KEY (file_id, idx)
    );
    CREATE TABLE IF NOT EXISTS glas_tracks (
      id SERIAL PRIMARY KEY,
      n TEXT NOT NULL, title TEXT NOT NULL, meta TEXT, audio_url TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS youtube_videos (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL, url TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY, value TEXT
    );
    -- The app connects as the postgres role (bypasses RLS); enabling RLS keeps
    -- the public Supabase API from exposing these tables.
    ALTER TABLE audio_files ENABLE ROW LEVEL SECURITY;
    ALTER TABLE audio_chunks ENABLE ROW LEVEL SECURITY;
    ALTER TABLE glas_tracks ENABLE ROW LEVEL SECURITY;
    ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;
    ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
  `);
    extraMigrated = true;
  } catch (err) {
    if (err.message !== 'NO_DATABASE_CONFIGURED') console.error('extra schema failed:', err.message);
  }
}

async function ensureSchema() {
  await ensureCoreSchema();
  await ensureExtraSchema();
}

const TRANSIENT = /terminated|ECONNRESET|ETIMEDOUT|ECONNREFUSED|EPIPE|timeout/i;

async function query(text, params) {
  await ensureSchema();
  try {
    return await getPool().query(text, params);
  } catch (err) {
    // A pooled connection can be closed while the function is idle; retry once on a fresh pool.
    if (err.message !== 'NO_DATABASE_CONFIGURED' && (TRANSIENT.test(err.message || '') || ['57P01', '08006', '08001', '08003'].includes(err.code))) {
      const old = pool;
      pool = null;
      if (old) old.end().catch(() => {});
      return getPool().query(text, params);
    }
    throw err;
  }
}

module.exports = { query, hasDatabase: () => !!CONNECTION_STRING };
