# Telegram-чат на GREEN-API

Текстовый чат в оболочке Telegram Web. Сообщения уходят и приходят через [GREEN-API](https://green-api.com/telegram), без своего бэкенда.

Публичный адрес: `https://portfolio.am-projects.ru/telegram-chat`

Локальная разработка — **Vite** на порту **4002** (`PORT` в `.env`). Docker и прод — **nginx** в контейнере (80 → хост **4002**).

## Локально

```bash
npm install
npm run dev:web
```

Открыть `http://localhost:4002/telegram-chat/`.

На экране входа указать `idInstance` и `apiTokenInstance`. Хост API задан как `https://4100.api.green-api.com`.
Новый чат создаётся по номеру телефона.

## Docker

```bash
docker compose -f docker-compose.dev.yml up --build
```

После сборки: `http://localhost:4002/telegram-chat/`.

## Кабинет GREEN-API

Чтобы ответы и галочки доходили в чат:

- поле webhook URL должно быть пустым;
- включены входящие сообщения;
- включены статусы исходящих (`outgoingWebhook`, `outgoingAPIMessageWebhook`).

`failed` и `noAccount` сервис присылает в любом случае.
