const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Создать заказ
router.post('/', auth, [
  body('product_id').isInt({ min: 1 }),
  body('quantity').isInt({ min: 1 }),
  body('shop_id').isInt({ min: 1 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { product_id, quantity, shop_id } = req.body;

    // Проверка существования товара и его доступности
    db.get(`
      SELECT p.*, s.name as shop_name 
      FROM products p 
      LEFT JOIN shops s ON p.shop_id = s.id 
      WHERE p.id = ? AND p.shop_id = ? AND p.is_active = 1
    `, [product_id, shop_id], (err, product) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка базы данных' });
      }
      if (!product) {
        return res.status(404).json({ error: 'Товар не найден' });
      }
      if (product.stock_quantity < quantity) {
        return res.status(400).json({ error: 'Недостаточно товара на складе' });
      }

      const total_price = product.price * quantity;

      // Создание заказа
      db.run(`
        INSERT INTO orders (customer_id, shop_id, product_id, quantity, total_price)
        VALUES (?, ?, ?, ?, ?)
      `, [req.user.userId, shop_id, product_id, quantity, total_price], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Ошибка при создании заказа' });
        }

        // Обновление количества товара
        db.run(`
          UPDATE products 
          SET stock_quantity = stock_quantity - ? 
          WHERE id = ?
        `, [quantity, product_id], (err) => {
          if (err) {
            console.error('Ошибка при обновлении количества товара:', err);
          }
        });

        res.status(201).json({
          message: 'Заказ успешно создан',
          orderId: this.lastID,
          total_price
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получить заказы пользователя
router.get('/my', auth, (req, res) => {
  const { status, limit = 20, offset = 0 } = req.query;
  
  let query = `
    SELECT o.*, p.name as product_name, p.image_url as product_image, p.price as product_price,
           s.name as shop_name, s.logo_url as shop_logo, u.name as shop_owner
    FROM orders o
    LEFT JOIN products p ON o.product_id = p.id
    LEFT JOIN shops s ON o.shop_id = s.id
    LEFT JOIN users u ON s.user_id = u.id
    WHERE o.customer_id = ?
  `;
  
  const params = [req.user.userId];
  
  if (status) {
    query += ' AND o.status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  db.all(query, params, (err, orders) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    res.json({ orders });
  });
});

// Получить заказы магазина (для продавцов)
router.get('/shop', auth, requireRole(['seller', 'admin']), (req, res) => {
  const { status, limit = 20, offset = 0 } = req.query;
  
  let query = `
    SELECT o.*, p.name as product_name, p.image_url as product_image,
           u.name as customer_name, u.email as customer_email, u.phone as customer_phone
    FROM orders o
    LEFT JOIN products p ON o.product_id = p.id
    LEFT JOIN users u ON o.customer_id = u.id
    LEFT JOIN shops s ON o.shop_id = s.id
    WHERE s.user_id = ?
  `;
  
  const params = [req.user.userId];
  
  if (status) {
    query += ' AND o.status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  db.all(query, params, (err, orders) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    res.json({ orders });
  });
});

// Получить заказ по ID
router.get('/:id', auth, (req, res) => {
  const { id } = req.params;
  
  db.get(`
    SELECT o.*, p.name as product_name, p.image_url as product_image, p.price as product_price,
           s.name as shop_name, s.logo_url as shop_logo, s.address as shop_address,
           s.phone as shop_phone, s.email as shop_email,
           u1.name as customer_name, u1.email as customer_email, u1.phone as customer_phone,
           u2.name as shop_owner
    FROM orders o
    LEFT JOIN products p ON o.product_id = p.id
    LEFT JOIN shops s ON o.shop_id = s.id
    LEFT JOIN users u1 ON o.customer_id = u1.id
    LEFT JOIN users u2 ON s.user_id = u2.id
    WHERE o.id = ?
  `, [id], (err, order) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }
    
    // Проверка прав доступа
    if (order.customer_id !== req.user.userId && 
        order.shop_owner_id !== req.user.userId && 
        req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Недостаточно прав' });
    }
    
    res.json({ order });
  });
});

// Обновить статус заказа
router.patch('/:id/status', auth, [
  body('status').isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Проверка прав доступа (только владелец магазина или админ)
    db.get(`
      SELECT o.*, s.user_id as shop_owner_id
      FROM orders o
      LEFT JOIN shops s ON o.shop_id = s.id
      WHERE o.id = ?
    `, [id], (err, order) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка базы данных' });
      }
      if (!order) {
        return res.status(404).json({ error: 'Заказ не найден' });
      }
      if (order.shop_owner_id !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Недостаточно прав' });
      }

      db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Ошибка при обновлении статуса' });
        }
        
        res.json({ message: 'Статус заказа обновлен' });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Отменить заказ (только покупатель)
router.patch('/:id/cancel', auth, (req, res) => {
  const { id } = req.params;

  // Проверка прав доступа и статуса заказа
  db.get('SELECT * FROM orders WHERE id = ?', [id], (err, order) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }
    if (order.customer_id !== req.user.userId) {
      return res.status(403).json({ error: 'Недостаточно прав' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Заказ нельзя отменить в текущем статусе' });
    }

    db.run('UPDATE orders SET status = ? WHERE id = ?', ['cancelled', id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Ошибка при отмене заказа' });
      }

      // Возврат товара на склад
      db.run(`
        UPDATE products 
        SET stock_quantity = stock_quantity + ? 
        WHERE id = ?
      `, [order.quantity, order.product_id], (err) => {
        if (err) {
          console.error('Ошибка при возврате товара на склад:', err);
        }
      });
      
      res.json({ message: 'Заказ отменен' });
    });
  });
});

module.exports = router;
