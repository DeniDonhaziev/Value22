import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store, Plus, Phone, Mail, MapPin, Package, Users, Eye } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ImageUpload from '../components/ImageUpload';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
}

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
  user_id: number;
  owner_name: string;
  products_count: number;
  avg_price: number;
}

const ShopDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      fetchShop();
      fetchProducts();
    }
  }, [id]);

  const fetchShop = async () => {
    try {
      const response = await axios.get(`/api/shops/${id}`);
      setShop(response.data.shop);
    } catch (error) {
      console.error('Ошибка загрузки магазина:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      console.log('Загружаем товары для магазина ID:', id);
      const response = await axios.get(`/api/shops/${id}/products`);
      console.log('Получены товары:', response.data.products);
      setProducts(response.data.products);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    } finally {
      setLoading(false);
    }
  };

  const isOwner = user && shop && user.id === shop.user_id;

  // Показываем только активные товары для всех пользователей
  const activeProducts = products.filter(product => product.is_active);
  
  console.log('Все товары:', products);
  console.log('Активные товары:', activeProducts);
  console.log('Пользователь:', user);
  console.log('Магазин:', shop);
  console.log('Владелец магазина:', isOwner);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-50 to-primary-50 flex items-center justify-center mobile-optimized">
        <div className="spinner w-8 h-8 sm:w-12 sm:h-12"></div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-50 to-primary-50 flex items-center justify-center mobile-optimized">
        <div className="text-center mobile-padding">
          <Store className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            Магазин не найден
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            Магазин не существует или был удален
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-50 to-primary-50 mobile-optimized">
      {/* Shop Header */}
      <div className="hero">
        <div className="hero-content">
          <div className="glass rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-white/20 w-full max-w-6xl mobile-padding">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6">
                {shop.logo_url ? (
                  <img
                    src={shop.logo_url}
                    alt={shop.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl sm:rounded-2xl object-contain bg-white p-1.5 shadow-lg mx-auto sm:mx-0"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-primary-100 to-primary-100 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg mx-auto sm:mx-0">
                    <Store className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-primary-600" />
                  </div>
                )}
                <div className="text-center sm:text-left">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-2">{shop.name}</h1>
                  <p className="text-sm sm:text-base lg:text-xl text-gray-600 mb-3">{shop.description}</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start space-x-2 sm:space-x-4">
                    <span className="badge badge-info text-xs sm:text-sm">{shop.category}</span>
                    {!!shop.is_verified && (
                      <span className="badge badge-success text-xs sm:text-sm">✓ Проверен</span>
                    )}
                    {!!shop.is_premium && (
                      <span className="badge badge-warning text-xs sm:text-sm">⭐ Премиум</span>
                    )}
                    {isOwner && (
                      <span className="badge badge-purple text-xs sm:text-sm">Мой магазин</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
                {isOwner && (
                  <button
                    onClick={() => setShowAddProduct(true)}
                    className="btn-primary flex items-center space-x-2 w-full sm:w-auto mobile-button"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Добавить товар</span>
                  </button>
                )}
                {isOwner && (
                  <Link
                    to={`/my-shops/${shop.id}`}
                    className="btn-secondary flex items-center space-x-2 w-full sm:w-auto mobile-button"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Управление</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mobile-padding py-6 sm:py-8 lg:py-12">
        {/* Shop Info */}
        <div className="glass rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">О магазине</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-gray-500">Владелец</div>
                    <div className="font-medium text-sm sm:text-base text-gray-900">{shop.owner_name}</div>
                  </div>
                </div>

                {shop.address && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-gray-500">Адрес</div>
                      <div className="font-medium text-sm sm:text-base text-gray-900">{shop.address}</div>
                    </div>
                  </div>
                )}

                {shop.phone && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-gray-500">Телефон</div>
                      <div className="font-medium text-sm sm:text-base text-gray-900">{shop.phone}</div>
                    </div>
                  </div>
                )}

                {shop.email && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-gray-500">Email</div>
                      <div className="font-medium text-sm sm:text-base text-gray-900">{shop.email}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Статистика</h2>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-white rounded-xl p-3 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary-600 mb-1">{shop.products_count}</div>
                  <div className="text-xs sm:text-sm text-gray-500">Товаров</div>
                </div>
                <div className="bg-white rounded-xl p-3 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
                    {shop.avg_price?.toFixed(0) || 0} ₽
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">Средняя цена</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="glass rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
                <Package className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-primary-600" />
                Товары ({(isOwner ? products : activeProducts).length})
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mt-2">
                {isOwner ? 'Управляйте товарами в вашем магазине' : 'Товары этого магазина'}
              </p>
              {isOwner && (
                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                  Всего товаров: {products.length} | Активных: {activeProducts.length}
                </div>
              )}
            </div>
            {isOwner && (
              <button
                onClick={() => setShowAddProduct(true)}
                className="btn-primary flex items-center space-x-2 w-full sm:w-auto mobile-button"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm sm:text-base">Добавить товар</span>
              </button>
            )}
          </div>

          {(isOwner ? products : activeProducts).length === 0 ? (
            <div className="text-center py-8 sm:py-12 lg:py-16">
              <div className="relative inline-block mb-6 sm:mb-8">
                <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-primary-100 to-primary-100 rounded-full flex items-center justify-center">
                  <Package className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-gray-400" />
                </div>
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-gradient-to-br from-yellow-400 to-primary-500 rounded-full animate-pulse-glow"></div>
              </div>
              
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Товары не найдены
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto mobile-padding">
                {isOwner 
                  ? 'Добавьте свой первый товар, чтобы начать продажи' 
                  : 'В этом магазине пока нет активных товаров'
                }
              </p>
              {isOwner && (
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="btn-primary inline-flex items-center space-x-2 mobile-button"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Добавить товар</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {(isOwner ? products : activeProducts).map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <AddProductModal
          shopId={id!}
          onClose={() => setShowAddProduct(false)}
          onProductAdded={(newProduct) => {
            setProducts([newProduct, ...products]);
            setShowAddProduct(false);
          }}
        />
      )}
    </div>
  );
};

// Product Card Component
interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  return (
    <Link
      to={`/product/${product.id}`}
      className="product-card hover-lift animate-scale-in mobile-card"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Product Image */}
      <div className="relative h-32 sm:h-40 lg:h-48 bg-gray-100 rounded-t-xl overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Package className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
          <span className={`badge text-xs sm:text-sm ${product.is_active ? 'badge-success' : 'badge-warning'}`}>
            {product.is_active ? 'Активен' : 'Неактивен'}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4">
        <h3 className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 space-y-1 sm:space-y-0">
          <span>Категория: {product.category}</span>
          <span>Остаток: {product.stock_quantity}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-600">
            {product.price} ₽
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm text-gray-500">Смотреть</span>
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </Link>
  );
};

// Add Product Modal Component
interface AddProductModalProps {
  shopId: string;
  onClose: () => void;
  onProductAdded: (product: Product) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ shopId, onClose, onProductAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock_quantity: '',
    image_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  const categories = [
    'Электроника',
    'Одежда',
    'Продукты',
    'Спорт',
    'Красота',
    'Дом и сад',
    'Авто',
    'Книги',
    'Игрушки',
    'Другое'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`/api/shops/${shopId}/products`, {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity)
      });
      onProductAdded(response.data.product);
      alert('Товар успешно добавлен! Он будет виден всем пользователям.');
    } catch (error: any) {
      console.error('Ошибка добавления товара:', error);
      if (error.response && error.response.data && error.response.data.error) {
        alert('Ошибка: ' + error.response.data.error);
      } else {
        alert('Ошибка при добавлении товара. Попробуйте еще раз.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Preview image
    if (name === 'image_url' && value) {
      setImagePreview(value);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
                         <h3 className="text-2xl font-bold text-gray-900">
               Добавить товар
             </h3>
             <p className="text-sm text-gray-500 mt-1">
               Новый товар будет добавлен в ваш магазин
             </p>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Изображение товара
              </label>
              <ImageUpload
                onImageUpload={(url) => {
                  setFormData({ ...formData, image_url: url });
                  setImagePreview(url);
                }}
                currentImage={formData.image_url}
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название товара *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="input w-full"
                placeholder="Введите название товара"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание *
              </label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="input w-full resize-none"
                placeholder="Подробно опишите товар, его характеристики и преимущества"
              />
            </div>

            {/* Price and Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цена (₽) *
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Количество *
                </label>
                <input
                  type="number"
                  name="stock_quantity"
                  required
                  min="0"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Категория *
              </label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="input w-full"
              >
                <option value="">Выберите категорию</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="spinner w-4 h-4"></div>
                    <span>Добавление...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Добавить товар</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShopDetail;
