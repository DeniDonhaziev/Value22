const { db } = require('./database');

const checkDatabaseStructure = async () => {
  try {
    console.log('🔍 Проверка структуры базы данных...\n');
    
    // Проверяем существующие таблицы
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('📋 Существующие таблицы:');
    tables.forEach(table => console.log('  -', table.name));
    
    console.log('\n🔍 Проверка структуры таблиц:');
    
    // Проверяем структуру каждой таблицы
    for (const table of tables) {
      console.log(`\n📊 Таблица: ${table.name}`);
      const columns = await db.all(`PRAGMA table_info(${table.name})`);
      columns.forEach(col => {
        console.log(`  - ${col.name} (${col.type})`);
      });
    }
    
    // Проверяем данные в таблицах
    console.log('\n📈 Данные в таблицах:');
    
    const shopsCount = await db.get('SELECT COUNT(*) as count FROM shops');
    console.log(`  - Магазинов: ${shopsCount.count}`);
    
    const productsCount = await db.get('SELECT COUNT(*) as count FROM products');
    console.log(`  - Товаров: ${productsCount.count}`);
    
    const usersCount = await db.get('SELECT COUNT(*) as count FROM users');
    console.log(`  - Пользователей: ${usersCount.count}`);
    
    // Проверяем таблицы сообщений
    try {
      const messagesCount = await db.get('SELECT COUNT(*) as count FROM messages');
      console.log(`  - Сообщений (messages): ${messagesCount.count}`);
    } catch (e) {
      console.log('  - Таблица messages не существует');
    }
    
    try {
      const messagesNewCount = await db.get('SELECT COUNT(*) as count FROM messages_new');
      console.log(`  - Сообщений (messages_new): ${messagesNewCount.count}`);
    } catch (e) {
      console.log('  - Таблица messages_new не существует');
    }
    
    try {
      const chatsCount = await db.get('SELECT COUNT(*) as count FROM chats');
      console.log(`  - Чатов: ${chatsCount.count}`);
    } catch (e) {
      console.log('  - Таблица chats не существует');
    }
    
  } catch (error) {
    console.error('❌ Ошибка при проверке структуры БД:', error);
  }
};

checkDatabaseStructure();
