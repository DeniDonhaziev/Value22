import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TestRegister: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { register } = useAuth();

  const testRegistration = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      console.log('🧪 Начинаем тестовую регистрацию...');
      
      const testData = {
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        name: 'Тестовый Пользователь',
        phone: '+7 (900) 123-45-67',
        role: 'seller'
      };
      
      console.log('🧪 Тестовые данные:', testData);
      
      await register(testData.email, testData.password, testData.name, testData.phone, testData.role);
      
      setMessage('✅ Регистрация прошла успешно!');
      
    } catch (error: any) {
      console.error('🧪 Ошибка тестовой регистрации:', error);
      setMessage(`❌ Ошибка: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🧪 Тест регистрации</h1>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="space-y-4">
            <p className="text-gray-600">
              Эта страница поможет протестировать регистрацию и найти ошибки.
            </p>
            
            <button
              onClick={testRegistration}
              disabled={loading}
              className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Тестируем...' : '🧪 Тестовая регистрация'}
            </button>
            
            {message && (
              <div className={`p-4 rounded-lg ${
                message.includes('✅') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">📋 Инструкции:</h3>
              <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
                <li>Откройте консоль браузера (F12 → Console)</li>
                <li>Нажмите кнопку "Тестовая регистрация"</li>
                <li>Посмотрите логи в консоли браузера</li>
                <li>Проверьте логи в консоли сервера</li>
                <li>Если есть ошибка - детали будут в логах</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestRegister;

