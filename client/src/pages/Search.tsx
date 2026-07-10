import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, X, Clock, TrendingUp, ShoppingBag } from 'lucide-react';
import axios from 'axios';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image_url?: string;
  shop?: { name: string };
}

const categories = ['Электроника', 'Одежда', 'Спорт', 'Красота', 'Дом', 'Авто'];
const RECENT_KEY = 'recentSearches';

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<Product[]>([]);
  const [popular, setPopular] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const formatPrice = (p: number) => new Intl.NumberFormat('ru-RU').format(p);

  // Автофокус + подгрузка "популярного" для пустого состояния
  useEffect(() => {
    inputRef.current?.focus();
    axios
      .get('/api/products?sort=newest')
      .then((r) => setPopular((r.data.products || []).slice(0, 6)))
      .catch(() => {});
  }, []);

  // Живой поиск с дебаунсом
  useEffect(() => {
    const query = q.trim();
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      axios
        .get(`/api/products?search=${encodeURIComponent(query)}`)
        .then((r) => setResults(r.data.products || []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const saveRecent = useCallback((term: string) => {
    const t = term.trim();
    if (!t) return;
    setRecent((prev) => {
      const next = [t, ...prev.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 8);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveRecent(q);
    setSearchParams(q.trim() ? { q: q.trim() } : {}, { replace: true });
  };

  const pick = (term: string) => {
    setQ(term);
    saveRecent(term);
    setSearchParams({ q: term }, { replace: true });
  };

  const clearRecent = () => {
    localStorage.removeItem(RECENT_KEY);
    setRecent([]);
  };

  const ResultRow = ({ p }: { p: Product }) => (
    <Link
      to={`/products/${p.id}`}
      onClick={() => saveRecent(q)}
      className="flex items-center gap-3 p-2 rounded-2xl hover:bg-ink-50 transition-colors"
    >
      <div className="w-14 h-14 rounded-xl bg-ink-50 overflow-hidden flex items-center justify-center shrink-0">
        {p.image_url ? (
          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
        ) : (
          <ShoppingBag className="w-6 h-6 text-ink-300" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-ink-900 text-sm line-clamp-1">{p.name}</h3>
        <p className="text-xs text-ink-400 line-clamp-1">{p.shop?.name} · {p.category}</p>
      </div>
      <div className="font-extrabold text-ink-900 text-sm shrink-0">{formatPrice(p.price)} ₽</div>
    </Link>
  );

  const hasQuery = q.trim().length > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      {/* Search bar */}
      <form onSubmit={onSubmit} className="relative mb-6">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 w-5 h-5 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск товаров..."
          className="w-full pl-12 pr-11 py-3.5 bg-ink-50 rounded-full text-ink-900 placeholder:text-ink-400 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition"
        />
        {hasQuery && (
          <button
            type="button"
            onClick={() => { setQ(''); setSearchParams({}, { replace: true }); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-ink-200 text-ink-600 flex items-center justify-center hover:bg-ink-300 transition-colors"
            aria-label="Очистить"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {hasQuery ? (
        /* ===== Результаты ===== */
        <div>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <div className="w-14 h-14 rounded-xl bg-ink-100 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-ink-100 rounded w-2/3 animate-pulse" />
                    <div className="h-3 bg-ink-100 rounded w-1/3 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16">
              <SearchIcon className="w-12 h-12 text-ink-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-ink-900 mb-1">Ничего не найдено</h3>
              <p className="text-ink-500 text-sm">По запросу «{q}» товаров нет</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-ink-400 mb-2 px-2">Найдено: {results.length}</p>
              <div className="space-y-1">
                {results.map((p) => <ResultRow key={p.id} p={p} />)}
              </div>
            </>
          )}
        </div>
      ) : (
        /* ===== Пустое состояние ===== */
        <div className="space-y-8">
          {/* Recent */}
          {recent.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold uppercase tracking-wide text-ink-400">Недавние запросы</h2>
                <button onClick={clearRecent} className="text-xs font-medium text-primary-600 hover:text-primary-700">
                  Очистить
                </button>
              </div>
              <div className="flex flex-col">
                {recent.map((term) => (
                  <button
                    key={term}
                    onClick={() => pick(term)}
                    className="flex items-center gap-3 py-2.5 text-left hover:bg-ink-50 rounded-xl px-2 -mx-2 transition-colors"
                  >
                    <Clock className="w-4 h-4 text-ink-400 shrink-0" />
                    <span className="text-ink-800 text-sm truncate">{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-400 mb-3">Категории</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Link
                  key={c}
                  to={`/products?category=${encodeURIComponent(c)}`}
                  className="px-4 py-2 rounded-full bg-ink-50 text-ink-800 text-sm font-medium hover:bg-primary-50 hover:text-primary-700 transition-colors"
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>

          {/* Popular */}
          {popular.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-primary-500" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-ink-400">Популярное</h2>
              </div>
              <div className="space-y-1">
                {popular.map((p) => <ResultRow key={p.id} p={p} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
