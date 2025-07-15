// src/commands/done.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ (Без global.userForms)

import { Context } from 'telegraf';
import { MyContext, Booking, Villa } from '../types'; // Импортируем MyContext, Booking, Villa
import { saveVilla } from '../utils/firestore'; // Используем saveVilla для сохранения

export const doneCommand = async (ctx: MyContext) => { // Использовать MyContext, сделать async
    try {
        const userId = ctx.from?.id;
        // Если данные не в global.userForms, а в сессии, то проверка должна быть такой:
        if (!userId || !ctx.session.data || !ctx.session.step || !ctx.session.step.startsWith('add_villa_')) {
            ctx.reply('У вас нет активной анкеты для завершения или данные повреждены. Начните заново с /add_villa.');
            return;
        }

        const userFormData = ctx.session.data; // Используем данные из сессии

        // Проверяем, завершены ли все шаги анкеты (примерная проверка)
        // Логика шагов может быть более сложной
        if (!userFormData.name || !userFormData.location || !userFormData.price || !userFormData.currency || !userFormData.photos || userFormData.photos.length === 0) {
            ctx.reply('Вы ещё не завершили заполнение анкеты или пропустили обязательные поля. Пожалуйста, заполните все шаги.');
            return;
        }

        // Проверяем, заполнены ли обязательные поля
        const missingFields = [];
        if (!userFormData.name) missingFields.push('Название');
        if (!userFormData.location) missingFields.push('Локация');
        if (!userFormData.price) missingFields.push('Цена');
        if (!userFormData.photos || userFormData.photos.length === 0) missingFields.push('Фотографии');

        if (missingFields.length > 0) {
            ctx.reply(`Ошибка: Вы не заполнили следующие поля: ${missingFields.join(', ')}. Пожалуйста, завершите анкету перед отправкой.`);
            return;
        }

        // Подготавливаем данные для сохранения виллы
        const newVilla: Omit<Villa, 'id' | 'createdAt' | 'updatedAt'> = {
            name: userFormData.name,
            location: userFormData.location,
            price: userFormData.price,
            currency: userFormData.currency,
            photos: userFormData.photos,
            description: userFormData.description || '' // Описание может быть пустым
        };

        try {
            const savedVilla = await saveVilla(newVilla); // Сохраняем в Firestore
            ctx.reply(
                `✅ Анкета виллы "${savedVilla.name}" успешно создана и сохранена! ID: \`${savedVilla.id}\`\n\nСпасибо за использование нашего сервиса!`
            );
            // Удаляем данные анкеты из сессии после сохранения
            ctx.session.step = undefined;
            ctx.session.data = undefined;
        } catch (dbError) {
            console.error('Ошибка при сохранении виллы в Firestore:', dbError);
            ctx.reply('Произошла ошибка при сохранении анкеты виллы в базу данных. Попробуйте позже.');
        }

    } catch (error) {
        console.error('Ошибка при выполнении команды done:', error);
        ctx.reply('Произошла ошибка при завершении анкеты. Попробуйте позже.');
    }
};
