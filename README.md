# Telegram Villa Rental Bot

Этот проект представляет собой Telegram-бота для аренды вилл. Бот позволяет пользователям взаимодействовать с системой аренды через Telegram.

## Установка

1. Клонируйте репозиторий:
   ```bash
   git clone <URL репозитория>
   cd telegram-villa-rental-bot
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

3. Создайте файл `.env` в корне проекта и добавьте переменные окружения:
   ```properties
   BOT_TOKEN=your-telegram-bot-token
   DATABASE_URL=your-database-connection-string
   ADMIN_ID=your-admin-id
   ```

4. Если используется TypeScript, скомпилируйте проект:
   ```bash
   npm run build
   ```

## Использование

1. Запустите бота:
   ```bash
   npm run start
   ```

2. Откройте Telegram и начните взаимодействие с ботом.

## Структура проекта

```
src/
├── config.ts          // Конфигурация проекта
├── index.ts           // Точка входа
├── bot.ts             // Основная логика бота
├── commands/          // Команды бота
│   ├── start.ts       // Команда /start
│   ├── help.ts        // Команда /help
├── utils/             // Утилиты
│   ├── logger.ts      // Логирование
├── middlewares/       // Middleware
│   ├── auth.ts        // Авторизация
├── services/          // Бизнес-логика
│   ├── database.ts    // Работа с базой данных
│   ├── botService.ts  // Логика бота
```

## Зависимости

- `telegraf` — библиотека для работы с Telegram API.
- `typescript` — для разработки на TypeScript.
- `ts-node` — для запуска TypeScript кода.

## Лицензия

Этот проект распространяется под лицензией MIT.
