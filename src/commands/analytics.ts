// src/commands/analytics.ts

import { Context } from 'telegraf';
import { isAdmin } from '../middlewares/auth';
import { MyContext } from '../types';
import { getAllBookings } from '../utils/firestore'; // Импортируем для получения реальных бронирований

export const analyticsCommand = async (ctx: MyContext) => {
    try {
        // Проверяем, является ли пользователь администратором
        if (!(await isAdmin(ctx))) {
            ctx.reply('Ошибка: У вас нет прав для выполнения этой команды.');
            return;
        }

        // Получаем все заявки для аналитики
        const allBookings = await getAllBookings();

        const totalBookings = allBookings.length;
        const pendingBookings = allBookings.filter(b => b.status === 'pending').length;
        const acceptedBookings = allBookings.filter(b => b.status === 'accepted').length;
        const rejectedBookings = allBookings.filter(b => b.status === 'rejected').length;
        const completedBookings = allBookings.filter(b => b.status === 'completed').length;
        const cancelledBookings = allBookings.filter(b => b.status === 'cancelled').length;


        ctx.reply(
            `*Аналитика бронирований:*\n` +
            `\n- Всего бронирований: ${totalBookings}` +
            `\n- В ожидании: ${pendingBookings}` +
            `\n- Принятые: ${acceptedBookings}` +
            `\n- Отклонённые: ${rejectedBookings}` +
            `\n- Завершённые: ${completedBookings}` +
            `\n- Отмененные: ${cancelledBookings}`,
            { parse_mode: 'Markdown' }
        );
    } catch (error) {
        console.error('Ошибка при выполнении команды analytics:', error);
        ctx.reply('Произошла ошибка при получении аналитики. Попробуйте позже.');
    }
};
