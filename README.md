# Telegram-чат на GREEN-API

Текстовый чат в оболочке Telegram Web. Сообщения уходят и приходят через [GREEN-API](https://green-api.com/telegram), без своего бэкенда.

Публичный адрес: `https://portfolio.am-projects.ru/telegram-chat`

Приложение слушает порт **4002** (локально, Docker dev/prod и на сервере). Переопределение: переменная `PORT`.

## Локально

```bash
npm install
npm run dev:web
```

Открыть `http://localhost:4002/telegram-chat/`.

На экране входа указать `idInstance` и `apiTokenInstance`. Хост API задан как `https://4100.api.green-api.com`.
Новый чат создаётся по номеру телефона.

## Docker

Образ без nginx: внутри `vite preview`. Префикс `/telegram-chat/` настраивается в nginx сервера.

```bash
docker compose -f docker-compose.dev.yml up --build
```

После сборки: `http://localhost:4002/telegram-chat/`.

На сервере в nginx проксируют `/telegram-chat/` на `http://127.0.0.1:4002` и делают редирект без слэша (иначе Vite не отдаст статику при обновлении страницы):

```nginx
location = /telegram-chat {
  return 301 /telegram-chat/;
}
```

## Кабинет GREEN-API

Чтобы ответы и галочки доходили в чат:

- поле webhook URL должно быть пустым;
- включены входящие сообщения;
- включены статусы исходящих (`outgoingWebhook`, `outgoingAPIMessageWebhook`).

`failed` и `noAccount` сервис присылает в любом случае.
