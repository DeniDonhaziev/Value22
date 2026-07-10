import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, User, Store, Clock } from 'lucide-react';
// import { useAuth } from '../contexts/AuthContext'; // Пока не используется

interface ChatPreview {
  id: number;
  participantName: string;
  participantRole: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

const Messages: React.FC = () => {
  // const { user } = useAuth(); // Пока не используется
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Имитация загрузки чатов
    setTimeout(() => {
      setChats([
        {
          id: 1,
          participantName: 'Электроника Плюс',
          participantRole: 'seller',
          lastMessage: 'Да, есть в наличии! Цена 89990 рублей. Можете приехать сегодня?',
          timestamp: '10:35',
          unreadCount: 1
        },
        {
          id: 2,
          participantName: 'Модная Одежда',
          participantRole: 'seller',
          lastMessage: 'Джинсы Levi\'s есть в размере 32/32. Цена 4500 рублей.',
          timestamp: 'Вчера',
          unreadCount: 0
        },
        {
          id: 3,
          participantName: 'Спорт Мастер',
          participantRole: 'seller',
          lastMessage: 'Кроссовки Nike Air Max привезем завтра. Предзаказ?',
          timestamp: '2 дня назад',
          unreadCount: 0
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Сообщения</h1>
          </div>
          <p className="text-gray-600">
            Общайтесь с продавцами и покупателями в реальном времени
          </p>
        </div>

        {/* Chat List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {chats.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {chats.map((chat) => (
                <Link
                  key={chat.id}
                  to={`/chat/${chat.id}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4 p-6">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      {chat.participantRole === 'seller' ? (
                        <Store className="w-6 h-6 text-primary-600" />
                      ) : (
                        <User className="w-6 h-6 text-primary-600" />
                      )}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {chat.participantName}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{chat.timestamp}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {chat.lastMessage}
                      </p>
                    </div>

                    {/* Unread Badge */}
                    {chat.unreadCount > 0 && (
                      <div className="w-6 h-6 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                        {chat.unreadCount}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Сообщений пока нет</h3>
              <p className="text-gray-500 mb-6">
                Начните общение с продавцами, чтобы обсудить товары
              </p>
              <Link
                to="/shops"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
              >
                Найти магазины
              </Link>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-8 bg-primary-50 rounded-2xl p-6">
          <h4 className="font-semibold text-primary-900 mb-3">💡 Советы по общению:</h4>
          <ul className="text-primary-800 space-y-2 text-sm">
            <li>• Задавайте конкретные вопросы о товарах</li>
            <li>• Уточняйте наличие и цены</li>
            <li>• Договаривайтесь о времени встречи</li>
            <li>• Будьте вежливы и уважительны</li>
            <li>• Используйте функцию звонков для быстрого решения вопросов</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Messages;
