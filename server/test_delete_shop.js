const { db } = require('./database');

const testDeleteShop = async () => {
  try {
    console.log('🧪 Тестирование удаления магазина...\n');
    
    // Получаем список магазинов
    const shops = await db.all('SELECT id, name FROM shops LIMIT 3');
    console.log('📋 Доступные магазины:');
    shops.forEach(shop => console.log(`  - ID: ${shop.id}, Название: ${shop.name}`));
    
    if (shops.length === 0) {
      console.log('❌ Нет магазинов для тестирования');
      return;
    }
    
    const testShopId = shops[0].id;
    console.log(`\n🔍 Тестируем удаление магазина ID: ${testShopId}`);
    
    // Проверяем связанные данные
    const products = await db.all('SELECT COUNT(*) as count FROM products WHERE shop_id = ?', [testShopId]);
    const chats = await db.all('SELECT COUNT(*) as count FROM chats WHERE shop_id = ?', [testShopId]);
    const messages = await db.all('SELECT COUNT(*) as count FROM messages_new WHERE chat_id IN (SELECT id FROM chats WHERE shop_id = ?)', [testShopId]);
    
    console.log(`📊 Связанные данные:`);
    console.log(`  - Товаров: ${products[0].count}`);
    console.log(`  - Чатов: ${chats[0].count}`);
    console.log(`  - Сообщений: ${messages[0].count}`);
    
    // Пробуем удалить
    console.log('\n🗑️ Начинаем удаление...');
    
    // Удаляем сообщения
    const deleteMessages = await db.run('DELETE FROM messages_new WHERE chat_id IN (SELECT id FROM chats WHERE shop_id = ?)', [testShopId]);
    console.log(`  ✅ Удалено сообщений: ${deleteMessages.changes}`);
    
    // Удаляем чаты
    const deleteChats = await db.run('DELETE FROM chats WHERE shop_id = ?', [testShopId]);
    console.log(`  ✅ Удалено чатов: ${deleteChats.changes}`);
    
    // Удаляем товары
    const deleteProducts = await db.run('DELETE FROM products WHERE shop_id = ?', [testShopId]);
    console.log(`  ✅ Удалено товаров: ${deleteProducts.changes}`);
    
    // Удаляем магазин
    const deleteShop = await db.run('DELETE FROM shops WHERE id = ?', [testShopId]);
    console.log(`  ✅ Удален магазин: ${deleteShop.changes > 0 ? 'ДА' : 'НЕТ'}`);
    
    if (deleteShop.changes > 0) {
      console.log('\n✅ Магазин успешно удален!');
    } else {
      console.log('\n❌ Ошибка при удалении магазина');
    }
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
  }
};

testDeleteShop();
