// src/commands/deleteVilla.ts

import { Context, NarrowedContext } from 'telegraf';
import { Message, Update } from 'telegraf/types';
import { isAdmin } from '../middlewares/auth';
import { deleteVilla } from '../utils/firestore'; // Добавляем импорт deleteVilla

export const deleteVillaCommand = async (
    ctx: NarrowedContext<Context, Update.MessageUpdate<Message.TextMessage>> // Использовать MyContext, если возможно
) => {
    try {
        // Проверяем, является ли пользователь администратором
        if (!(await isAdmin(ctx))) {
            ctx.reply('Ошибка: У вас нет прав для выполнения этой команды.');
            return;
        }

        // Убедимся, что это текстовое сообщение
        if (!ctx.message || !('text' in ctx.message)) {
            ctx.reply('Ошибка: Сообщение не содержит текст.');
            return;
        }

        const villaId = ctx.message.text.split(' ')[1]; // Ожидается команда вида /deleteVilla villaId
        if (!villaId) {
            ctx.reply('Пожалуйста, укажите ID виллы для удаления. Например: /deleteVilla villa_123');
            return;
        }

        try {
            await deleteVilla(villaId); // Используем функцию удаления из firestore
            ctx.reply(`Вилла с ID ${villaId} успешно удалена.`);
        } catch (dbError) {
            console.error(`Ошибка удаления виллы ${villaId} из Firestore:`, dbError);
            ctx.reply(`Произошла ошибка при удалении виллы с ID ${villaId}. Возможно, она не найдена.`);
        }

    } catch (error) {
        console.error('Ошибка при выполнении команды deleteVilla:', error);
        ctx.reply('Произошла ошибка при удалении виллы. Попробуйте позже.');
    }
};
