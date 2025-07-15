// src/commands/manageRequest.ts (UPDATED VERSION)

import { Context } from 'telegraf';
import { getAllRequests } from '../services/requestService'; // Import getAllRequests
import { MyContext, Booking } from '../types'; // Import MyContext and Booking

export const manageRequestCommand = async (ctx: MyContext) => { // Use MyContext
    try {
        // Проверяем, что это команда для администратора (если это команда админа)
        // if (!(await isAdmin(ctx))) {
        //     ctx.reply('Ошибка: У вас нет прав для выполнения этой команды.');
        //     return;
        // }

        ctx.reply('Получение всех заявок на бронирование...');

        const allRequests: Booking[] = await getAllRequests(); // FIX: AWAIT the Promise

        if (allRequests.length === 0) { // FIX: Access length on the awaited array
            ctx.reply('Активных заявок на бронирование нет.');
            return;
        }

        ctx.reply('Список всех заявок:');
        allRequests.forEach((request: Booking) => { // FIX: Access forEach on the awaited array, explicitly type request
            let message = `*Заявка ID:* \`${request.id}\`\n`;
            message += `  Вилла ID: ${request.villaId}\n`;
            message += `  Пользователь ID: ${request.userId}\n`;
            message += `  Заезд: ${request.checkIn}, Выезд: ${request.checkOut}\n`; // FIX: Use checkIn/checkOut
            message += `  Статус: *${request.status.toUpperCase()}*\n`;
            ctx.reply(message, { parse_mode: 'Markdown' });
        });

    } catch (error) {
        console.error('Ошибка при выполнении команды manageRequest:', error);
        ctx.reply('Произошла ошибка при получении списка заявок. Попробуйте позже.');
    }
};