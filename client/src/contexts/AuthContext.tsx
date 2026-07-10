import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string, role?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Настройка axios
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Проверка токена при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      console.log('AuthContext: проверяем токен =', token);
      if (token) {
        try {
          console.log('AuthContext: отправляем запрос на /api/auth/verify');
          const response = await axios.get('/api/auth/verify');
          console.log('AuthContext: получен ответ от сервера =', response.data.user);
          setUser(response.data.user);
        } catch (error) {
          console.error('Ошибка проверки токена:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      } else {
        console.log('AuthContext: токен отсутствует');
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
    } catch (error: any) {
      console.error('Ошибка входа:', error.response?.data);
      
      // Обработка ошибок валидации
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorMessage = error.response.data.errors.map((err: any) => err.msg || err.message).join(', ');
        throw new Error(errorMessage);
      }
      
      throw new Error(error.response?.data?.error || 'Ошибка входа');
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string, role: string = 'customer') => {
    try {
      console.log('🔵 AuthContext: Начинаем регистрацию пользователя:', { email, name, role });
      
      const requestData = { 
        email, 
        password, 
        name, 
        phone,
        role
      };
      
      console.log('📤 AuthContext: Отправляем запрос на сервер:', requestData);
      
      const response = await axios.post('/api/auth/register', requestData);
      
      console.log('📥 AuthContext: Получен ответ от сервера:', response.data);
      
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      console.log('✅ AuthContext: Регистрация завершена успешно');
      
    } catch (error: any) {
      console.error('❌ AuthContext: Ошибка регистрации:', error);
      console.error('❌ AuthContext: Статус ответа:', error.response?.status);
      console.error('❌ AuthContext: Данные ответа:', error.response?.data);
      console.error('❌ AuthContext: Код ошибки:', error.code);
      
      // Обработка ошибок валидации
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorMessage = error.response.data.errors.map((err: any) => err.msg || err.message).join(', ');
        throw new Error(errorMessage);
      }
      
      // Обработка ошибки подключения
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        throw new Error('Не удается подключиться к серверу. Проверьте, что сервер запущен.');
      }
      
      throw new Error(error.response?.data?.error || error.message || 'Ошибка регистрации');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
