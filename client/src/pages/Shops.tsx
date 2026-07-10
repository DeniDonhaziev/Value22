import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, Search, Filter, MapPin, Star, Users, Package } from 'lucide-react';
import { Shop } from '../types';

const Shops: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  const categories = [
    { id: 'all', name: 'Все категории' },
    { id: 'electronics', name: 'Электроника' },
    { id: 'clothing', name: 'Одежда' },
    { id: 'home', name: 'Дом и сад' },
    { id: 'sports', name: 'Спорт' },
    { id: 'books', name: 'Книги' },
    { id: 'beauty', name: 'Красота' },
  ];

  const sortOptions = [
    { id: 'rating', name: 'По рейтингу' },
    { id: 'products', name: 'По количеству товаров' },
    { id: 'reviews', name: 'По отзывам' },
  ];

  useEffect(() => {
    // Имитация загрузки данных
    setTimeout(() => {
      const mockShops: Shop[] = [
        {
          id: '1',
          name: 'TechStore Pro',
          description: 'Лучшие гаджеты и электроника по выгодным ценам',
          category: 'electronics',
          rating: 4.8,
          reviews: 1247,
          products: 156,
          location: 'Москва',
          image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
          featured: true,
          ownerId: 'user1',
          createdAt: '2024-01-15',
        },
        {
          id: '2',
          name: 'Fashion Boutique',
          description: 'Стильная одежда и аксессуары для любого случая',
          category: 'clothing',
          rating: 4.6,
          reviews: 892,
          products: 89,
          location: 'Санкт-Петербург',
          image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
          featured: false,
          ownerId: 'user2',
          createdAt: '2024-01-10',
        },
        {
          id: '3',
          name: 'Home & Garden',
          description: 'Все для уюта вашего дома и красивого сада',
          category: 'home',
          rating: 4.7,
          reviews: 567,
          products: 234,
          location: 'Екатеринбург',
          image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
          featured: true,
          ownerId: 'user3',
          createdAt: '2024-01-12',
        },
        {
          id: '4',
          name: 'SportZone',
          description: 'Спортивное оборудование и экипировка',
          category: 'sports',
          rating: 4.5,
          reviews: 445,
          products: 123,
          location: 'Новосибирск',
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
          featured: false,
          ownerId: 'user4',
          createdAt: '2024-01-08',
        },
        {
          id: '5',
          name: 'BookWorld',
          description: 'Книги для всех возрастов и интересов',
          category: 'books',
          rating: 4.9,
          reviews: 1234,
          products: 567,
          location: 'Казань',
          image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
          featured: true,
          ownerId: 'user5',
          createdAt: '2024-01-14',
        },
        {
          id: '6',
          name: 'BeautyLab',
          description: 'Косметика и средства для красоты',
          category: 'beauty',
          rating: 4.4,
          reviews: 678,
          products: 234,
          location: 'Ростов-на-Дону',
          image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop',
          featured: false,
          ownerId: 'user6',
          createdAt: '2024-01-11',
        },
      ];
      setShops(mockShops);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shop.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || shop.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedShops = [...filteredShops].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'products':
        return b.products - a.products;
      case 'reviews':
        return b.reviews - a.reviews;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Найдите лучшие магазины</h1>
            <p className="text-xl mb-8 text-gray-600">
              Откройте для себя тысячи магазинов с уникальными товарами
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type="text"
                  placeholder="Поиск магазинов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold">{shops.length}</div>
                <div className="text-gray-600">Магазинов</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-gray-600">Товаров</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">100K+</div>
                <div className="text-gray-600">Покупателей</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">4.8</div>
                <div className="text-gray-600">Средний рейтинг</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Найдено магазинов: {sortedShops.length}
          </h2>
          <p className="text-gray-600">
            Показаны лучшие магазины по вашему запросу
          </p>
        </div>

        {sortedShops.length === 0 ? (
          <div className="text-center py-12">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Магазины не найдены
            </h3>
            <p className="text-gray-600">
              Попробуйте изменить параметры поиска
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedShops.map((shop) => (
              <Link
                key={shop.id}
                to={`/shop/${shop.id}`}
                className="group"
              >
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  {/* Shop Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={shop.image}
                      alt={shop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {shop.featured && (
                      <div className="absolute top-4 left-4 bg-yellow-400 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Рекомендуемый
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-semibold">{shop.rating}</span>
                    </div>
                  </div>

                  {/* Shop Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {shop.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {shop.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-gray-500 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{shop.location}</span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        <span>{shop.products} товаров</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{shop.reviews} отзывов</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 rounded-lg p-8 text-center text-white mx-4 sm:mx-8 lg:mx-12 mb-12">
        <h2 className="text-3xl font-bold mb-4">Хотите создать свой магазин?</h2>
        <p className="text-xl mb-8 text-primary-100">
          Присоединяйтесь к тысячам успешных продавцов
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Создать магазин
          </Link>
          <Link
            to="/about"
            className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
          >
            Узнать больше
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Shops;