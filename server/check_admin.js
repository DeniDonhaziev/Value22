const { db } = require('./database');

const checkAdmin = async () => {
  try {
    const admin = await db.get("SELECT id, email, name, role FROM users WHERE role = 'admin'");
    
    if (admin) {
      console.log('✅ Администратор найден:');
      console.log('📧 Email:', admin.email);
      console.log('👤 Имя:', admin.name);
      console.log('🔑 Роль:', admin.role);
      console.log('🆔 ID:', admin.id);
    } else {
      console.log('❌ Администратор не найден');
    }
  } catch (error) {
    console.error('❌ Ошибка при проверке администратора:', error);
  }
};

checkAdmin();
