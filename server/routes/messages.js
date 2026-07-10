const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Отправить сообщение
router.post('/', auth, [
  body('receiver_id').isInt({ min: 1 }),
  body('message').notEmpty().trim().isLength({ min: 1, max: 1000 }),
  body('order_id').optional().isInt({ min: 1 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { receiver_id, message, order_id } = req.body;

    // Проверка существования получателя
    db.get('SELECT id FROM users WHERE id = ?', [receiver_id], (err, receiver) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка базы данных' });
      }
      if (!receiver) {
        return res.status(404).json({ error: 'Получатель не найден' });
      }

      // Проверка существования заказа (если указан)
      if (order_id) {
        db.get(`
          SELECT o.*, s.user_id as shop_owner_id 
          FROM orders o 
          LEFT JOIN shops s ON o.shop_id = s.id 
          WHERE o.id = ?
        `, [order_id], (err, order) => {
          if (err) {
            return res.status(500).json({ error: 'Ошибка базы данных' });
          }
          if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
          }
          
          // Проверка прав доступа к заказу
          if (order.customer_id !== req.user.userId && 
              order.shop_owner_id !== req.user.userId) {
            return res.status(403).json({ error: 'Нет доступа к этому заказу' });
          }

          createMessage();
        });
      } else {
        createMessage();
      }

      function createMessage() {
        db.run(`
          INSERT INTO messages (sender_id, receiver_id, order_id, message)
          VALUES (?, ?, ?, ?)
        `, [req.user.userId, receiver_id, order_id || null, message], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Ошибка при отправке сообщения' });
          }

          res.status(201).json({
            message: 'Сообщение отправлено',
            messageId: this.lastID
          });
        });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получить диалоги пользователя
router.get('/conversations', auth, (req, res) => {
  const { limit = 20, offset = 0 } = req.query;
  
  // Получаем последние сообщения для каждого диалога
  const query = `
    SELECT DISTINCT 
      CASE 
        WHEN m.sender_id = ? THEN m.receiver_id 
        ELSE m.sender_id 
      END as other_user_id,
      u.name as other_user_name,
      u.email as other_user_email,
      (SELECT message FROM messages 
       WHERE (sender_id = ? AND receiver_id = other_user_id) 
          OR (sender_id = other_user_id AND receiver_id = ?)
       ORDER BY created_at DESC LIMIT 1) as last_message,
      (SELECT created_at FROM messages 
       WHERE (sender_id = ? AND receiver_id = other_user_id) 
          OR (sender_id = other_user_id AND receiver_id = ?)
       ORDER BY created_at DESC LIMIT 1) as last_message_time,
      (SELECT COUNT(*) FROM messages 
       WHERE sender_id = other_user_id AND receiver_id = ? AND is_read = 0) as unread_count
    FROM messages m
    LEFT JOIN users u ON (
      CASE 
        WHEN m.sender_id = ? THEN m.receiver_id 
        ELSE m.sender_id 
      END = u.id
    )
    WHERE m.sender_id = ? OR m.receiver_id = ?
    ORDER BY last_message_time DESC
    LIMIT ? OFFSET ?
  `;
  
  const params = [
    req.user.userId, req.user.userId, req.user.userId, 
    req.user.userId, req.user.userId, req.user.userId,
    req.user.userId, req.user.userId, req.user.userId,
    parseInt(limit), parseInt(offset)
  ];
  
  db.all(query, params, (err, conversations) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    res.json({ conversations });
  });
});

// Получить сообщения с конкретным пользователем
router.get('/conversation/:userId', auth, (req, res) => {
  const { userId } = req.params;
  const { limit = 50, offset = 0 } = req.query;
  
  // Проверка существования пользователя
  db.get('SELECT id, name FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Получаем сообщения
    db.all(`
      SELECT m.*, 
             u1.name as sender_name,
             u2.name as receiver_name
      FROM messages m
      LEFT JOIN users u1 ON m.sender_id = u1.id
      LEFT JOIN users u2 ON m.receiver_id = u2.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?) 
         OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `, [req.user.userId, userId, userId, req.user.userId, parseInt(limit), parseInt(offset)], (err, messages) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка базы данных' });
      }

      // Отмечаем сообщения как прочитанные
      db.run(`
        UPDATE messages 
        SET is_read = 1 
        WHERE sender_id = ? AND receiver_id = ? AND is_read = 0
      `, [userId, req.user.userId], (err) => {
        if (err) {
          console.error('Ошибка при обновлении статуса прочтения:', err);
        }
      });

      res.json({ 
        messages: messages.reverse(), // Возвращаем в хронологическом порядке
        other_user: user
      });
    });
  });
});

// Получить непрочитанные сообщения
router.get('/unread', auth, (req, res) => {
  db.all(`
    SELECT m.*, u.name as sender_name
    FROM messages m
    LEFT JOIN users u ON m.sender_id = u.id
    WHERE m.receiver_id = ? AND m.is_read = 0
    ORDER BY m.created_at DESC
  `, [req.user.userId], (err, messages) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    res.json({ messages });
  });
});

// Отметить сообщения как прочитанные
router.patch('/read', auth, [
  body('sender_id').isInt({ min: 1 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sender_id } = req.body;

    db.run(`
      UPDATE messages 
      SET is_read = 1 
      WHERE sender_id = ? AND receiver_id = ? AND is_read = 0
    `, [sender_id, req.user.userId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Ошибка при обновлении статуса' });
      }
      
      res.json({ 
        message: 'Сообщения отмечены как прочитанные',
        updatedCount: this.changes
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получить сообщения по заказу
router.get('/order/:orderId', auth, (req, res) => {
  const { orderId } = req.params;
  
  // Проверка прав доступа к заказу
  db.get(`
    SELECT o.*, s.user_id as shop_owner_id 
    FROM orders o 
    LEFT JOIN shops s ON o.shop_id = s.id 
    WHERE o.id = ?
  `, [orderId], (err, order) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }
    
    if (order.customer_id !== req.user.userId && 
        order.shop_owner_id !== req.user.userId) {
      return res.status(403).json({ error: 'Нет доступа к этому заказу' });
    }

    // Получаем сообщения по заказу
    db.all(`
      SELECT m.*, 
             u1.name as sender_name,
             u2.name as receiver_name
      FROM messages m
      LEFT JOIN users u1 ON m.sender_id = u1.id
      LEFT JOIN users u2 ON m.receiver_id = u2.id
      WHERE m.order_id = ?
      ORDER BY m.created_at ASC
    `, [orderId], (err, messages) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка базы данных' });
      }

      res.json({ messages });
    });
  });
});

module.exports = router;
