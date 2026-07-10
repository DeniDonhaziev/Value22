const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Добавляем недостающие таблицы...');

db.serialize(() => {
  // Добавляем поле contact_phone в таблицу products, если его нет
  db.run(`
    ALTER TABLE products ADD COLUMN contact_phone TEXT
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Ошибка при добавлении поля contact_phone:', err.message);
    } else {
      console.log('✅ Поле contact_phone добавлено в таблицу products');
    }
  });

  // Создаем таблицу чатов
  db.run(`
    CREATE TABLE IF NOT EXISTS chats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      buyer_id INTEGER NOT NULL,
      seller_id INTEGER NOT NULL,
      product_id INTEGER,
      shop_id INTEGER,
      last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (buyer_id) REFERENCES users (id),
      FOREIGN KEY (seller_id) REFERENCES users (id),
      FOREIGN KEY (product_id) REFERENCES products (id),
      FOREIGN KEY (shop_id) REFERENCES shops (id)
    )
  `, (err) => {
    if (err) {
      console.error('Ошибка при создании таблицы chats:', err.message);
    } else {
      console.log('✅ Таблица chats создана');
    }
  });

  // Обновляем таблицу сообщений
  db.run(`
    CREATE TABLE IF NOT EXISTS messages_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chat_id) REFERENCES chats (id),
      FOREIGN KEY (sender_id) REFERENCES users (id)
    )
  `, (err) => {
    if (err) {
      console.error('Ошибка при создании новой таблицы messages:', err.message);
    } else {
      console.log('✅ Новая таблица messages создана');
      
      // Проверяем, есть ли данные в старой таблице messages
      db.get('SELECT COUNT(*) as count FROM messages', (err, result) => {
        if (err) {
          console.log('Старая таблица messages пуста или не существует');
        } else if (result.count > 0) {
          console.log(`⚠️  В старой таблице messages есть ${result.count} записей. Рекомендуется сделать резервную копию.`);
        }
      });
    }
  });

  // Создаем индексы
  db.run('CREATE INDEX IF NOT EXISTS idx_chats_buyer_seller ON chats(buyer_id, seller_id)', (err) => {
    if (err) {
      console.error('Ошибка при создании индекса chats:', err.message);
    } else {
      console.log('✅ Индекс для таблицы chats создан');
    }
  });

  db.run('CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages_new(chat_id)', (err) => {
    if (err) {
      console.error('Ошибка при создании индекса messages:', err.message);
    } else {
      console.log('✅ Индекс для таблицы messages создан');
    }
  });

  db.run('CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages_new(sender_id)', (err) => {
    if (err) {
      console.error('Ошибка при создании индекса messages sender:', err.message);
    } else {
      console.log('✅ Индекс для отправителей сообщений создан');
    }
  });

  // Проверяем результат
  setTimeout(() => {
    db.all('SELECT name FROM sqlite_master WHERE type="table"', (err, tables) => {
      if (err) {
        console.error('Ошибка при проверке таблиц:', err);
      } else {
        console.log('\n📋 Итоговый список таблиц:', tables.map(t => t.name));
      }
      db.close();
      console.log('\n✅ База данных обновлена!');
    });
  }, 1000);
});
