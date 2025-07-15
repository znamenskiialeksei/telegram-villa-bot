// src/utils/googleDrive.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ

import { google } from 'googleapis';
// Удалены импорты fs и path, так как файлы не читаются
// import fs from 'fs';
// import path from 'path';

// Импортируем переменные окружения из нашего центрального config.ts
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } from '../config';

// Инициализация OAuth2 клиента
// oAuth2Client должен быть создан один раз и затем использоваться
const oAuth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    // redirect_uri часто требуется при получении refresh_token,
    // но если refresh_token уже получен, он не нужен для каждого запроса.
    // Если вам нужен redirect_uri, его тоже нужно взять из переменных окружения.
    // Здесь оставляем пустым, так как предполагается, что refresh_token уже получен.
    ''
);

// Установка учетных данных (refresh token)
// Это делается ОДИН РАЗ при запуске приложения
if (GOOGLE_REFRESH_TOKEN) {
    oAuth2Client.setCredentials({
        refresh_token: GOOGLE_REFRESH_TOKEN,
    });
} else {
    // Это предупреждение будет выведено, если refresh_token не задан
    // Вам нужно вручную получить refresh_token, пройдя OAuth2.0 авторизацию локально
    // и затем добавить его в переменные окружения Render и в .env
    console.warn('ВНИМАНИЕ: Переменная окружения GOOGLE_REFRESH_TOKEN не задана.');
    console.warn('Если вы впервые разворачиваете бота с Google Drive/Calendar API,');
    console.warn('вам нужно получить refresh_token вручную, пройдя процесс авторизации OAuth 2.0 локально.');
    console.warn('Подробнее о получении refresh_token: https://developers.google.com/identity/protocols/oauth2/web-server#offline');
}

// Экспортируем настроенный Google Drive API клиент
export const drive = google.drive({ version: 'v3', auth: oAuth2Client });

// Если вы также используете Google Calendar API, его можно инициализировать здесь:
// export const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

// Авторизация больше не нужна как отдельная функция для каждого файла,
// так как oAuth2Client уже настроен глобально для drive
// const authorize = async () => { ... }
