import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, ArrowLeft, Clock, User } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Chat {
  id: number;
  buyer_id: number;
  seller_id: number;
  product_id?: number;
  shop_id?: number;
  last_message_at: string;
  created_at: string;
  product_name?: string;
  product_image?: string;
  shop_name?: string;
  shop_logo?: string;
  buyer_name: string;
  seller_name: string;
  unread_count: number;
  last_message?: string;
}

const Chats: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/chats');
      setChats(response.data.chats);
    } catch (error) {
      console.error('Ошибка загрузки чатов:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Только что';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}ч назад`;
    } else {
      return date.toLocaleDateString('ru-RU');
    }
  };

  const getOtherUserName = (chat: Chat) => {
    if (user?.id === chat.buyer_id) {
      return chat.seller_name;
    } else {
      return chat.buyer_name;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-50 to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Войдите в систему
          </h3>
          <p className="text-gray-600 mb-4">
            Для просмотра чатов необходимо войти в систему
          </p>
          <Link to="/login" className="btn-primary">
            Войти
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-50 to-primary-50 flex items-center justify-center">
        <div className="spinner w-12 h-12"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-50 to-primary-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Сообщения</h1>
              <p className="text-gray-600">Ваши чаты с продавцами и покупателями</p>
            </div>
          </div>
        </div>

        {/* Chats List */}
        {chats.length === 0 ? (
          <div className="text-center py-16">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              У вас пока нет чатов
            </h3>
            <p className="text-gray-600 mb-6">
              Начните общение с продавцами, написав им сообщение о товаре
            </p>
            <Link to="/products" className="btn-primary">
              Перейти к товарам
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => navigate(`/chat/${chat.id}`)}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer p-6"
              >
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {getOtherUserName(chat)}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {formatTime(chat.last_message_at)}
                        </span>
                      </div>
                    </div>

                    {/* Product/Shop Info */}
                    {(chat.product_name || chat.shop_name) && (
                      <div className="flex items-center space-x-2 mb-2">
                        {chat.product_image && (
                          <img
                            src={chat.product_image}
                            alt={chat.product_name}
                            className="w-6 h-6 rounded object-cover"
                          />
                        )}
                        <span className="text-sm text-gray-600">
                          {chat.product_name || chat.shop_name}
                        </span>
                      </div>
                    )}

                    {/* Last Message */}
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600 truncate flex-1">
                        {chat.last_message || 'Нет сообщений'}
                      </p>
                      {chat.unread_count > 0 && (
                        <div className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {chat.unread_count}
                        </div>
                      )}
                    </div>
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

export default Chats;

