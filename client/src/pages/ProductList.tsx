import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Heart, MapPin, ChevronRight, ShoppingBag, ShoppingCart, Star,
  LayoutGrid, Smartphone, Shirt, Dumbbell, Sparkles, Home as HomeIcon, Car
} from 'lucide-react';
import axios from 'axios';
import { useUserCity } from '../utils/useUserCity';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock_quantity: number;
  created_at: string;
  contact_phone?: string;
  // Опционально — покажутся, если бэкенд начнёт их отдавать
  old_price?: number;
  rating?: number;
  reviews_count?: number;
  shop: {
    id: number;
    name: string;
    is_verified: boolean;
    is_premium: boolean;
    user_id: number;
  };
}

const categoryList = [
  { name: 'Все категории', label: 'Все', icon: LayoutGrid },
  { name: 'Электроника', label: 'Электроника', icon: Smartphone },
  { name: 'Одежда', label: 'Одежда', icon: Shirt },
  { name: 'Спорт', label: 'Спорт', icon: Dumbbell },
  { name: 'Красота', label: 'Красота', icon: Sparkles },
  { name: 'Дом', label: 'Дом', icon: HomeIcon },
  { name: 'Авто', label: 'Авто', icon: Car },
];

const ProductList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'Все категории');
  const [sortBy, setSortBy] = useState('newest');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const { city, detecting, refresh } = useUserCity();
  const navigate = useNavigate();

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || 'Все категории');
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory !== 'Все категории') params.append('category', selectedCategory);
      if (sortBy) params.append('sort', sortBy);

      const response = await axios.get(`/api/products?${params}`);
      setProducts(response.data.products);
    } catch (error) {
      console.error('Ошибка при загрузке товаров:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU').format(price);

  const applyCategory = (cat: string) => {
    setSelectedCategory(cat);
    const next = new URLSearchParams(searchParams);
    if (cat === 'Все категории') next.delete('category'); else next.set('category', cat);
    setSearchParams(next, { replace: true });
  };

  const toggleFav = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const featured = products[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Ship to — город определяется автоматически по местоположению */}
      <button
        onClick={refresh}
        title="Обновить местоположение"
        className="flex items-center gap-1.5 text-sm text-ink-500 mb-5"
      >
        <MapPin className={`w-4 h-4 text-primary-500 ${detecting ? 'animate-pulse' : ''}`} />
        <span>Доставка в:</span>
        <span className="font-semibold text-ink-900">{city}</span>
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Category circles */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 py-2 mb-5">
        {categoryList.map((cat) => {
          const active = selectedCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => applyCategory(cat.name)}
              className="flex flex-col items-center gap-1.5 shrink-0 w-16"
            >
              <span
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  active
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-ink-50 text-ink-600'
                }`}
              >
                <cat.icon className="w-6 h-6" />
              </span>
              <span className={`text-[11px] font-medium truncate w-full text-center ${active ? 'text-ink-900' : 'text-ink-500'}`}>
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Promo banner */}
      {!loading && featured && (
        <div className="relative overflow-hidden rounded-2xl bg-ink-900 mb-7 p-5 sm:p-6 flex items-center justify-between gap-4">
          <div className="relative z-10">
            <h2 className="text-lg sm:text-2xl font-extrabold text-white leading-tight">Год распродаж</h2>
            <p className="text-primary-400 font-semibold text-sm mb-3">Скидки до 90%</p>
            <Link
              to={`/products/${featured.id}`}
              className="inline-flex items-center bg-primary-500 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-primary-600 transition-colors"
            >
              Купить
            </Link>
          </div>
          <div className="relative z-10 shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center">
            {featured.image_url ? (
              <img src={featured.image_url} alt={featured.name} className="w-full h-full object-contain -rotate-12" />
            ) : (
              <ShoppingBag className="w-10 h-10 text-white/40" />
            )}
          </div>
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-primary-500/20 rounded-full blur-2xl" />
        </div>
      )}

      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-extrabold text-ink-900">Новинки</h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-sm font-medium text-ink-500 bg-transparent focus:outline-none"
        >
          <option value="newest">Сначала новые</option>
          <option value="price_low">Дешевле</option>
          <option value="price_high">Дороже</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-ink-50 animate-pulse aspect-[3/4]" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="w-14 h-14 text-ink-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-ink-900 mb-1">Товары не найдены</h3>
          <p className="text-ink-500">Попробуйте изменить параметры поиска</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map((product) => {
            const fav = favorites.has(product.id);
            const to = `/products/${product.id}`;
            const hasOld = !!product.old_price && product.old_price > product.price;
            const discount = hasOld ? Math.round((1 - product.price / (product.old_price as number)) * 100) : 0;
            const rating = product.rating ?? 4.8;
            const reviews = product.reviews_count;
            const lowStock = product.stock_quantity > 0 && product.stock_quantity <= 3;
            return (
              <div key={product.id} className="group flex flex-col">
                {/* Image */}
                <div className="relative rounded-2xl overflow-hidden bg-ink-50 aspect-[3/4]">
                  <Link to={to} className="block w-full h-full">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-10 h-10 text-ink-300" />
                      </div>
                    )}
                  </Link>

                  {/* Heart */}
                  <button
                    onClick={(e) => toggleFav(e, product.id)}
                    aria-label="В избранное"
                    className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center"
                  >
                    <Heart className={`w-5 h-5 transition-colors ${fav ? 'fill-red-500 text-red-500' : 'text-ink-500'}`} />
                  </button>

                  {/* Badges bottom-left */}
                  <div className="absolute bottom-2 left-2 flex flex-col items-start gap-1">
                    {hasOld && (
                      <span className="bg-red-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-md">−{discount}%</span>
                    )}
                    {!!product.shop?.is_premium && (
                      <span className="bg-primary-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">Хит</span>
                    )}
                    {lowStock && (
                      <span className="bg-ink-900/85 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
                        Осталось {product.stock_quantity}
                      </span>
                    )}
                  </div>

                  {/* Cart button */}
                  <button
                    onClick={(e) => { e.preventDefault(); navigate(to); }}
                    aria-label="Купить"
                    className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/30 flex items-center justify-center hover:bg-primary-600 transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>

                {/* Info */}
                <Link to={to} className="block mt-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-base font-extrabold ${hasOld ? 'text-red-500' : 'text-ink-900'}`}>
                      {formatPrice(product.price)} ₽
                    </span>
                    {hasOld && (
                      <span className="text-xs text-ink-400 line-through">{formatPrice(product.old_price as number)} ₽</span>
                    )}
                  </div>
                  <h3 className="text-sm text-ink-700 line-clamp-2 mt-0.5 leading-snug">{product.name}</h3>
                  <div className="flex items-center gap-1 mt-1 text-xs text-ink-500">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-current shrink-0" />
                    <span className="font-semibold text-ink-700">{rating.toFixed(1)}</span>
                    <span className="text-ink-400 truncate">
                      · {reviews != null ? `${reviews} оценок` : product.shop?.name}
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductList;
