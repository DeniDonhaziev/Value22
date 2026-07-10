import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Phone, Mail, MapPin, Store, Calendar, Package, ShieldCheck, Award, MessageCircle, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import SwipeToAction from '../components/SwipeToAction';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  stock_quantity: number;
  contact_phone?: string;
  is_active: boolean;
  created_at: string;
  shop: {
    id: number;
    user_id: number;
    name: string;
    description: string;
    logo_url?: string;
    is_verified: boolean;
    is_premium: boolean;
    owner_name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [creatingChat, setCreatingChat] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data.product);
    } catch (error) {
      console.error('Ошибка загрузки товара:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => setShowContact(true);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product?.name, text: product?.description, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Ссылка скопирована в буфер обмена!');
    }
  };

  const handleStartChat = () => {
    if (!user) {
      alert('Войдите в систему, чтобы начать чат');
      return;
    }
    setShowChatModal(true);
  };

  const handleCreateChat = async () => {
    if (!user || !product || !chatMessage.trim()) return;

    setCreatingChat(true);
    try {
      const chatData = {
        seller_id: product.shop.user_id || product.shop.id,
        product_id: product.id,
        shop_id: product.shop.id,
        initial_message: chatMessage.trim()
      };

      const response = await axios.post('/api/chats', chatData);

      if (response.data.chat) {
        alert('Чат создан! Переходим к сообщениям...');
        navigate(`/chat/${response.data.chat.id}`);
      }
    } catch (error: any) {
      console.error('Ошибка создания чата:', error);
      if (error.response?.data?.chat_id) {
        alert('Чат уже существует! Переходим к сообщениям...');
        navigate(`/chat/${error.response.data.chat_id}`);
      } else {
        alert('Ошибка создания чата: ' + (error.response?.data?.error || 'Неизвестная ошибка'));
      }
    } finally {
      setCreatingChat(false);
      setShowChatModal(false);
      setChatMessage('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="spinner w-12 h-12"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-ink-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-ink-900 mb-2">Товар не найден</h3>
          <p className="text-ink-500 mb-4">Товар не существует или был удалён</p>
          <Link to="/" className="btn-primary">Вернуться в каталог</Link>
        </div>
      </div>
    );
  }

  const inStock = product.stock_quantity > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Top controls */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-full bg-ink-50 hover:bg-ink-100 flex items-center justify-center transition-colors"
          aria-label="Назад"
        >
          <ArrowLeft className="w-5 h-5 text-ink-900" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="w-11 h-11 rounded-full bg-ink-50 hover:bg-ink-100 flex items-center justify-center transition-colors"
            aria-label="Поделиться"
          >
            <Share2 className="w-5 h-5 text-ink-900" />
          </button>
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
              isFavorite ? 'bg-red-50 text-red-600' : 'bg-ink-50 hover:bg-ink-100 text-ink-900'
            }`}
            aria-label="В избранное"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
        {/* Hero image */}
        <div className="relative rounded-3xl bg-ink-50 overflow-hidden flex items-center justify-center min-h-[320px] sm:min-h-[440px]">
          {/* watermark */}
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="text-[9rem] sm:text-[14rem] font-black text-ink-100 leading-none">V</span>
          </span>
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="relative z-10 max-h-[300px] sm:max-h-[420px] w-full object-contain drop-shadow-2xl"
            />
          ) : (
            <Package className="relative z-10 w-24 h-24 text-ink-300" />
          )}
          {!!product.shop?.is_premium && (
            <span className="absolute top-4 left-4 z-20 bg-ink-900 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              Премиум
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <span className="badge badge-info self-start mb-3">{product.category}</span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-ink-900 mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-5 text-sm text-ink-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(product.created_at).toLocaleDateString('ru-RU')}
            </span>
            <span>·</span>
            <span>ID #{product.id}</span>
          </div>

          {/* Price */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-ink-900 leading-none">
                {product.price ? `${new Intl.NumberFormat('ru-RU').format(product.price)} ₽` : 'Цена уточняется'}
              </div>
              <div className="text-sm text-ink-400 mt-2">
                {inStock ? `${product.stock_quantity} в наличии` : 'Нет в наличии'}
              </div>
            </div>
            <span className={`badge ${inStock ? 'badge-success' : 'badge-warning'}`}>
              {inStock ? 'В наличии' : 'Нет в наличии'}
            </span>
          </div>

          {/* Primary action — свайп вправо, чтобы купить */}
          <div className="mb-3">
            <SwipeToAction
              label="Свайп вправо — купить"
              completedLabel="Открываем чат…"
              onComplete={handleStartChat}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button onClick={handleStartChat} className="btn-primary flex-1 py-3.5">
              <MessageCircle className="w-5 h-5 mr-2" /> Написать
            </button>
            <button onClick={handleContact} className="btn-secondary flex-1 py-3.5">
              <Phone className="w-5 h-5 mr-2" /> Контакты
            </button>
          </div>

          {/* Description */}
          <div className="border-t border-ink-100 pt-5 mb-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-ink-400 mb-2">Описание</h3>
            <p className="text-ink-700 leading-relaxed whitespace-pre-wrap">
              {product.description || 'Описание не указано'}
            </p>
          </div>

          {/* Shop */}
          <div className="border-t border-ink-100 pt-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-ink-400">Магазин</h3>
              {product.shop?.id && (
                <Link to={`/shops/${product.shop.id}`} className="text-sm font-semibold text-ink-900 hover:underline">
                  Все товары
                </Link>
              )}
            </div>
            <div className="flex items-center gap-4">
              {product.shop.logo_url ? (
                <img src={product.shop.logo_url} alt={product.shop.name} className="w-14 h-14 rounded-2xl object-cover" />
              ) : (
                <div className="w-14 h-14 bg-ink-100 rounded-2xl flex items-center justify-center">
                  <Store className="w-7 h-7 text-ink-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-ink-900 truncate">{product.shop.name}</h4>
                  {!!product.shop?.is_verified && <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />}
                  {!!product.shop?.is_premium && <Award className="w-4 h-4 text-ink-500 shrink-0" />}
                </div>
                <p className="text-sm text-ink-500 truncate">{product.shop?.description || 'Описание магазина не указано'}</p>
              </div>
            </div>
            {product.shop?.address && (
              <div className="flex items-center gap-2 text-sm text-ink-500 mt-4">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{product.shop.address}</span>
              </div>
            )}
          </div>

          {/* Contacts (toggle) */}
          {showContact && (
            <div className="border-t border-ink-100 pt-5 mt-5 space-y-3 animate-slide-up">
              <h3 className="text-sm font-bold uppercase tracking-wide text-ink-400 mb-1">Контакты продавца</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-ink-100 rounded-full flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-ink-700" />
                </div>
                <div>
                  <div className="text-xs text-ink-400">Телефон</div>
                  <div className="font-medium text-ink-900">{product.shop?.phone || 'Не указан'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-ink-100 rounded-full flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-ink-700" />
                </div>
                <div>
                  <div className="text-xs text-ink-400">Email</div>
                  <div className="font-medium text-ink-900">{product.shop?.email || 'Не указан'}</div>
                </div>
              </div>
              {product.contact_phone && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-ink-100 rounded-full flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-ink-700" />
                  </div>
                  <div>
                    <div className="text-xs text-ink-400">Контактный телефон товара</div>
                    <div className="font-medium text-ink-900">{product.contact_phone}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-ink-900">Написать продавцу</h3>
              <button onClick={() => setShowChatModal(false)} className="w-9 h-9 rounded-full hover:bg-ink-100 flex items-center justify-center">
                <X className="w-5 h-5 text-ink-500" />
              </button>
            </div>
            <p className="text-sm text-ink-500 mb-3">
              Напишите сообщение продавцу о товаре «{product?.name}»
            </p>
            <textarea
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Здравствуйте! Интересует ваш товар..."
              className="input w-full resize-none mb-4"
              rows={4}
            />
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setShowChatModal(false)} className="btn-secondary">Отмена</button>
              <button onClick={handleCreateChat} disabled={creatingChat || !chatMessage.trim()} className="btn-primary disabled:opacity-50">
                {creatingChat ? (
                  <><div className="spinner w-4 h-4 mr-2"></div> Создание...</>
                ) : (
                  <><MessageCircle className="w-4 h-4 mr-2" /> Отправить</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
