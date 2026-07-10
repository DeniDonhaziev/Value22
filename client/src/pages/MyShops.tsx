import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Store, Plus, Package, Edit, Trash2, MapPin, Phone, Calendar, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Shop {
  id: number;
  name: string;
  description: string;
  category: string;
  logo_url?: string;
  address: string;
  phone: string;
  email: string;
  is_verified: boolean;
  is_premium: boolean;
  owner_name: string;
  products_count: number;
  avg_price: number;
  created_at: string;
}

const MyShops: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log('MyShops useEffect: пользователь =', user);
    console.log('MyShops useEffect: путь =', location.pathname);
    if (user) {
      console.log('MyShops: пользователь найден, загружаем магазины');
      fetchShops();
    } else {
      console.log('MyShops: пользователь НЕ найден');
      setLoading(false);
    }
  }, [user, location.pathname]); // Добавляем location.pathname для обновления при переходе

  const fetchShops = async () => {
    try {
      console.log('Загружаем магазины пользователя...');
      
      // Проверим токен
      const token = localStorage.getItem('token');
      console.log('Токен из localStorage:', token ? 'Есть' : 'Нет');
      
      // Проверим заголовки axios
      console.log('axios.defaults.headers.common:', axios.defaults.headers.common);
      
      // Сначала попробуем специальный endpoint
      let response;
      try {
        response = await axios.get('/api/shops/my-shops', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 404) {
          // Если не работает, попробуем обычный endpoint с фильтром
          console.log('Пробуем альтернативный метод получения магазинов...');
          response = await axios.get(`/api/shops?user_id=${user?.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } else {
          throw error;
        }
      }
      console.log('Получены магазины:', response.data.shops);
      setShops(response.data.shops || []);
    } catch (error: any) {
      console.error('Ошибка загрузки магазинов:', error);
      console.error('Статус ответа:', error.response?.status);
      console.error('Данные ответа:', error.response?.data);
      if (error.response?.status === 401) {
        console.error('Пользователь не авторизован');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShop = async (shopId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот магазин? Все товары также будут удалены.')) {
      try {
        await axios.delete(`/api/shops/${shopId}`);
        setShops(shops.filter(shop => shop.id !== shopId));
        alert('Магазин успешно удален!');
      } catch (error) {
        console.error('Ошибка удаления магазина:', error);
        alert('Ошибка при удалении магазина');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загружаем ваши магазины...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Требуется авторизация</h3>
          <p className="text-gray-600 mb-6">Для просмотра магазинов необходимо войти в аккаунт</p>
          <Link
            to="/login"
            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
            Войти в аккаунт
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Мои магазины</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Управляйте своими магазинами и товарами</p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => {
                setLoading(true);
                fetchShops();
              }}
              className="bg-gray-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors flex items-center text-sm sm:text-base"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Обновить</span>
              <span className="sm:hidden">🔄</span>
            </button>
            <Link
              to="/create-shop"
              className="bg-primary-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Создать магазин</span>
              <span className="sm:hidden">Создать</span>
            </Link>
          </div>
        </div>

        {/* Shops Grid */}
        {shops.length === 0 ? (
          <div className="text-center py-12">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">У вас пока нет магазинов</h3>
            <p className="text-gray-600 mb-6">Создайте свой первый магазин и начните продавать товары</p>
            
            {/* Отладочная информация */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <h4 className="font-semibold text-yellow-800 mb-2">🔍 Отладочная информация:</h4>
              <div className="text-sm text-yellow-700 space-y-1">
                <p><strong>Пользователь:</strong> {user?.name || 'Неизвестно'}</p>
                <p><strong>ID:</strong> {user?.id || 'Неизвестно'}</p>
                <p><strong>Email:</strong> {user?.email || 'Неизвестно'}</p>
                <p><strong>Роль:</strong> {user?.role || 'Неизвестно'}</p>
                <p><strong>Загрузка:</strong> {loading ? 'Да' : 'Нет'}</p>
                <p><strong>Количество магазинов:</strong> {shops.length}</p>
              </div>
              <p className="text-xs text-yellow-600 mt-2">
                Откройте консоль браузера (F12) для подробных логов
              </p>
            </div>
            
            <Link
              to="/create-shop"
              className="bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Создать магазин
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <div key={shop.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                {/* Shop Header */}
                <div className="relative h-48 bg-gradient-to-r from-primary-500 to-primary-600">
                  {shop.logo_url ? (
                    <img
                      src={shop.logo_url}
                      alt={shop.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Store className="w-16 h-16 text-white" />
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-4 right-4 space-y-2">
                    {!!shop.is_verified && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        ✓ Проверен
                      </span>
                    )}
                    {!!shop.is_premium && (
                      <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        ⭐ Премиум
                      </span>
                    )}
                  </div>
                </div>

                {/* Shop Info */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{shop.name}</h3>
                      <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-lg text-xs font-semibold">
                        {shop.category}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">{shop.description}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">{shop.products_count}</div>
                      <div className="text-sm text-gray-500">Товаров</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {shop.avg_price ? `₽${Math.round(shop.avg_price)}` : '-'}
                      </div>
                      <div className="text-sm text-gray-500">Средняя цена</div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="truncate">{shop.address}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{shop.phone}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Создан {new Date(shop.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Link
                        to={`/my-shops/${shop.id}`}
                        className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Управление
                      </Link>
                      <button
                        onClick={() => handleDeleteShop(shop.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <Link
                      to={`/my-shops/${shop.id}`}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить товар
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyShops;
