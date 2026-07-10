const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

const { initDatabase } = require('./database');
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shops');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const messageRoutes = require('./routes/messages');
const chatRoutes = require('./routes/chats');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);
app.use(cors({
  // В монолите фронт и API на одном origin, поэтому запросы без Origin тоже пропускаем
  origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin) || allowedOrigins.length === 0),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения разрешены!'), false);
    }
  }
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/admin', adminRoutes);

// File upload route
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не был загружен' });
    }
    
    // Return the file URL
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ 
      success: true, 
      fileUrl: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Ошибка загрузки файла:', error);
    res.status(500).json({ error: 'Ошибка загрузки файла' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Value Marketplace API is running' });
});

// В продакшене отдаём собранный React-клиент (монолит: один сервис)
const clientBuild = path.join(__dirname, '..', 'client', 'build');
if (fs.existsSync(clientBuild)) {
  app.use(express.static(clientBuild));
  // Любой не-API маршрут отдаёт index.html (для React Router)
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Что-то пошло не так!' });
});

// Сервер поднимаем СРАЗУ — чтобы платформа (Render) увидела открытый порт и деплой прошёл.
// Базу инициализируем параллельно, с повторными попытками, и НЕ роняем процесс при ошибке.
const server = app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📱 Health Check: /api/health`);
  console.log('='.repeat(60));
});

server.on('error', (err) => {
  console.error('Ошибка запуска сервера:', err.message);
  process.exit(1);
});

const initWithRetry = async (attempt = 1) => {
  try {
    await initDatabase();
    console.log('✅ БД готова к работе');
  } catch (err) {
    console.error(`⚠️  Ошибка инициализации БД (попытка ${attempt}/5):`, err.message);
    if (attempt < 5) {
      setTimeout(() => initWithRetry(attempt + 1), 3000);
    } else {
      console.error('❌ Не удалось подключиться к БД. Проверьте переменную DATABASE_URL. Сервер продолжает работать (статика доступна).');
    }
  }
};
initWithRetry();

// Ловим необработанные ошибки, чтобы процесс не падал молча
process.on('unhandledRejection', (reason) => console.error('unhandledRejection:', reason));
