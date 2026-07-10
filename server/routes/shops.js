const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { auth } = require('../middleware/auth');

// Получить список магазинов
router.get('/', async (req, res) => {
  try {
    const { category, user_id } = req.query;
    
    let query = `
      SELECT s.*, 
             u.name as owner_name,
             COUNT(p.id) as products_count,
             AVG(p.price) as avg_price
      FROM shops s 
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN products p ON s.id = p.shop_id AND p.is_active = 1
    `;
    const params = [];
    
    // Фильтрация по пользователю (для "Мои магазины")
    if (user_id) {
      query += ' WHERE s.user_id = ?';
      params.push(user_id);
    }
    
    query += ' GROUP BY s.id, u.name ORDER BY s.created_at DESC';
    
    // Фильтрация по категории
    if (category && !user_id) {
      query = query.replace('GROUP BY s.id', 'WHERE s.category = ? GROUP BY s.id');
      params.unshift(category);
    } else if (category && user_id) {
      query = query.replace('WHERE s.user_id = ?', 'WHERE s.user_id = ? AND s.category = ?');
      params.push(category);
    }
    
    const shops = await db.all(query, params);
    
    res.json({ shops });
  } catch (error) {
    console.error('Ошибка получения магазинов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить магазин по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Запрос магазина ID:', id);
    
    const query = `
      SELECT s.*, 
             u.name as owner_name,
             COUNT(p.id) as products_count,
             AVG(p.price) as avg_price
      FROM shops s 
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN products p ON s.id = p.shop_id AND p.is_active = 1
      WHERE s.id = ?
      GROUP BY s.id, u.name
    `;
    
    const shop = await db.get(query, [id]);
    
    console.log('Найден магазин:', shop);
    
    if (!shop) {
      return res.status(404).json({ error: 'Магазин не найден' });
    }
    
    res.json({ shop });
  } catch (error) {
    console.error('Ошибка получения магазина:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить товары магазина
router.get('/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Запрос товаров для магазина ID:', id);
    
    const query = `
      SELECT p.*, s.id as shop_id, s.user_id as shop_user_id, s.name as shop_name, s.is_verified, s.is_premium
      FROM products p 
      JOIN shops s ON p.shop_id = s.id 
      WHERE p.shop_id = ?
      ORDER BY p.created_at DESC
    `;
    
    const products = await db.all(query, [id]);
    
    console.log('Найдено товаров:', products.length);
    console.log('Товары:', products);
    
    res.json({ products });
  } catch (error) {
    console.error('Ошибка получения товаров магазина:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавить товар в магазин (с проверкой токена)
router.post('/:id/products', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock_quantity, image_url, contact_phone } = req.body;
    const userId = req.user.id; // Получаем ID пользователя из токена
    
    // Валидация данных
    if (!name || !description || !price || !category || !stock_quantity) {
      return res.status(400).json({ error: 'Не все обязательные поля заполнены' });
    }
    
    if (price <= 0 || stock_quantity < 0) {
      return res.status(400).json({ error: 'Цена должна быть больше 0, количество не может быть отрицательным' });
    }
    
    // Проверяем, что пользователь является владельцем магазина
    const shop = await db.get('SELECT * FROM shops WHERE id = ? AND user_id = ?', [id, userId]);
    
    if (!shop) {
      return res.status(403).json({ error: 'У вас нет прав для добавления товаров в этот магазин' });
    }
    
    // Добавляем товар
    const result = await db.run(`
      INSERT INTO products (shop_id, name, description, price, category, stock_quantity, image_url, contact_phone, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))
    `, [id, name, description, price, category, stock_quantity, image_url || null, contact_phone || null]);
    
    // Получаем добавленный товар
    const product = await db.get('SELECT * FROM products WHERE id = ?', [result.lastID]);
    
    res.status(201).json({ 
      message: 'Товар успешно добавлен',
      product: {
        ...product,
        shop_name: shop.name,
        is_verified: shop.is_verified,
        is_premium: shop.is_premium
      }
    });
  } catch (error) {
    console.error('Ошибка добавления товара:', error);
    if (error.code === 'SQLITE_CONSTRAINT') {
      res.status(400).json({ error: 'Ошибка валидации данных' });
    } else {
      res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
  }
});

// Удалить товар из магазина (с проверкой токена)
router.delete('/:shopId/products/:productId', auth, async (req, res) => {
  try {
    const { shopId, productId } = req.params;
    const userId = req.user.id; // Получаем ID пользователя из токена
    
    // Проверяем, что пользователь является владельцем магазина
    const shop = await db.get('SELECT * FROM shops WHERE id = ? AND user_id = ?', [shopId, userId]);
    
    if (!shop) {
      return res.status(403).json({ error: 'У вас нет прав для удаления товаров из этого магазина' });
    }
    
    // Проверяем, что товар принадлежит этому магазину
    const product = await db.get('SELECT * FROM products WHERE id = ? AND shop_id = ?', [productId, shopId]);
    
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    // Удаляем товар
    await db.run('DELETE FROM products WHERE id = ?', [productId]);
    
    res.json({ message: 'Товар успешно удален' });
  } catch (error) {
    console.error('Ошибка удаления товара:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать магазин (с проверкой токена)
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, category, address, phone, email, logo_url } = req.body;
    const userId = req.user.id; // Получаем ID пользователя из токена
    console.log('Создание магазина для пользователя ID:', userId, 'Имя:', req.user.name);
    
    // Валидация
    if (!name || !description || !category || !address || !phone) {
      return res.status(400).json({ error: 'Не все обязательные поля заполнены' });
    }
    
    // Убираем ограничение на количество магазинов - пользователь может создать несколько магазинов
    
    // Создаем магазин
    const result = await db.run(`
      INSERT INTO shops (user_id, name, description, category, address, phone, email, logo_url, is_verified, is_premium, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, datetime('now'))
    `, [userId, name, description, category, address, phone, email || null, logo_url || null]);
    
    // Получаем созданный магазин
    const shop = await db.get('SELECT * FROM shops WHERE id = ?', [result.lastID]);
    console.log('Магазин создан успешно:', shop);
    
    res.status(201).json({
      message: 'Магазин успешно создан',
      shop: {
        ...shop,
        owner_name: req.user.name, // Используем реальное имя пользователя
        products_count: 0,
        avg_price: 0
      },
      shopId: shop.id // Добавляем shopId для совместимости с клиентом
    });
  } catch (error) {
    console.error('Ошибка создания магазина:', error);
    if (error.code === 'SQLITE_CONSTRAINT') {
      res.status(400).json({ error: 'Ошибка валидации данных' });
    } else {
      res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
  }
});

// Обновить магазин (только для владельца)
router.patch('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;
    
    // Проверяем права доступа
    const shop = await db.get('SELECT * FROM shops WHERE id = ? AND user_id = ?', [id, userId]);
    
    if (!shop) {
      return res.status(403).json({ error: 'У вас нет прав для редактирования этого магазина' });
    }
    
    // Обновляем магазин
    const updateFields = [];
    const updateValues = [];
    
    Object.keys(updates).forEach(key => {
      if (['name', 'description', 'category', 'address', 'phone', 'email', 'logo_url'].includes(key)) {
        updateFields.push(`${key} = ?`);
        updateValues.push(updates[key]);
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Нет полей для обновления' });
    }
    
    updateValues.push(id);
    
    await db.run(`UPDATE shops SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);
    
    // Получаем обновленный магазин
    const updatedShop = await db.get('SELECT * FROM shops WHERE id = ?', [id]);
    
    res.json({ 
      message: 'Магазин успешно обновлен',
      shop: updatedShop
    });
  } catch (error) {
    console.error('Ошибка обновления магазина:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить магазин (только для владельца)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Проверяем права доступа
    const shop = await db.get('SELECT * FROM shops WHERE id = ? AND user_id = ?', [id, userId]);
    
    if (!shop) {
      return res.status(403).json({ error: 'У вас нет прав для удаления этого магазина' });
    }
    
    // Удаляем все товары магазина
    await db.run('DELETE FROM products WHERE shop_id = ?', [id]);
    
    // Удаляем магазин
    await db.run('DELETE FROM shops WHERE id = ?', [id]);
    
    res.json({ message: 'Магазин успешно удален' });
  } catch (error) {
    console.error('Ошибка удаления магазина:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить все магазины текущего пользователя
router.get('/my-shops', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Получение магазинов для пользователя ID:', userId);
    
    const query = `
      SELECT s.*, 
             u.name as owner_name,
             COUNT(p.id) as products_count,
             AVG(p.price) as avg_price
      FROM shops s 
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN products p ON s.id = p.shop_id AND p.is_active = 1
      WHERE s.user_id = ?
      GROUP BY s.id, u.name
      ORDER BY s.created_at DESC
    `;
    
    const shops = await db.all(query, [userId]);
    console.log('Найдено магазинов:', shops.length);
    
    res.json({ shops });
  } catch (error) {
    console.error('Ошибка получения магазинов пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить конкретный магазин пользователя по ID
router.get('/my-shops/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const shopId = req.params.id;
    
    const query = `
      SELECT s.*, 
             u.name as owner_name,
             COUNT(p.id) as products_count,
             AVG(p.price) as avg_price
      FROM shops s 
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN products p ON s.id = p.shop_id AND p.is_active = 1
      WHERE s.user_id = ? AND s.id = ?
      GROUP BY s.id, u.name
    `;
    
    const shop = await db.get(query, [userId, shopId]);
    
    if (!shop) {
      return res.status(404).json({ error: 'Магазин не найден или у вас нет прав доступа' });
    }
    
    res.json({ shop });
  } catch (error) {
    console.error('Ошибка получения магазина пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
