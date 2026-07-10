# Деплой на Render + Neon Postgres

Приложение развёртывается **одним сервисом**: Express отдаёт и API, и собранный React-сайт.

## 1. База данных — Neon (Postgres)

1. Зарегистрируйтесь на https://neon.tech и создайте проект (регион — ближе к пользователям, напр. EU).
2. Откройте **Connection string** → выберите **Pooled connection**.
3. Скопируйте строку вида:
   `postgresql://user:pass@ep-xxx-pooler.<region>.aws.neon.tech/dbname?sslmode=require`
   Это ваш `DATABASE_URL`. Таблицы создадутся автоматически при первом запуске.

## 2. Код — в GitHub

Если папка `Value2.0` ещё не отдельный git-репозиторий:

```bash
cd Value2.0
git init
git add .
git commit -m "Deploy: Postgres + монолит"
git branch -M main
# создайте пустой репозиторий на github.com, затем:
git remote add origin https://github.com/<вы>/value2.0.git
git push -u origin main
```

`.env`, `node_modules`, `client/build` уже в `.gitignore` — секреты не попадут в репозиторий.

## 3. Сервис на Render

Вариант А (через `render.yaml`, проще):
1. https://render.com → **New** → **Blueprint** → подключите ваш GitHub-репозиторий.
2. Render прочитает `render.yaml`. В переменной **DATABASE_URL** вставьте строку из Neon.
3. **Apply** — Render соберёт и задеплоит.

Вариант Б (вручную):
1. **New** → **Web Service** → выберите репозиторий.
2. Настройки:
   - **Runtime:** Node
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
3. **Environment** → добавьте переменные:
   - `DATABASE_URL` = строка подключения Neon
   - `JWT_SECRET` = длинная случайная строка
   - `NODE_ENV` = `production`
4. **Create Web Service**.

Через пару минут получите публичный адрес вида `https://value-marketplace.onrender.com`.

## Что уже подготовлено в коде

- **База:** SQLite → Postgres (`server/database.js`, драйвер `pg`). SQL в роутах не меняли — работает слой совместимости (`?`→`$n`, `RETURNING id`, `LIKE`→`ILIKE`, SSL для Neon).
- **Монолит:** `server/index.js` в проде отдаёт `client/build` и все не-API маршруты → `index.html` (для React Router).
- **API-адрес фронта:** `client/src/App.tsx` использует относительный путь (один домен). Для раздельного деплоя задайте `REACT_APP_API_URL`.
- **CORS:** тот же origin + `localhost` для разработки (+ `FRONTEND_URL`, если фронт отдельно).

## Важные нюансы

- **Загруженные картинки** (`server/uploads/`) хранятся на диске сервиса. На бесплатном тарифе Render диск **эфемерный** — при передеплое картинки пропадут (данные в Neon сохранятся). Для постоянного хранения подключите Render **Persistent Disk** (примонтировать к `server/uploads`) или облачное хранилище (Cloudinary/S3).
- **Холодный старт:** бесплатный сервис Render «засыпает» без трафика; первый запрос после простоя идёт ~30 сек.
- **Первый деплой** сам создаст таблицы. Данных не будет — зарегистрируйте пользователя и создайте магазин/товары через интерфейс.
- **Локальный запуск с Postgres:** создайте `server/.env` по образцу `server/.env.example`, затем `npm run dev`.
