import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, LogOut, Settings, Store, Package, MessageCircle, Home, ShoppingBag, MapPin, Plus, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Прячем нижнюю навигацию в диалоге и на страницах входа/регистрации
  const isConversation = location.pathname.startsWith('/chat/');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const hideBottomNav = isConversation || isAuthPage;

  const navigation = [
    { name: 'Главная', href: '/', icon: Home },
    { name: 'Магазины', href: '/shops', icon: Store },
    { name: 'Товары', href: '/products', icon: Package },
    { name: 'Сообщения', href: '/chats', icon: MessageCircle },
    ...(user?.role === 'admin' ? [{ name: 'Админ', href: '/admin', icon: Settings }] : [])
  ];

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  const getUserInitials = () => {
    if (!user?.name) return '?';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen flex flex-col bg-ink-50">
      {/* Header */}
      <header className="bg-white border-b border-ink-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top row: logo + search + user */}
          <div className="flex items-center gap-3 sm:gap-4 h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 bg-ink-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-extrabold text-lg">V</span>
              </div>
              <span className="text-xl font-extrabold text-ink-900 hidden sm:block tracking-tight">
                Va<span className="text-primary-500">l</span>ue
              </span>
            </Link>

            {/* City selector */}
            <button className="hidden lg:flex items-center gap-1 text-sm text-ink-600 hover:text-primary-600 transition-colors shrink-0">
              <MapPin className="w-4 h-4" />
              <span>Москва</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Spacer на мобиле (поиск скрыт) */}
            <div className="flex-1 md:hidden" />

            {/* Search — только на десктопе */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl min-w-0">
              <div className="relative flex">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Поиск товаров"
                  className="w-full pl-10 pr-3 xs:pr-24 py-2.5 bg-ink-50 border border-ink-200 rounded-lg text-sm text-ink-900 placeholder:text-ink-400 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="hidden xs:block absolute right-1 top-1 bottom-1 px-4 bg-primary-500 text-white text-sm font-semibold rounded-md hover:bg-primary-600 transition-colors"
                >
                  Найти
                </button>
              </div>
            </form>

            {/* User area */}
            <div className="flex items-center gap-2 shrink-0">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-ink-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">{getUserInitials()}</span>
                    </div>
                    <span className="hidden md:block text-sm font-medium text-ink-800 max-w-[120px] truncate">{user.name}</span>
                  </button>

                  {isUserMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-card-hover border border-ink-200 py-1.5 z-50">
                        <div className="px-4 py-3 border-b border-ink-100">
                          <p className="text-sm font-semibold text-ink-900 truncate">{user.name}</p>
                          <p className="text-xs text-ink-500 truncate">{user.email}</p>
                        </div>

                        <Link to="/profile" className="flex items-center px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50" onClick={() => setIsUserMenuOpen(false)}>
                          <User className="w-4 h-4 mr-3 text-ink-400" />
                          Профиль
                        </Link>
                        <Link to="/my-orders" className="flex items-center px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50" onClick={() => setIsUserMenuOpen(false)}>
                          <ShoppingBag className="w-4 h-4 mr-3 text-ink-400" />
                          Мои заказы
                        </Link>

                        {user.role === 'seller' && (
                          <>
                            <Link to="/my-shops" className="flex items-center px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50" onClick={() => setIsUserMenuOpen(false)}>
                              <Store className="w-4 h-4 mr-3 text-ink-400" />
                              Мои магазины
                            </Link>
                            <Link to="/create-shop" className="flex items-center px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50" onClick={() => setIsUserMenuOpen(false)}>
                              <Plus className="w-4 h-4 mr-3 text-ink-400" />
                              Создать магазин
                            </Link>
                          </>
                        )}

                        <div className="border-t border-ink-100 mt-1.5 pt-1.5">
                          <button onClick={handleLogout} className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                            <LogOut className="w-4 h-4 mr-3" />
                            Выйти
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="hidden sm:inline-flex text-sm font-medium text-ink-700 hover:text-primary-600 px-3 py-2 transition-colors">
                    Войти
                  </Link>
                  <Link to="/register" className="btn-primary text-sm">
                    Регистрация
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Bottom row: category nav (desktop) */}
          <nav className="hidden md:flex items-center gap-1 h-11 -mt-px">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 ${hideBottomNav ? '' : 'pb-28 md:pb-0'}`}>
        {children}
      </main>

      {/* Mobile bottom navigation — плавающая чёрная пилюля (стиль DROPS) */}
      <nav className={`${hideBottomNav ? 'hidden' : 'md:hidden'} fixed bottom-4 left-1/2 -translate-x-1/2 z-50`}>
        <div className="flex items-center gap-1 bg-ink-900 rounded-full px-2 py-2 shadow-xl shadow-black/25">
          {[
            { name: 'Главная', href: '/', icon: Home },
            { name: 'Поиск', href: '/search', icon: Search },
            { name: 'Чаты', href: '/chats', icon: MessageCircle },
            { name: user ? 'Профиль' : 'Войти', href: user ? '/profile' : '/login', icon: User },
          ].map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                aria-label={item.name}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isActive ? 'bg-primary-500 text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <footer className="hidden md:block bg-ink-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-extrabold text-lg">V</span>
                </div>
                <span className="text-xl font-extrabold">Value</span>
              </div>
              <p className="text-ink-400 mb-6 max-w-md text-sm leading-relaxed">
                Маркетплейс местного бизнеса. Безопасные сделки, проверенные продавцы, честные цены — рядом с вами.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-4 text-ink-200">Разделы</h3>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/products" className="text-ink-400 hover:text-primary-400 transition-colors">Товары</Link></li>
                <li><Link to="/shops" className="text-ink-400 hover:text-primary-400 transition-colors">Магазины</Link></li>
                <li><Link to="/register" className="text-ink-400 hover:text-primary-400 transition-colors">Регистрация</Link></li>
                <li><Link to="/login" className="text-ink-400 hover:text-primary-400 transition-colors">Вход</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-4 text-ink-200">Поддержка</h3>
              <ul className="space-y-2.5 text-sm">
                <li><button className="text-ink-400 hover:text-primary-400 transition-colors text-left">Помощь</button></li>
                <li><button className="text-ink-400 hover:text-primary-400 transition-colors text-left">Контакты</button></li>
                <li><button className="text-ink-400 hover:text-primary-400 transition-colors text-left">О нас</button></li>
                <li><button className="text-ink-400 hover:text-primary-400 transition-colors text-left">Условия использования</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-ink-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-ink-500 text-sm">© 2024 Value Marketplace. Все права защищены.</p>
            <div className="flex gap-6 text-sm">
              <button className="text-ink-500 hover:text-primary-400 transition-colors">Политика конфиденциальности</button>
              <button className="text-ink-500 hover:text-primary-400 transition-colors">Условия использования</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
