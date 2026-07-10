import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Upload, MapPin, Phone, Mail, Clock, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { imageToDataUrl } from '../utils/imageToDataUrl';

interface ShopFormData {
  name: string;
  description: string;
  category: string;
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  logo_url: string;
}

const CreateShop: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [formData, setFormData] = useState<ShopFormData>({
    name: '',
    description: '',
    category: '',
    address: '',
    phone: '',
    email: '',
    workingHours: '',
    logo_url: ''
  });

  const categories = [
    'Электроника',
    'Одежда',
    'Дом и сад',
    'Спорт',
    'Красота',
    'Авто',
    'Книги',
    'Игрушки',
    'Продукты',
    'Другое'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверяем размер файла (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Размер файла не должен превышать 5MB');
      return;
    }

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const dataUrl = await imageToDataUrl(file);
      setFormData(prev => ({
        ...prev,
        logo_url: dataUrl
      }));
      setLogoPreview(dataUrl);
    } catch (error: any) {
      console.error('Ошибка обработки изображения:', error);
      setError('Ошибка при загрузке изображения');
    } finally {
      setLoading(false);
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({
      ...prev,
      logo_url: ''
    }));
    setLogoPreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Валидация
    if (!formData.name.trim()) {
      setError('Название магазина обязательно');
      return;
    }
    if (!formData.description.trim()) {
      setError('Описание магазина обязательно');
      return;
    }
    if (!formData.category) {
      setError('Выберите категорию');
      return;
    }
    if (!formData.address.trim()) {
      setError('Адрес обязателен');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Телефон обязателен');
      return;
    }

    setLoading(true);

    try {
      console.log('CreateShop: создаем магазин с данными =', formData);
      console.log('CreateShop: текущий пользователь =', user);
      
      const response = await axios.post('/api/shops', {
        ...formData,
        email: formData.email || user?.email
      });

      console.log('CreateShop: магазин создан успешно =', response.data);
      alert('Магазин успешно создан!');
      // Перенаправляем на страницу "Мои магазины"
      navigate('/my-shops');
    } catch (error: any) {
      console.error('Ошибка создания магазина:', error);
      console.error('Детали ошибки:', error.response?.data);
      setError(error.response?.data?.error || 'Ошибка при создании магазина');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Требуется авторизация</h2>
          <p className="text-gray-600 mb-6">Для создания магазина необходимо войти в аккаунт</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
            Войти
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Store className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Создать магазин
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Создайте свою витрину и начните продавать товары. Заполните информацию о вашем магазине ниже.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}

            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Основная информация</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название магазина *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Например: Электроника Плюс"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Категория *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание магазина *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Расскажите о вашем магазине, товарах и услугах..."
                  required
                />
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Логотип магазина</h3>
              
              {logoPreview ? (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Логотип магазина"
                    className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Перетащите изображение сюда или нажмите для выбора
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    PNG, JPG до 5MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="logo-upload"
                    onChange={handleLogoUpload}
                    disabled={loading}
                  />
                  <label
                    htmlFor="logo-upload"
                    className="inline-block bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Загрузка...' : 'Выбрать файл'}
                  </label>
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Контактная информация</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Адрес *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="ул. Ленина, 15"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+7 (900) 123-45-67"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="shop@example.com"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Если не указан, будет использован email из профиля
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Часы работы
                  </label>
                  <input
                    type="text"
                    name="workingHours"
                    value={formData.workingHours}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Пн-Пт 9:00-18:00, Сб-Вс 10:00-16:00"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/shops')}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Создание...
                  </>
                ) : (
                  'Создать магазин'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-primary-50 rounded-2xl p-6">
          <h4 className="font-semibold text-primary-900 mb-3">💡 Советы для успешного магазина:</h4>
          <ul className="text-primary-800 space-y-2 text-sm">
            <li>• Добавьте качественные фотографии товаров</li>
            <li>• Напишите подробные описания</li>
            <li>• Укажите актуальные цены</li>
            <li>• Быстро отвечайте на сообщения покупателей</li>
            <li>• Поддерживайте актуальность информации о магазине</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateShop;
