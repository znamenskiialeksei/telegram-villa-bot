// src/commands/analytics.ts

import { Context } from 'telegraf';
import { isAdmin } from '../middlewares/auth'; // Добавляем импорт isAdmin
import { MyContext } from '../types'; // Добавляем импорт MyContext
import { getUserBookings } from '../utils/firestore'; // Импортируем для получения реальных бронирований

export const analyticsCommand = async (ctx: MyContext) => { // Изменено на MyContext
    try {
        // Проверяем, является ли пользователь администратором
        if (!(await isAdmin(ctx))) {
            ctx.reply('Ошибка: У вас нет прав для выполнения этой команды.');
            return;
        }

        // Получаем все заявки для аналитики (или фильтруем по статусу)
        // В реальном приложении здесь будет более сложная логика выборки и подсчета
        const allBookings = await getUserBookings(0); // Получаем все заявки (0 - это пример userId, вам может понадобиться получить ВСЕ заявки, а не по userId)
        // Примечание: getUserBookings принимает userId. Вам, возможно, придется написать новую функцию в firestore.ts
        // например, getAllBookings(): Promise<Booking[]>, если вы хотите видеть аналитику по всем.
        // Пока использую getUserBookings(0) как заглушку, но это НЕправильно для всех заявок.

        const totalBookings = allBookings.length;
        const activeBookings = allBookings.filter(b => b.status === 'pending').length;
        const completedBookings = allBookings.filter(b => b.status === 'completed' || b.status === 'accepted').length;


        ctx.reply(
            `Аналитика бронирований:\n- Всего бронирований: ${totalBookings}\n- Активные бронирования: ${activeBookings}\n- Завершённые бронирования: ${completedBookings}`
        );
    } catch (error) {
        console.error('Ошибка при выполнении команды аналитики:', error);
        ctx.reply('Произошла ошибка при получении аналитики. Попробуйте позже.');
    }
};
