const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { auth } = require('../middleware/auth');

// Получить список чатов пользователя
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT 
        c.id,
        c.buyer_id,
        c.seller_id,
        c.product_id,
        c.shop_id,
        c.last_message_at,
        c.created_at,
        p.name as product_name,
        p.image_url as product_image,
        s.name as shop_name,
        s.logo_url as shop_logo,
        u1.name as buyer_name,
        u2.name as seller_name,
        (SELECT COUNT(*) FROM messages_new m WHERE m.chat_id = c.id AND m.sender_id != ? AND m.is_read = 0) as unread_count,
        (SELECT message FROM messages_new m WHERE m.chat_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message
      FROM chats c
      LEFT JOIN products p ON c.product_id = p.id
      LEFT JOIN shops s ON c.shop_id = s.id
      LEFT JOIN users u1 ON c.buyer_id = u1.id
      LEFT JOIN users u2 ON c.seller_id = u2.id
      WHERE c.buyer_id = ? OR c.seller_id = ?
      ORDER BY c.last_message_at DESC
    `;
    
    const chats = await db.all(query, [userId, userId, userId]);
    
    res.json({ chats });
  } catch (error) {
    console.error('Ошибка получения чатов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить сообщения чата
router.get('/:chatId/messages', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    
    // Проверяем, что пользователь участвует в чате
    const chat = await db.get('SELECT * FROM chats WHERE id = ? AND (buyer_id = ? OR seller_id = ?)', [chatId, userId, userId]);
    
    if (!chat) {
      return res.status(404).json({ error: 'Чат не найден' });
    }
    
    // Получаем сообщения
    const messages = await db.all(`
      SELECT 
        m.*,
        u.name as sender_name
      FROM messages_new m
      JOIN users u ON m.sender_id = u.id
      WHERE m.chat_id = ?
      ORDER BY m.created_at ASC
    `, [chatId]);
    
    // Отмечаем сообщения как прочитанные
    await db.run('UPDATE messages_new SET is_read = 1 WHERE chat_id = ? AND sender_id != ?', [chatId, userId]);
    
    res.json({ messages });
  } catch (error) {
    console.error('Ошибка получения сообщений:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Отправить сообщение
router.post('/:chatId/messages', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Сообщение не может быть пустым' });
    }
    
    // Проверяем, что пользователь участвует в чате
    const chat = await db.get('SELECT * FROM chats WHERE id = ? AND (buyer_id = ? OR seller_id = ?)', [chatId, userId, userId]);
    
    if (!chat) {
      return res.status(404).json({ error: 'Чат не найден' });
    }
    
    // Добавляем сообщение
    const result = await db.run(`
      INSERT INTO messages_new (chat_id, sender_id, message, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `, [chatId, userId, message.trim()]);
    
    // Обновляем время последнего сообщения в чате
    await db.run('UPDATE chats SET last_message_at = datetime("now") WHERE id = ?', [chatId]);
    
    // Получаем добавленное сообщение
    const newMessage = await db.get(`
      SELECT 
        m.*,
        u.name as sender_name
      FROM messages_new m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `, [result.lastID]);
    
    res.status(201).json({ message: newMessage });
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать новый чат
router.post('/', auth, async (req, res) => {
  try {
    const { seller_id, product_id, shop_id, initial_message } = req.body;
    const buyer_id = req.user.id;
    
    console.log('Создание чата:', {
      buyer_id,
      seller_id,
      product_id,
      shop_id,
      initial_message: initial_message?.substring(0, 50) + '...'
    });
    
    if (!seller_id) {
      return res.status(400).json({ error: 'ID продавца обязателен' });
    }
    
    if (!initial_message || initial_message.trim().length === 0) {
      return res.status(400).json({ error: 'Начальное сообщение обязательно' });
    }
    
    // Проверяем, не существует ли уже чат между этими пользователями
    console.log('Проверяем существующий чат для:', { buyer_id, seller_id, product_id });
    
    const existingChat = await db.get(`
      SELECT * FROM chats 
      WHERE buyer_id = ? AND seller_id = ? 
      AND (product_id = ? OR (product_id IS NULL AND ? IS NULL))
    `, [buyer_id, seller_id, product_id, product_id]);
    
    console.log('Найден существующий чат:', existingChat);
    
    if (existingChat) {
      return res.status(400).json({ error: 'Чат уже существует', chat_id: existingChat.id });
    }
    
    // Создаем новый чат
    console.log('Создаем чат с параметрами:', [buyer_id, seller_id, product_id || null, shop_id || null]);
    
    const chatResult = await db.run(`
      INSERT INTO chats (buyer_id, seller_id, product_id, shop_id, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `, [buyer_id, seller_id, product_id || null, shop_id || null]);
    
    const chatId = chatResult.lastID;
    console.log('Чат создан с ID:', chatId);
    
    // Добавляем начальное сообщение
    console.log('Добавляем сообщение:', [chatId, buyer_id, initial_message.trim()]);
    
    const messageResult = await db.run(`
      INSERT INTO messages_new (chat_id, sender_id, message, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `, [chatId, buyer_id, initial_message.trim()]);
    
    console.log('Сообщение создано с ID:', messageResult.lastID);
    
    // Получаем созданный чат с информацией
    console.log('Получаем информацию о созданном чате ID:', chatId);
    
    const chat = await db.get(`
      SELECT 
        c.*,
        p.name as product_name,
        p.image_url as product_image,
        s.name as shop_name,
        s.logo_url as shop_logo,
        u1.name as buyer_name,
        u2.name as seller_name
      FROM chats c
      LEFT JOIN products p ON c.product_id = p.id
      LEFT JOIN shops s ON c.shop_id = s.id
      LEFT JOIN users u1 ON c.buyer_id = u1.id
      LEFT JOIN users u2 ON c.seller_id = u2.id
      WHERE c.id = ?
    `, [chatId]);
    
    console.log('Получен чат:', chat);
    
    res.status(201).json({ 
      message: 'Чат создан успешно',
      chat: {
        ...chat,
        last_message: initial_message.trim()
      }
    });
  } catch (error) {
    console.error('Ошибка создания чата:', error);
    console.error('Детали ошибки:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
  }
});

// Отметить сообщения как прочитанные
router.patch('/:chatId/read', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    
    // Проверяем, что пользователь участвует в чате
    const chat = await db.get('SELECT * FROM chats WHERE id = ? AND (buyer_id = ? OR seller_id = ?)', [chatId, userId, userId]);
    
    if (!chat) {
      return res.status(404).json({ error: 'Чат не найден' });
    }
    
    // Отмечаем сообщения как прочитанные
    await db.run('UPDATE messages_new SET is_read = 1 WHERE chat_id = ? AND sender_id != ?', [chatId, userId]);
    
    res.json({ message: 'Сообщения отмечены как прочитанные' });
  } catch (error) {
    console.error('Ошибка отметки сообщений:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
