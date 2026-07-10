const bcrypt = require('bcrypt');
const { db } = require('./database');

const createAdmin = async () => {
  try {
    // Проверяем, существует ли уже администратор
    const existingAdmin = await db.get("SELECT * FROM users WHERE role = 'admin'");
    
    if (existingAdmin) {
      console.log('❌ Администратор уже существует');
      return;
    }

    // Создаем хеш пароля
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Добавляем администратора
    await db.run(`
      INSERT INTO users (email, password, name, phone, role) 
      VALUES (?, ?, ?, ?, ?)
    `, ['admin@value.com', hashedPassword, 'Администратор', '+7(999) 123-45-67', 'admin']);

    console.log('✅ Администратор успешно создан!');
    console.log('📧 Email: admin@value.com');
    console.log('🔑 Пароль: admin123');
    console.log('👤 Роль: admin');
    
  } catch (error) {
    console.error('❌ Ошибка при создании администратора:', error);
  }
};

createAdmin();
