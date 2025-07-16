// src/commands/approveVillaForm.ts

import { Context } from 'telegraf';
import { isAdmin } from '../middlewares/auth';
import { MyContext } from '../types'; // Добавляем импорт MyContext
// Импортируем getVillaById и updateVilla для реальной логики
import { getVillaById, updateVilla } from '../utils/firestore';

export const approveVillaFormCommand = async (ctx: MyContext) => { // Изменено на MyContext
    try {
        // Проверяем, является ли пользователь администратором
        if (!(await isAdmin(ctx))) {
            ctx.reply('Ошибка: У вас нет прав для выполнения этой команды.');
            return;
        }

        // Проверяем, что ctx.message существует и является текстовым сообщением
        if (ctx.message && 'text' in ctx.message) {
            const messageParts = ctx.message.text.split(' ');

            if (messageParts.length < 2) {
                ctx.reply('Ошибка: Укажите ID анкеты виллы. Пример: /approveVillaForm villa_123');
                return;
            }

            const villaId = messageParts[1];

            // Проверка на существование виллы
            const villa = await getVillaById(villaId);
            if (!villa) {
                ctx.reply(`Ошибка: Вилла с ID ${villaId} не найдена.`);
                return;
            }

            // Здесь можно добавить логику для утверждения анкеты в базе данных
            // Например, обновить статус виллы, если у неё есть поле 'status'
            // Или переместить из временной коллекции в основную.
            // Предполагаем, что у виллы есть поле isApproved: boolean
            await updateVilla(villaId, { isApproved: true }); // Пример обновления поля

            ctx.reply(`Анкета виллы с ID ${villaId} успешно утверждена. Спасибо за проверку!`);
        } else {
            ctx.reply('Ошибка: сообщение не содержит текст.');
        }
    } catch (error) {
        console.error('Ошибка при выполнении команды approveVillaForm:', error);
        ctx.reply('Произошла ошибка при утверждении анкеты. Попробуйте позже.');
    }
};