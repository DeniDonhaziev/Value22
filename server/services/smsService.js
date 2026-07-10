const twilio = require('twilio');
const { db } = require('../firebase-config');

// Инициализация Twilio клиента
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Генерация случайного кода подтверждения
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Сохранение кода подтверждения в Firebase
async function saveVerificationCode(phone, code) {
  try {
    const verificationRef = db.collection('verifications');
    await verificationRef.doc(phone).set({
      code: code,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 минут
      used: false
    });
    return true;
  } catch (error) {
    console.error('Ошибка сохранения кода подтверждения:', error);
    return false;
  }
}

// Отправка SMS с кодом подтверждения
async function sendVerificationSMS(phone, code) {
  try {
    const message = await twilioClient.messages.create({
      body: `Ваш код подтверждения для Value Marketplace: ${code}. Код действителен 10 минут.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    
    console.log('SMS отправлено:', message.sid);
    return true;
  } catch (error) {
    console.error('Ошибка отправки SMS:', error);
    return false;
  }
}

// Проверка кода подтверждения
async function verifyCode(phone, code) {
  try {
    const verificationRef = db.collection('verifications');
    const doc = await verificationRef.doc(phone).get();
    
    if (!doc.exists) {
      return { valid: false, message: 'Код не найден' };
    }
    
    const data = doc.data();
    const now = new Date();
    
    if (data.used) {
      return { valid: false, message: 'Код уже использован' };
    }
    
    if (now > data.expiresAt.toDate()) {
      return { valid: false, message: 'Код истек' };
    }
    
    if (data.code !== code) {
      return { valid: false, message: 'Неверный код' };
    }
    
    // Помечаем код как использованный
    await verificationRef.doc(phone).update({ used: true });
    
    return { valid: true, message: 'Код подтвержден' };
  } catch (error) {
    console.error('Ошибка проверки кода:', error);
    return { valid: false, message: 'Ошибка проверки кода' };
  }
}

// Основная функция отправки кода подтверждения
async function sendVerificationCode(phone) {
  try {
    const code = generateVerificationCode();
    
    // Сохраняем код в Firebase
    const saved = await saveVerificationCode(phone, code);
    if (!saved) {
      return { success: false, message: 'Ошибка сохранения кода' };
    }
    
    // Отправляем SMS
    const sent = await sendVerificationSMS(phone, code);
    if (!sent) {
      return { success: false, message: 'Ошибка отправки SMS' };
    }
    
    return { success: true, message: 'Код отправлен' };
  } catch (error) {
    console.error('Ошибка отправки кода подтверждения:', error);
    return { success: false, message: 'Внутренняя ошибка сервера' };
  }
}

module.exports = {
  sendVerificationCode,
  verifyCode,
  generateVerificationCode
};
