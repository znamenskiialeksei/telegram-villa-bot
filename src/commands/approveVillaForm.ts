// src/commands/approveVillaForm.ts

import { Context } from 'telegraf';
import { isAdmin } from '../middlewares/auth';
import { MyContext } from '../types';
import { getVillaById, updateVilla } from '../utils/firestore';

export const approveVillaFormCommand = async (ctx: MyContext) => {
    try {
        if (!(await isAdmin(ctx))) {
            ctx.reply('Ошибка: У вас нет прав для выполнения этой команды.');
            return;
        }

        if (ctx.message && 'text' in ctx.message) {
            const messageParts = ctx.message.text.split(' ');

            if (messageParts.length < 2) {
                ctx.reply('Ошибка: Укажите ID анкеты виллы. Пример: /approveVillaForm villa_123');
                return;
            }

            const villaId = messageParts[1];

            const villa = await getVillaById(villaId);
            if (!villa) {
                ctx.reply(`Ошибка: Вилла с ID ${villaId} не найдена.`);
                return;
            }

            await updateVilla(villaId, { isApproved: true, updatedAt: Date.now() });

            ctx.reply(`Анкета виллы с ID ${villaId} успешно утверждена. Спасибо за проверку!`);
        } else {
            ctx.reply('Ошибка: сообщение не содержит текст.');
        }
    } catch (error) {
        console.error('Ошибка при выполнении команды approveVillaForm:', error);
        ctx.reply('Произошла ошибка при утверждении анкеты. Попробуйте позже.');
    }
};