const admin = require('firebase-admin');

// Временная конфигурация для разработки (без Firebase)
// В продакшене замените на реальные данные Firebase
const serviceAccount = {
  type: "service_account",
  project_id: "value-marketplace-dev",
  private_key_id: "temp-key-id",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB\n7VJTUt9Us8cKB7VJTUt9Us8cKB7VJTUt9Us8cKB7VJTUt9Us8cKB7VJTUt9Us8cKB\nAgMBAAECggEBAKTmjaS6tkK8BlPXClTQ2vpz/N6uxDeS35mXpqasqskVlaUidMBg\nMRL3pqSpVDlVH0JK8EjXkqZqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkq\nkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkq\nkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkq\nkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkq\nkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkq\nAgMBAAECggEACzjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7\nK5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7\nK5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7\nK5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7\nK5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7\nK5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7K5tjz7\nAgMBAAECggEABqz7T65mF1K7T65mF1K7T65mF1K7T65mF1K7T65mF1K7T65mF1K7T\n65mF1K7T65mF1K7T65mF1K7T65mF1K7T65mF1K7T65mF1K7T65mF1K7T65mF1K7T65\nmF1K7T65mF1K7T65mF1K7T65mF1K7T65mF1K7T65mF1K7T65mF1K7T65mF1K7T65mF\n1K7T65mF1K7T65mF1K7T65mF1K7T65mF1K7T65mF1K7T65mF1K7T65mF1K7T65mF1K\n7T65mF1K7T65mF1K7T65mF1K7T65mF1K7T65mF1K7T65mF1K7T65mF1K7T65mF1K7T\n65mF1K7T65mF1K7T65mF1K7T65mF1K7T65mF1K7T65mF1K7T65mF1K7T65mF1K7T65\nAgMBAAECggEBAKqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqk\nqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkq\nkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqk\nqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkq\nkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqk\nqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkq\nAgMBAAECggEBAKqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqk\nqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkq\nkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqk\nqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkq\nkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqk\nqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkq\nAgMBAAECggEBAKqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqk\nqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkq\nkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqk\nqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkq\nkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqk\nqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkqkq\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-temp@value-marketplace-dev.iam.gserviceaccount.com",
  client_id: "123456789",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-temp%40value-marketplace-dev.iam.gserviceaccount.com"
};

// Временная инициализация без Firebase для разработки
let db, auth;

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://value-marketplace-dev-default-rtdb.firebaseio.com"
    });
  }
  db = admin.firestore();
  auth = admin.auth();
} catch (error) {
  console.log('Firebase не инициализирован, используем SQLite для разработки');
  // В случае ошибки Firebase, используем SQLite
  db = null;
  auth = null;
}

module.exports = { admin, db, auth };
