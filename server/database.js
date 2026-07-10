const { Pool, types } = require('pg');
require('dotenv').config();

// NUMERIC / DECIMAL и BIGINT возвращаем числами (как это делал SQLite)
types.setTypeParser(1700, (v) => (v === null ? null : parseFloat(v))); // numeric
types.setTypeParser(20, (v) => (v === null ? null : parseInt(v, 10))); // bigint (count/avg)

// Убираем channel_binding — драйвер pg не поддерживает SCRAM channel binding,
// иначе подключение к Neon падает при старте.
const sanitizeUrl = (url) =>
  !url ? url : url.replace(/([?&])channel_binding=[^&]*&?/gi, '$1').replace(/[?&]$/, '');

const connectionString = sanitizeUrl(process.env.DATABASE_URL);
if (!connectionString) {
  console.warn('⚠️  DATABASE_URL не задан. Укажите строку подключения Neon Postgres в переменных окружения.');
}

// Neon и другие облачные Postgres требуют SSL
const useSsl = connectionString && !/localhost|127\.0\.0\.1/.test(connectionString);
const pool = new Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});

// Трансляция SQLite-синтаксиса в Postgres
const translate = (sql) => {
  let text = sql
    // datetime('now') / datetime("now") -> NOW()
    .replace(/datetime\((['"])now\1\)/gi, 'NOW()')
    // LIKE в SQLite регистронезависим -> ILIKE
    .replace(/\bLIKE\b/gi, 'ILIKE');
  // ?, ?, ? -> $1, $2, $3
  let i = 0;
  text = text.replace(/\?/g, () => `$${++i}`);
  return text;
};

// Совместимая обёртка с прежним API (db.get / db.all / db.run)
const dbAsync = {
  get: async (sql, params = []) => {
    const res = await pool.query(translate(sql), params);
    return res.rows[0];
  },

  all: async (sql, params = []) => {
    const res = await pool.query(translate(sql), params);
    return res.rows;
  },

  run: async (sql, params = []) => {
    let text = translate(sql);
    // Для INSERT дописываем RETURNING id, чтобы отдать lastID как в SQLite
    if (/^\s*INSERT/i.test(sql) && !/RETURNING/i.test(sql)) {
      text += ' RETURNING id';
    }
    const res = await pool.query(text, params);
    return {
      lastID: res.rows && res.rows[0] ? res.rows[0].id : undefined,
      changes: res.rowCount,
      rows: res.rows,
    };
  },

  query: (sql, params = []) => pool.query(translate(sql), params),
  pool,
};

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS shops (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    category TEXT,
    logo_url TEXT,
    is_verified INTEGER DEFAULT 0,
    is_premium INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    shop_id INTEGER NOT NULL REFERENCES shops(id),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    category TEXT,
    image_url TEXT,
    stock_quantity INTEGER DEFAULT 0,
    contact_phone TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES users(id),
    shop_id INTEGER NOT NULL REFERENCES shops(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS chats (
    id SERIAL PRIMARY KEY,
    buyer_id INTEGER NOT NULL REFERENCES users(id),
    seller_id INTEGER NOT NULL REFERENCES users(id),
    product_id INTEGER,
    shop_id INTEGER,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_shop_id ON orders(shop_id)`,
  `CREATE INDEX IF NOT EXISTS idx_chats_buyer_seller ON chats(buyer_id, seller_id)`,
  `CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id)`,
  `CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id)`,
];

const initDatabase = async () => {
  for (const stmt of SCHEMA) {
    await pool.query(stmt);
  }
  console.log('✅ База данных (Postgres) инициализирована');
};

module.exports = { db: dbAsync, initDatabase };
