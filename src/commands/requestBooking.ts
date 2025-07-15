// src/commands/requestBooking.ts (CORRECTED VERSION)

import { Context } from 'telegraf';
import { createBookingRequest } from '../services/requestService'; // FIX: Changed '=>' to 'from'
import { MyContext, Booking } from '../types';
import { getVillaById } from '../utils/firestore'; // Import for getVillaById

export const requestBookingCommand = async (ctx: MyContext) => {
    try {
        if (!ctx.message || !('text' in ctx.message)) {
            ctx.reply('Ошибка: сообщение не содержит текст.');
            return;
        }

        const messageText = ctx.message.text;
        const args = messageText.split(' ').slice(1);

        if (args.length < 3) {
            ctx.reply('Ошибка: Укажите ID виллы, даты заезда и выезда. Пример: /requestBooking villa_123 2025-08-01 2025-08-07');
            return;
        }

        const [villaId, checkIn, checkOut] = args;

        // Basic date validation
        if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) {
            ctx.reply('Ошибка: Укажите даты в формате ГГГГ-ММ-ДД.');
            return;
        }
        if (new Date(checkIn) >= new Date(checkOut)) {
            ctx.reply('Ошибка: Дата выезда должна быть позже даты заезда.');
            return;
        }

        const userId = ctx.from?.id;
        const userName = ctx.from?.first_name || ctx.from?.last_name || 'Неизвестный';
        const userUsername = ctx.from?.username || '';

        if (!userId) {
            ctx.reply('Не удалось определить ваш ID пользователя.');
            return;
        }

        // Get villa name for the Booking object
        const villa = await getVillaById(villaId);
        const villaName = villa ? villa.name : 'Неизвестная вилла';

        const bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'> = {
            userId: userId,
            userName: userName,
            userUsername: userUsername,
            villaId: villaId,
            villaName: villaName,
            checkIn: checkIn,
            checkOut: checkOut,
            guests: 1, // Placeholder
            comments: "" // Placeholder
        };

        try {
            const newBooking = await createBookingRequest(bookingData);
            ctx.reply(`✅ Ваша заявка на бронирование виллы с ID ${villaId} на даты с ${checkIn} по ${checkOut} принята! Номер заявки: \`${newBooking.id}\`.`);
        } catch (error) {
            console.error('Ошибка при создании заявки на бронирование:', error);
            ctx.reply('Произошла ошибка при создании вашей заявки. Пожалуйста, попробуйте позже.');
        }

    } catch (error) {
        console.error('Ошибка при выполнении команды requestBooking:', error);
        ctx.reply('Произошла ошибка при запросе бронирования. Попробуйте позже.');
    }
};