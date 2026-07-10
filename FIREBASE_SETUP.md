# Настройка Firebase для Value Marketplace

## Шаг 1: Создание проекта Firebase

1. Перейдите на [Firebase Console](https://console.firebase.google.com/)
2. Нажмите "Создать проект"
3. Введите название проекта: `value-marketplace`
4. Отключите Google Analytics (опционально)
5. Нажмите "Создать проект"

## Шаг 2: Настройка Authentication

1. В левом меню выберите "Authentication"
2. Нажмите "Начать"
3. Перейдите на вкладку "Sign-in method"
4. Включите "Email/Password"
5. Нажмите "Сохранить"

## Шаг 3: Настройка Firestore Database

1. В левом меню выберите "Firestore Database"
2. Нажмите "Создать базу данных"
3. Выберите "Начать в тестовом режиме"
4. Выберите ближайший регион (например, europe-west3)
5. Нажмите "Готово"

## Шаг 4: Получение ключей сервисного аккаунта

1. В настройках проекта (шестеренка) выберите "Настройки проекта"
2. Перейдите на вкладку "Сервисные аккаунты"
3. Нажмите "Создать новый закрытый ключ"
4. Скачайте JSON файл

## Шаг 5: Настройка переменных окружения

Создайте файл `.env` в папке `server`:

```env
# Firebase Configuration
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your-cert-url
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Twilio Configuration (для SMS)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
```

## Шаг 6: Обновление конфигурации Firebase

Замените содержимое файла `server/firebase-config.js`:

```javascript
const admin = require('firebase-admin');

const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
```

## Шаг 7: Включение SMS функциональности

Для включения SMS подтверждения:

1. Зарегистрируйтесь на [Twilio](https://www.twilio.com/)
2. Получите Account SID и Auth Token
3. Купите номер телефона
4. Добавьте переменные окружения Twilio в `.env`
5. Раскомментируйте SMS функциональность в коде

## Структура базы данных Firestore

### Коллекция: users
```javascript
{
  id: "auto-generated",
  email: "user@example.com",
  password: "hashed-password",
  name: "User Name",
  phone: "+79001234567",
  role: "customer", // или "seller"
  verified: true,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Коллекция: shops
```javascript
{
  id: "auto-generated",
  userId: "user-id",
  name: "Shop Name",
  description: "Shop description",
  address: "Shop address",
  phone: "+79001234567",
  email: "shop@example.com",
  category: "electronics",
  rating: 4.5,
  imageUrl: "https://example.com/image.jpg",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Коллекция: products
```javascript
{
  id: "auto-generated",
  shopId: "shop-id",
  name: "Product Name",
  description: "Product description",
  price: 1000,
  category: "electronics",
  imageUrl: "https://example.com/image.jpg",
  inStock: true,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Правила безопасности Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Пользователи могут читать и обновлять только свои данные
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Магазины доступны для чтения всем, создание только авторизованным
    match /shops/{shopId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Товары доступны для чтения всем, создание только владельцам магазинов
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Запуск приложения

После настройки Firebase:

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000
