const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { auth } = require('../middleware/auth');

// Middleware для проверки роли администратора
const adminAuth = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
  }
  next();
};

// Получить статистику
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const [shopsCount, productsCount, usersCount, pendingVerifications] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM shops'),
      db.get('SELECT COUNT(*) as count FROM products'),
      db.get('SELECT COUNT(*) as count FROM users'),
      db.get('SELECT COUNT(*) as count FROM shops WHERE is_verified = 0')
    ]);

    res.json({
      total_shops: shopsCount.count,
      total_products: productsCount.count,
      total_users: usersCount.count,
      pending_verifications: pendingVerifications.count
    });
  } catch (error) {
    console.error('Ошибка при получении статистики:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить все магазины с информацией о владельцах
router.get('/shops', auth, adminAuth, async (req, res) => {
  try {
    const shops = await db.all(`
      SELECT 
        s.id,
        s.name,
        s.description,
        s.is_verified,
        s.is_premium,
        s.created_at,
        u.name as owner_name,
        COUNT(p.id) as products_count
      FROM shops s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN products p ON s.id = p.shop_id
      GROUP BY s.id, u.name
      ORDER BY s.created_at DESC
    `);

    res.json(shops);
  } catch (error) {
    console.error('Ошибка при получении магазинов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить магазин
router.delete('/shops/:id', auth, adminAuth, async (req, res) => {
  try {
    const shopId = req.params.id;

    // Проверяем существование магазина
    const shop = await db.get('SELECT * FROM shops WHERE id = ?', [shopId]);
    if (!shop) {
      return res.status(404).json({ error: 'Магазин не найден' });
    }

    // Удаляем все связанные данные
    await db.run('DELETE FROM messages_new WHERE chat_id IN (SELECT id FROM chats WHERE shop_id = ?)', [shopId]);
    await db.run('DELETE FROM chats WHERE shop_id = ?', [shopId]);
    await db.run('DELETE FROM products WHERE shop_id = ?', [shopId]);
    await db.run('DELETE FROM shops WHERE id = ?', [shopId]);

    res.json({ message: 'Магазин успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении магазина:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Изменить статус верификации магазина
router.patch('/shops/:id/verify', auth, adminAuth, async (req, res) => {
  try {
    const shopId = req.params.id;
    const { is_verified } = req.body;

    const result = await db.run(
      'UPDATE shops SET is_verified = ? WHERE id = ?',
      [is_verified ? 1 : 0, shopId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Магазин не найден' });
    }

    res.json({ message: 'Статус верификации обновлен' });
  } catch (error) {
    console.error('Ошибка при изменении статуса верификации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Изменить премиум статус магазина
router.patch('/shops/:id/premium', auth, adminAuth, async (req, res) => {
  try {
    const shopId = req.params.id;
    const { is_premium } = req.body;

    const result = await db.run(
      'UPDATE shops SET is_premium = ? WHERE id = ?',
      [is_premium ? 1 : 0, shopId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Магазин не найден' });
    }

    res.json({ message: 'Премиум статус обновлен' });
  } catch (error) {
    console.error('Ошибка при изменении премиум статуса:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить всех пользователей
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await db.all(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.role,
        u.created_at,
        COUNT(s.id) as shops_count
      FROM users u
      LEFT JOIN shops s ON u.id = s.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    res.json(users);
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить пользователя
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const userId = req.params.id;

    // Проверяем существование пользователя
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Нельзя удалить администратора
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Нельзя удалить администратора' });
    }

               // Удаляем все связанные данные
           const shops = await db.all('SELECT id FROM shops WHERE user_id = ?', [userId]);
           for (const shop of shops) {
             await db.run('DELETE FROM messages_new WHERE chat_id IN (SELECT id FROM chats WHERE shop_id = ?)', [shop.id]);
             await db.run('DELETE FROM chats WHERE shop_id = ?', [shop.id]);
             await db.run('DELETE FROM products WHERE shop_id = ?', [shop.id]);
           }
           
           await db.run('DELETE FROM shops WHERE user_id = ?', [userId]);
           await db.run('DELETE FROM messages_new WHERE sender_id = ?', [userId]);
           await db.run('DELETE FROM chats WHERE buyer_id = ? OR seller_id = ?', [userId, userId]);
           await db.run('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ message: 'Пользователь успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
