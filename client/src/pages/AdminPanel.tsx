import React, { useState, useEffect } from 'react';
import { Trash2, Eye, CheckCircle, XCircle, Store, Package, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import axios from 'axios';

interface Shop {
  id: number;
  name: string;
  description: string;
  owner_name: string;
  is_verified: boolean;
  is_premium: boolean;
  created_at: string;
  products_count: number;
}

interface Stats {
  total_shops: number;
  total_products: number;
  total_users: number;
  pending_verifications: number;
}

const AdminPanel: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_shops: 0,
    total_products: 0,
    total_users: 0,
    pending_verifications: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [shopsResponse, statsResponse] = await Promise.all([
        axios.get('/api/admin/shops'),
        axios.get('/api/admin/stats')
      ]);
      
      setShops(shopsResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShop = async (shopId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот магазин? Это действие нельзя отменить.')) {
      return;
    }

    try {
      console.log('🗑️ Начинаем удаление магазина ID:', shopId);
      const response = await axios.delete(`/api/admin/shops/${shopId}`);
      console.log('✅ Ответ сервера:', response.data);
      setShops(shops.filter(shop => shop.id !== shopId));
      fetchData(); // Обновляем статистику
      alert('Магазин успешно удален!');
    } catch (error: any) {
      console.error('❌ Ошибка при удалении магазина:', error);
      console.error('❌ Ответ сервера:', error.response?.data);
      console.error('❌ Статус:', error.response?.status);
      alert(`Ошибка при удалении магазина: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleToggleVerification = async (shopId: number, currentStatus: boolean) => {
    try {
      await axios.patch(`/api/admin/shops/${shopId}/verify`, {
        is_verified: !currentStatus
      });
      
      setShops(shops.map(shop => 
        shop.id === shopId 
          ? { ...shop, is_verified: !currentStatus }
          : shop
      ));
      fetchData(); // Обновляем статистику
    } catch (error) {
      console.error('Ошибка при изменении статуса верификации:', error);
      alert('Ошибка при изменении статуса верификации');
    }
  };

  const handleTogglePremium = async (shopId: number, currentStatus: boolean) => {
    try {
      await axios.patch(`/api/admin/shops/${shopId}/premium`, {
        is_premium: !currentStatus
      });
      
      setShops(shops.map(shop => 
        shop.id === shopId 
          ? { ...shop, is_premium: !currentStatus }
          : shop
      ));
    } catch (error) {
      console.error('Ошибка при изменении премиум статуса:', error);
      alert('Ошибка при изменении премиум статуса');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка админ-панели...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Панель администратора</h1>
              <p className="text-gray-600 text-lg">Управление магазинами и пользователями</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="px-4 py-2 bg-gradient-to-r from-red-500 to-primary-600 text-white rounded-full text-sm font-semibold shadow-sm">
                Администратор
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-primary-50 rounded-xl p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{stats.total_shops}</div>
                  <div className="text-sm text-gray-600 font-medium">Всего магазинов</div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{stats.total_products}</div>
                  <div className="text-sm text-gray-600 font-medium">Всего товаров</div>
                </div>
              </div>
            </div>

            <div className="bg-primary-50 rounded-xl p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{stats.total_users}</div>
                  <div className="text-sm text-gray-600 font-medium">Всего пользователей</div>
                </div>
              </div>
            </div>

            <div className="bg-primary-50 rounded-xl p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{stats.pending_verifications}</div>
                  <div className="text-sm text-gray-600 font-medium">Ожидают верификации</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shops Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Управление магазинами</h2>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-600 text-white rounded-lg hover:from-primary-700 hover:to-primary-700 transition-all duration-200"
            >
              Обновить
            </button>
          </div>

          {shops.length === 0 ? (
            <div className="text-center py-12">
              <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Магазины не найдены</h3>
              <p className="text-gray-600">Пока нет зарегистрированных магазинов</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Магазин</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Владелец</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Товары</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Статус</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Дата создания</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {shops.map((shop) => (
                    <tr key={shop.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{shop.name}</div>
                          <div className="text-sm text-gray-600">{shop.description}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-900">{shop.owner_name}</td>
                      <td className="py-4 px-4 text-gray-900">{shop.products_count}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {shop.is_verified ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              Верифицирован
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                              Не верифицирован
                            </span>
                          )}
                          {!!shop.is_premium && (
                            <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                              Премиум
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {formatDate(shop.created_at)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleVerification(shop.id, shop.is_verified)}
                            className={`p-2 rounded-lg transition-colors ${
                              shop.is_verified 
                                ? 'text-red-600 hover:bg-red-50' 
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={shop.is_verified ? 'Отменить верификацию' : 'Верифицировать'}
                          >
                            {shop.is_verified ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                          
                          <button
                            onClick={() => handleTogglePremium(shop.id, shop.is_premium)}
                            className={`p-2 rounded-lg transition-colors ${
                              shop.is_premium 
                                ? 'text-red-600 hover:bg-red-50' 
                                : 'text-primary-600 hover:bg-primary-50'
                            }`}
                            title={shop.is_premium ? 'Убрать премиум' : 'Сделать премиум'}
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => setSelectedShop(shop)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Просмотреть детали"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteShop(shop.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Удалить магазин"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Shop Details Modal */}
        {selectedShop && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Детали магазина</h3>
                <button
                  onClick={() => setSelectedShop(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Название</label>
                  <div className="p-3 bg-gray-50 rounded-lg">{selectedShop.name}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Описание</label>
                  <div className="p-3 bg-gray-50 rounded-lg">{selectedShop.description || 'Не указано'}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Владелец</label>
                  <div className="p-3 bg-gray-50 rounded-lg">{selectedShop.owner_name}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Количество товаров</label>
                  <div className="p-3 bg-gray-50 rounded-lg">{selectedShop.products_count}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Дата создания</label>
                  <div className="p-3 bg-gray-50 rounded-lg">{formatDate(selectedShop.created_at)}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
