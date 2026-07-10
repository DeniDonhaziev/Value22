import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, ArrowRight, ShoppingBag, Shield, Zap, Star,
  TrendingUp, Users, Award, Smartphone, Shirt, Dumbbell, Sparkles, Home as HomeIcon, Car
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
  };

  const categories = [
    { name: 'Электроника', icon: Smartphone, tint: 'bg-primary-50 text-primary-600' },
    { name: 'Одежда', icon: Shirt, tint: 'bg-primary-50 text-primary-600' },
    { name: 'Спорт', icon: Dumbbell, tint: 'bg-green-50 text-green-600' },
    { name: 'Красота', icon: Sparkles, tint: 'bg-primary-50 text-primary-600' },
    { name: 'Дом', icon: HomeIcon, tint: 'bg-ink-100 text-ink-600' },
    { name: 'Авто', icon: Car, tint: 'bg-primary-50 text-primary-600' },
  ];

  const stats = [
    { value: '12 000+', label: 'товаров', icon: ShoppingBag },
    { value: '850+', label: 'магазинов', icon: TrendingUp },
    { value: '30 000+', label: 'покупателей', icon: Users },
    { value: '4.8', label: 'средний рейтинг', icon: Star },
  ];

  const features = [
    { title: 'Безопасные сделки', description: 'Защищённые платежи и гарантия качества товаров', icon: Shield },
    { title: 'Быстрая доставка', description: 'Доставка по всему городу в течение дня', icon: Zap },
    { title: 'Проверенные продавцы', description: 'Каждый магазин проходит верификацию', icon: Award },
    { title: 'Поддержка 24/7', description: 'Наша команда всегда готова помочь', icon: Users },
  ];

  const steps = [
    { title: 'Найдите товар', description: 'Через поиск или по категориям', icon: Search },
    { title: 'Свяжитесь с продавцом', description: 'Напишите в чат или позвоните', icon: Users },
    { title: 'Договоритесь', description: 'Обсудите условия и цену', icon: TrendingUp },
    { title: 'Получите покупку', description: 'Встреча или доставка — как удобно', icon: ShoppingBag },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-14 sm:pt-16 sm:pb-16">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
              Покупайте и продавайте<br className="hidden sm:block" /> рядом с домом
            </h1>
            <p className="text-base sm:text-lg text-white/90 mb-7 max-w-xl">
              Тысячи товаров от проверенных местных продавцов. Безопасно, быстро и по честной цене.
            </p>

            {/* Search */}
            <form onSubmit={submitSearch} className="max-w-2xl">
              <div className="relative flex bg-white rounded-xl p-1.5 shadow-lg">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 w-5 h-5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Что вы ищете?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-2 py-3 text-base text-ink-900 placeholder:text-ink-400 focus:outline-none bg-transparent"
                />
                <button type="submit" className="shrink-0 bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors">
                  Найти
                </button>
              </div>
            </form>

            {/* Quick category chips */}
            <div className="flex flex-wrap gap-2 mt-5">
              {categories.slice(0, 6).map((c) => (
                <Link
                  key={c.name}
                  to={`/products?category=${encodeURIComponent(c.name)}`}
                  className="px-3.5 py-1.5 rounded-full bg-white/15 text-white text-sm font-medium hover:bg-white/25 transition-colors backdrop-blur-sm"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-ink-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-extrabold text-ink-900 leading-none">{s.value}</div>
                  <div className="text-sm text-ink-500">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-ink-900">Категории</h2>
              <p className="text-ink-500 mt-1">Выберите, что вам интересно</p>
            </div>
            <Link to="/products" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700">
              Все товары <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="card p-4 flex flex-col items-center text-center gap-3 group"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${category.tint} group-hover:scale-105 transition-transform`}>
                  <category.icon className="w-7 h-7" />
                </div>
                <span className="font-semibold text-ink-800 text-sm">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Seller CTA banner */}
      <section className="pb-10 sm:pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-ink-900 text-white p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">Продавайте на Value</h2>
              <p className="text-ink-300 max-w-lg">Откройте магазин за пару минут и получите доступ к тысячам покупателей вашего города.</p>
            </div>
            <div className="relative z-10 flex gap-3 shrink-0">
              <Link to={user?.role === 'seller' ? '/create-shop' : '/register'} className="btn-primary">
                {user?.role === 'seller' ? 'Создать магазин' : 'Начать продавать'}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
            <div className="absolute -right-10 -top-10 w-56 h-56 bg-primary-500/20 rounded-full blur-3xl" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-10 sm:py-14 bg-white border-t border-ink-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-ink-900">Почему выбирают нас</h2>
            <p className="text-ink-500 mt-1">Заботимся о вашей безопасности и удобстве</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature) => (
              <div key={feature.title} className="card p-6">
                <div className="w-11 h-11 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-ink-900 mb-1.5">{feature.title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-ink-900">Как это работает</h2>
            <p className="text-ink-500 mt-1">Всего 4 шага до покупки</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, index) => (
              <div key={step.title} className="card p-6 relative">
                <div className="absolute top-5 right-5 text-4xl font-extrabold text-ink-100 leading-none select-none">
                  {index + 1}
                </div>
                <div className="w-11 h-11 rounded-lg bg-ink-100 text-ink-700 flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-ink-900 mb-1.5">{step.title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-primary-500 to-primary-500 text-white p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">Готовы начать?</h2>
            <p className="text-white/90 mb-6">Присоединяйтесь к тысячам довольных покупателей</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/products" className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-ink-50 transition-colors">
                Начать покупки <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              {!user && (
                <Link to="/register" className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
                  Зарегистрироваться
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
