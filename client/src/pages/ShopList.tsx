import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Store, Star, ShieldCheck, MapPin, Plus, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Shop {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  category: string;
  logo_url?: string;
  is_verified: boolean;
  is_premium: boolean;
  created_at: string;
  products_count: number;
  avg_price: number;
}

const ShopList: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchShops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);

      const response = await axios.get(`/api/shops?${params}`);
      setShops(response.data.shops);
    } catch (error) {
      console.error('Ошибка при загрузке магазинов:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU').format(price);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Title + create */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900">Магазины</h1>
        {user?.role === 'seller' && (
          <Link to="/create-shop" className="btn-primary shrink-0">
            <Plus className="w-4 h-4 mr-2" /> Создать магазин
          </Link>
        )}
      </div>

      <div className="relative mb-6 max-w-2xl">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 w-4 h-4 pointer-events-none" />
        <input
          type="text"
          placeholder="Поиск магазинов..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-10"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <div className="h-32 bg-ink-100" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-ink-100 rounded w-1/2" />
                <div className="h-4 bg-ink-100 rounded w-full" />
                <div className="h-4 bg-ink-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : shops.length === 0 ? (
        <div className="card text-center py-16 px-6">
          <Store className="w-14 h-14 text-ink-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-ink-900 mb-1">Магазины не найдены</h3>
          <p className="text-ink-500">Попробуйте изменить параметры поиска</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shops.map((shop) => (
            <Link
              key={shop.id}
              to={`/shops/${shop.id}`}
              className="card overflow-hidden group flex flex-col"
            >
              {/* Cover */}
              <div className="relative h-32 bg-gradient-to-br from-primary-100 to-primary-100">
                {shop.logo_url ? (
                  <img
                    src={shop.logo_url}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Store className="w-12 h-12 text-primary-300" />
                  </div>
                )}
                {!!shop.is_premium && (
                  <span className="absolute top-2 left-2 bg-primary-500 text-white px-2 py-0.5 rounded-md text-[11px] font-bold">
                    Премиум
                  </span>
                )}
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-bold text-ink-900 group-hover:text-primary-600 transition-colors flex items-center gap-1.5">
                    <span className="line-clamp-1">{shop.name}</span>
                    {!!shop.is_verified && <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />}
                  </h3>
                  <span className="flex items-center gap-1 text-sm text-ink-500 shrink-0">
                    <Star className="w-4 h-4 text-primary-400 fill-current" /> 4.8
                  </span>
                </div>

                <span className="badge badge-info self-start mb-3">{shop.category}</span>

                <p className="text-sm text-ink-500 line-clamp-2 mb-4">
                  {shop.description || 'Описание магазина не указано'}
                </p>

                <div className="mt-auto space-y-2">
                  <div className="flex items-center justify-between text-sm text-ink-600">
                    <span className="flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-ink-400" /> {shop.products_count} товаров
                    </span>
                    <span className="font-semibold text-ink-900">от {formatPrice(shop.avg_price)} ₽</span>
                  </div>
                  {shop.address && (
                    <div className="flex items-center gap-1.5 text-sm text-ink-500">
                      <MapPin className="w-4 h-4 text-ink-400 shrink-0" />
                      <span className="line-clamp-1">{shop.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopList;
