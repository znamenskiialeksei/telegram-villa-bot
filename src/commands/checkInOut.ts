// src/commands/checkInOut.ts

import { Context } from 'telegraf';
import { isAdmin } from '../middlewares/auth';
import { MyContext } from '../types'; // Добавляем импорт MyContext

export const checkInOutCommand = async (ctx: MyContext) => { // Изменено на MyContext
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

            if (args.length < 2) {
                ctx.reply('Ошибка: Укажите время заезда и выезда. Пример: /checkInOut 14:00 12:00');
                return;
            }

            const [checkInTime, checkOutTime] = args;

            // Проверяем корректность времени
            const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
            if (!timeRegex.test(checkInTime) || !timeRegex.test(checkOutTime)) {
                ctx.reply('Ошибка: Укажите корректное время в формате HH:MM.');
                return;
            }

            ctx.reply(`Время заезда: ${checkInTime}, время выезда: ${checkOutTime}.`);
            // Здесь можно добавить логику для сохранения времени заезда и выезда в базу данных
        } else {
            ctx.reply('Ошибка: сообщение не содержит текст.');
        }
    } catch (error) {
        console.error('Ошибка при выполнении команды checkInOut:', error);
        ctx.reply('Произошла ошибка при настройке времени заезда и выезда. Попробуйте позже.');
    }
};