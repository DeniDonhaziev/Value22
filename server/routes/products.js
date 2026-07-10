const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { auth } = require('../middleware/auth');

// Получить список товаров
router.get('/', async (req, res) => {
  try {
    const { search, category, sort, shop_id } = req.query;
    
    let query = `
      SELECT p.*, s.id as shop_id, s.user_id as shop_user_id, s.name as shop_name, s.is_verified, s.is_premium 
      FROM products p 
      JOIN shops s ON p.shop_id = s.id 
      WHERE p.is_active = 1
    `;
    const params = [];
    
    // Фильтрация по магазину
    if (shop_id) {
      query += ' AND p.shop_id = ?';
      params.push(shop_id);
    }
    
    // Фильтрация по категории
    if (category && category !== 'Все категории') {
      query += ' AND p.category = ?';
      params.push(category);
    }
    
    // Поиск
    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    // Сортировка
    if (sort) {
      switch (sort) {
        case 'price_low':
          query += ' ORDER BY p.price ASC';
          break;
        case 'price_high':
          query += ' ORDER BY p.price DESC';
          break;
        case 'newest':
        default:
          query += ' ORDER BY p.created_at DESC';
          break;
      }
    } else {
      query += ' ORDER BY p.created_at DESC';
    }
    
    const products = await db.all(query, params);
    
    // Преобразуем данные в нужный формат
    const formattedProducts = products.map(product => ({
      ...product,
      shop: {
        id: product.shop_id,
        user_id: product.shop_user_id,
        name: product.shop_name,
        is_verified: product.is_verified,
        is_premium: product.is_premium
      }
    }));
    
    res.json({ products: formattedProducts });
  } catch (error) {
    console.error('Ошибка получения товаров:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить товар по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT p.*, s.id as shop_id, s.user_id as shop_user_id, s.name as shop_name, s.is_verified, s.is_premium, s.address, s.phone, s.email
      FROM products p 
      JOIN shops s ON p.shop_id = s.id 
      WHERE p.id = ?
    `;
    
    const product = await db.get(query, [id]);
    
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    // Преобразуем данные в нужный формат
    const formattedProduct = {
      ...product,
      shop: {
        id: product.shop_id,
        user_id: product.shop_user_id,
        name: product.shop_name,
        is_verified: product.is_verified,
        is_premium: product.is_premium,
        address: product.address,
        phone: product.phone,
        email: product.email
      }
    };
    
    res.json({ product: formattedProduct });
  } catch (error) {
    console.error('Ошибка получения товара:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});



// Обновить товар (только для владельца)
router.patch('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;
    
    // Проверяем права доступа
    const product = await db.get(`
      SELECT p.* FROM products p 
      JOIN shops s ON p.shop_id = s.id 
      WHERE p.id = ? AND s.user_id = ?
    `, [id, userId]);
    
    if (!product) {
      return res.status(403).json({ error: 'У вас нет прав для редактирования этого товара' });
    }
    
    // Обновляем товар
    const updateFields = [];
    const updateValues = [];
    
    Object.keys(updates).forEach(key => {
      if (['name', 'description', 'price', 'category', 'stock_quantity', 'image_url', 'is_active'].includes(key)) {
        updateFields.push(`${key} = ?`);
        updateValues.push(updates[key]);
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Нет полей для обновления' });
    }
    
    updateValues.push(id);
    
    await db.run(`UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);
    
    // Получаем обновленный товар
    const updatedProduct = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    
    res.json({ 
      message: 'Товар успешно обновлен',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Ошибка обновления товара:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});



module.exports = router;
