// src/commands/confirmPayment.ts

import { Context } from 'telegraf';
import { isAdmin } from '../middlewares/auth';
// import { sendNotification } from '../utils/notification'; // УДАЛЯЕМ ЭТОТ ИМПОРТ
import { getBookingById, updateBooking } from '../utils/firestore'; // Обновляем импорт

/**
 * Команда для подтверждения оплаты бронирования.
 * Отправляет уведомление пользователю после подтверждения.
 */
export const confirmPaymentCommand = async (ctx: Context) => { // Возможно, лучше MyContext
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
                ctx.reply('Ошибка: Укажите ID бронирования. Пример: /confirmPayment booking_123');
                return;
            }

            const bookingId = messageParts[1];

            // Проверка на существование бронирования
            const booking = await getBookingById(bookingId);
            if (!booking) {
                ctx.reply(`Ошибка: Бронирование с ID ${bookingId} не найдено.`);
                return;
            }

            if (!ctx.from) {
                console.error('Ошибка: ctx.from отсутствует.');
                ctx.reply('Не удалось подтвердить оплату. Попробуйте позже.');
                return;
            }

            // Обновляем статус бронирования на 'accepted' или 'completed'
            await updateBooking(bookingId, { status: 'accepted' });

            const targetUserId = booking.userId;
            const messageToUser = `✅ Ваше бронирование виллы "${booking.villaName}" (ID: ${booking.id?.substring(0,6)}...) с ${booking.checkIn} по ${booking.checkOut} подтверждено!`;

            try {
                // Отправка уведомления пользователю
                await ctx.telegram.sendMessage(targetUserId, messageToUser); // ПРЯМОЕ ИСПОЛЬЗОВАНИЕ TELEGRAM API
                ctx.reply(`Оплата для бронирования с ID ${bookingId} подтверждена, уведомление отправлено пользователю.`);
            } catch (error) {
                console.error(`Ошибка при отправке уведомления пользователю ${targetUserId}:`, error);
                ctx.reply('Произошла ошибка при отправке уведомления. Возможно, бот не может отправить сообщение этому пользователю.');
            }
        } else {
            ctx.reply('Ошибка: сообщение не содержит текст.');
        }
    } catch (error) {
        console.error('Ошибка при выполнении команды confirmPayment:', error);
        ctx.reply('Произошла ошибка при подтверждении оплаты. Попробуйте позже.');
    }
};