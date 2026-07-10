const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Проверяем структуру базы данных...');

// Проверяем существующие таблицы
db.all('SELECT name FROM sqlite_master WHERE type="table"', (err, tables) => {
  if (err) {
    console.error('Ошибка при получении списка таблиц:', err);
    return;
  }
  
  console.log('Существующие таблицы:', tables.map(t => t.name));
  
  // Проверяем структуру таблицы chats
  if (tables.some(t => t.name === 'chats')) {
    db.all('PRAGMA table_info(chats)', (err, columns) => {
      if (err) {
        console.error('Ошибка при получении структуры таблицы chats:', err);
      } else {
        console.log('Структура таблицы chats:', columns);
      }
      
      // Проверяем структуру таблицы messages
      db.all('PRAGMA table_info(messages)', (err, columns) => {
        if (err) {
          console.error('Ошибка при получении структуры таблицы messages:', err);
        } else {
          console.log('Структура таблицы messages:', columns);
        }
        
        db.close();
      });
    });
  } else {
    console.log('Таблица chats не существует!');
    db.close();
  }
});
