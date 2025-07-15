import { Telegraf } from 'telegraf';
import LocalSession from 'telegraf-session-local';

// Функция для подключения локальных сессий
export function setupSession(bot: Telegraf) {
    const localSession = new LocalSession({
        database: 'sessions.json', // Файл для хранения сессий
        storage: LocalSession.storageFileAsync, // Асинхронное хранилище
    });

    bot.use(localSession.middleware());
}
