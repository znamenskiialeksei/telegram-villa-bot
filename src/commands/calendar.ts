// src/commands/calendar.ts

import { Context } from 'telegraf';
import { isAdmin } from '../middlewares/auth';
import { MyContext } from '../types'; // Добавляем импорт MyContext

export const calendarCommand = async (ctx: MyContext) => { // Изменено на MyContext
    try {
        // Проверяем, является ли пользователь администратором
        if (!(await isAdmin(ctx))) {
            ctx.reply('Ошибка: У вас нет прав для выполнения этой команды.');
            return;
        }

        // Проверяем, что ctx.message существует и является текстовым сообщением
        if (ctx.message && 'text' in ctx.message) {
            const messageText = ctx.message.text || ''; // Использовал messageText для ясности
            const args = messageText.split(' ').slice(1); // Убираем команду из сообщения

            if (args.length === 0) {
                ctx.reply('Ошибка: Укажите действие для календаря. Пример: /calendar view или /calendar update');
                return;
            }

            const action = args[0];
            if (action === 'view') {
                ctx.reply('Просмотр календаря бронирований...');
                // Здесь можно добавить логику для отображения календаря
            } else if (action === 'update') {
                if (args.length < 3) {
                    ctx.reply('Ошибка: Укажите ID виллы и новые данные для обновления. Пример: /calendar update villa_123 2025-06-20 2025-06-25');
                    return;
                }

                const [villaId, startDate, endDate] = args.slice(1);

                // Проверяем корректность дат
                const start = Date.parse(startDate);
                const end = Date.parse(endDate);

                if (isNaN(start) || isNaN(end)) {
                    ctx.reply('Ошибка: Укажите корректные даты в формате YYYY-MM-DD.');
                    return;
                }

                if (start >= end) {
                    ctx.reply('Ошибка: Дата окончания должна быть позже даты начала.');
                    return;
                }

                ctx.reply(`Календарь для виллы с ID ${villaId} успешно обновлён. Новый период: с ${startDate} по ${endDate}.`);
                // Здесь можно добавить логику для обновления календаря в базе данных
            } else {
                ctx.reply('Ошибка: Неизвестное действие. Используйте "view" или "update".');
            }
        } else {
            ctx.reply('Ошибка: сообщение не содержит текст.');
        }
    } catch (error) {
        console.error('Ошибка при выполнении команды calendar:', error);
        ctx.reply('Произошла ошибка при работе с календарём. Попробуйте позже.');
    }
};