// src/config/googleDrive.ts

import { google } from 'googleapis';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } from '../config'; // Импортируем из нашего config.ts
// import fs from 'fs'; // Больше не нужен для чтения файлов
// import path from 'path'; // Больше не нужен для чтения файлов
// import express, { Request, Response } from 'express'; // Если вам нужен веб-сервер для авторизации, его нужно отдельно настроить
// Для работы бота на Render не нужен Express для получения initial code

// Инициализация OAuth2 клиента
const oAuth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    // Если вам нужен redirect_uri, он должен быть в переменных окружения или в конфиге
    // Например, process.env.GOOGLE_REDIRECT_URI
    // Для бота на Render redirect_uri не используется для первоначальной авторизации
    // так как мы используем refresh_token для доступа.
    '' // Оставляем пустым или используем заглушку, если не нужен для получения refresh_token
);

// Установка учетных данных (refresh token)
if (GOOGLE_REFRESH_TOKEN) {
    oAuth2Client.setCredentials({
        refresh_token: GOOGLE_REFRESH_TOKEN,
    });
} else {
    // ВНИМАНИЕ: Если GOOGLE_REFRESH_TOKEN не установлен,
    // вам нужно выполнить процесс авторизации OAuth 2.0 вручную ОДИН РАЗ,
    // чтобы получить refresh_token.
    // Этот код (ниже) не будет работать напрямую на Render без веб-сервера.
    // Вам нужно будет получить refresh_token локально и добавить его в переменные окружения Render.
    console.warn('ВНИМАНИЕ: Переменная окружения GOOGLE_REFRESH_TOKEN не задана.');
    console.warn('Если вы впервые разворачиваете бота с Google Drive/Calendar API,');
    console.warn('вам нужно получить refresh_token вручную, пройдя процесс авторизации OAuth 2.0 локально.');
    console.warn('Подробнее о получении refresh_token: https://developers.google.com/identity/protocols/oauth2/web-server#offline');

    // Пример как получить authUrl для ручной авторизации (это только для однократной локальной генерации refresh_token)
    // const authUrl = oAuth2Client.generateAuthUrl({
    //     access_type: 'offline',
    //     scope: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/calendar'], // Добавьте необходимые scope
    // });
    // console.log('Перейдите по этой ссылке для авторизации (ТОЛЬКО ДЛЯ ПОЛУЧЕНИЯ REFRESH_TOKEN):');
    // console.log(authUrl);
    //
    // Если вы уже получили refresh_token, просто добавьте его в .env и на Render.
}

// Экспортируем настроенный Google Drive API клиент
export const drive = google.drive({ version: 'v3', auth: oAuth2Client });

// Если вы также используете Google Calendar API, его можно инициализировать здесь:
// export const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
