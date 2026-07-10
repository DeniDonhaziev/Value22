import { useState, useEffect, useCallback } from 'react';

// Обратное геокодирование по координатам (бесплатно, без ключа, CORS-friendly)
const reverseGeocode = (lat: number, lon: number): Promise<string> =>
  fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ru`)
    .then((r) => r.json())
    .then((d) => d.city || d.locality || d.principalSubdivision || '')
    .catch(() => '');

// Фолбэк — определение города по IP
const ipCity = (): Promise<string> =>
  fetch('https://ipwho.is/')
    .then((r) => r.json())
    .then((d) => (d && d.success !== false ? d.city || '' : ''))
    .catch(() => '');

// Одна попытка определения на все компоненты сразу (мемоизируем промис)
let inFlight: Promise<string> | null = null;

const runDetect = (): Promise<string> =>
  new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      ipCity().then(resolve);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        reverseGeocode(pos.coords.latitude, pos.coords.longitude).then((c) =>
          c ? resolve(c) : ipCity().then(resolve)
        ),
      () => ipCity().then(resolve), // отказ в доступе — идём по IP
      { timeout: 8000, maximumAge: 3600000 }
    );
  });

const detectCity = (): Promise<string> => {
  if (!inFlight) inFlight = runDetect();
  return inFlight;
};

const STORAGE_KEY = 'userCity';

export function useUserCity() {
  const [city, setCity] = useState<string>(() => localStorage.getItem(STORAGE_KEY) || '');
  const [detecting, setDetecting] = useState(false);

  const apply = useCallback((c: string) => {
    if (c) {
      setCity(c);
      localStorage.setItem(STORAGE_KEY, c);
    }
  }, []);

  const refresh = useCallback(() => {
    setDetecting(true);
    inFlight = null; // форсируем повторное определение
    detectCity()
      .then(apply)
      .finally(() => setDetecting(false));
  }, [apply]);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return; // уже знаем город
    setDetecting(true);
    detectCity()
      .then(apply)
      .finally(() => setDetecting(false));
  }, [apply]);

  return { city: city || (detecting ? 'Определяем…' : 'Выбрать город'), detecting, refresh };
}
