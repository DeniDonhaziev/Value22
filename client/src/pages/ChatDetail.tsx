import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, User } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: number;
  chat_id: number;
  sender_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  sender_name: string;
}

interface Chat {
  id: number;
  buyer_id: number;
  seller_id: number;
  product_id?: number;
  shop_id?: number;
  product_name?: string;
  product_image?: string;
  shop_name?: string;
  buyer_name: string;
  seller_name: string;
}

const ChatDetail: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId && user) {
      fetchMessages();
    }
  }, [chatId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/chats/${chatId}/messages`);
      setMessages(response.data.messages);
      
      // Получаем информацию о чате из первого сообщения или создаем заглушку
      if (response.data.messages.length > 0) {
        const firstMessage = response.data.messages[0];
        // Здесь можно добавить API для получения информации о чате
        setChat({
          id: parseInt(chatId!),
          buyer_id: firstMessage.buyer_id || 0,
          seller_id: firstMessage.seller_id || 0,
          buyer_name: firstMessage.buyer_name || 'Покупатель',
          seller_name: firstMessage.seller_name || 'Продавец'
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;

    setSending(true);
    try {
      const response = await axios.post(`/api/chats/${chatId}/messages`, {
        message: newMessage.trim()
      });
      
      setMessages(prev => [...prev, response.data.message]);
      setNewMessage('');
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    // Добавляем смещение для московского времени (UTC+3)
    const moscowTime = new Date(date.getTime() + (3 * 60 * 60 * 1000));
    return moscowTime.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Europe/Moscow'
    });
  };

  const isMyMessage = (message: Message) => {
    return message.sender_id === user?.id;
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h3 className="text-lg font-bold text-ink-900 mb-2">Войдите в систему</h3>
          <p className="text-ink-500">Для просмотра чата необходимо войти в систему</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="spinner w-12 h-12"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] md:h-[calc(100dvh-7rem)] max-w-3xl mx-auto w-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 sm:p-4 border-b border-ink-100 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 shrink-0 rounded-full bg-ink-50 hover:bg-ink-100 flex items-center justify-center transition-colors"
          aria-label="Назад"
        >
          <ArrowLeft className="w-5 h-5 text-ink-900" />
        </button>
        <div className="w-10 h-10 shrink-0 bg-ink-900 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-ink-900 truncate">
            {chat?.buyer_name || 'Чат'}
          </h2>
          <p className="text-xs sm:text-sm text-ink-500 truncate">
            {chat?.product_name ? `О товаре: ${chat.product_name}` : 'Общий чат'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3 bg-ink-50">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <p className="text-ink-400 text-sm">Начните разговор, отправив первое сообщение</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] sm:max-w-md px-3.5 py-2.5 rounded-2xl ${
                  isMyMessage(message)
                    ? 'bg-primary-500 text-white rounded-br-md'
                    : 'bg-white text-ink-900 border border-ink-100 rounded-bl-md'
                }`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold opacity-90">{message.sender_name}</span>
                  <span className={`text-[10px] ${isMyMessage(message) ? 'text-white/70' : 'text-ink-400'}`}>
                    {formatTime(message.created_at)}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input — закреплён внизу */}
      <div className="shrink-0 p-3 border-t border-ink-100 bg-white pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="flex items-end gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Введите сообщение..."
            className="flex-1 min-w-0 px-4 py-3 bg-ink-50 rounded-2xl resize-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors text-sm"
            rows={1}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          <button
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
            className="w-12 h-12 shrink-0 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Отправить"
          >
            {sending ? <div className="spinner w-5 h-5"></div> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatDetail;
