// src/config.ts

import dotenv from 'dotenv';

dotenv.config();

if (!process.env.BOT_TOKEN) {
    throw new Error('Ошибка: Переменная окружения BOT_TOKEN не задана. Укажите её в .env файле.');
}

if (!process.env.ADMIN_ID) {
    throw new Error('Ошибка: Переменная окружения ADMIN_ID не задана. Укажите её в .env файле.');
}

// Новые проверки для Google API (если вы их используете)
if (!process.env.FIREBASE_PROJECT_ID) {
    throw new Error('Ошибка: Переменная окружения FIREBASE_PROJECT_ID не задана в .env.');
}
if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('Ошибка: Переменная окружения GOOGLE_CLIENT_ID не задана в .env.');
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('Ошибка: Переменная окружения GOOGLE_CLIENT_SECRET не задана в .env.'); // <-- ИСПРАВЛЕНИЕ ЗДЕСЬ
}
if (!process.env.GOOGLE_REFRESH_TOKEN) {
    throw new Error('Ошибка: Переменная окружения GOOGLE_REFRESH_TOKEN не задана в .env.');
}

export const BOT_TOKEN = process.env.BOT_TOKEN;
export const ADMIN_ID = parseInt(process.env.ADMIN_ID, 10);
export const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;