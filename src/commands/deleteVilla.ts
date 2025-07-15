// src/commands/deleteVilla.ts

import { Context, NarrowedContext } from 'telegraf';
import { Message, Update } from 'telegraf/types';
import { isAdmin } from '../middlewares/auth';
import { deleteVilla } from '../utils/firestore'; // Импортируем deleteVilla из firestore
import { MyContext } from '../types'; // Импортируем MyContext

export const deleteVillaCommand = async (
    ctx: MyContext // Используем MyContext для согласованности
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

        const messageParts = ctx.message.text.split(' ');
        const villaId = messageParts[1]; // Ожидается команда вида /deleteVilla villaId

        if (!villaId) {
            ctx.reply('Пожалуйста, укажите ID виллы для удаления. Например: /deleteVilla villa_123');
            return;
        }

        // Сохраняем ID виллы для подтверждения и переходим в режим ожидания подтверждения
        ctx.session.step = `confirm_delete_villa_action:${villaId}`; // Новый шаг для подтверждения
        await ctx.reply(`Вы уверены, что хотите удалить виллу с ID \`${villaId}\`? Напишите *Да* для подтверждения или /cancel для отмены.`, { parse_mode: 'Markdown' });

    } catch (error) {
        console.error('Ошибка при выполнении команды deleteVilla:', error);
        ctx.reply('Произошла ошибка при подготовке к удалению виллы. Попробуйте позже.');
    }
};
