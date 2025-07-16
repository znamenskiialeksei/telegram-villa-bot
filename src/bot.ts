// bot.ts

import { Telegraf, Markup } from 'telegraf';
import { message } from 'telegraf/filters';
import { MyContext, SessionData, Villa, Booking } from './types';
import {
    saveVilla, getVillas, getVillaById, updateVilla, deleteVilla,
    saveBooking, getUserBookings, getBookingById, updateBooking, firestore
} from './utils/firestore';
import { BOT_TOKEN, ADMIN_ID } from './config';

import LocalSession from 'telegraf-session-local';

// Константа для лимита фото
const PHOTO_LIMIT = 5;

// Инициализация бота
const bot = new Telegraf<MyContext>(BOT_TOKEN);

// Настройка сессии
const session = new LocalSession({ database: 'sessions.json' });
bot.use(session.middleware());

// --- Вспомогательные функции ---

// Функция для очистки состояния сессии
const clearSession = (ctx: MyContext) => {
    ctx.session.step = undefined;
    ctx.session.data = undefined;
};

// Функция для завершения шага и очистки сессии
const completeStep = async (ctx: MyContext, message: string) => {
    await ctx.reply(message, Markup.removeKeyboard());
    clearSession(ctx);
};

const handleInputError = (ctx: MyContext, message: string) => ctx.reply(`Ошибка: ${message}`);


// --- Команды бота ---

bot.start(async (ctx) => {
    clearSession(ctx);
    await ctx.reply('Добро пожаловать! Я бот для управления виллами. Используйте /help для списка команд.');
});

bot.help(async (ctx) => {
    clearSession(ctx);
    let helpMessage = 'Вот что я умею:\n';
    helpMessage += '/start - Начать заново и очистить сессию\n';
    helpMessage += '/help - Показать это сообщение\n';
    helpMessage += '/villas - Показать список всех вилл\n';
    helpMessage += '/book - Оставить заявку на бронирование виллы\n';
    helpMessage += '/my_bookings - Показать мои активные заявки\n';

    if (ctx.from?.id === ADMIN_ID) {
        helpMessage += '\n--- Команды для администратора ---\n';
        helpMessage += '/add_villa - Добавить новую виллу\n';
    }
    await ctx.reply(helpMessage);
});

bot.command('add_villa', async (ctx) => {
    if (ctx.from?.id !== ADMIN_ID) {
        return ctx.reply('У вас нет прав для выполнения этой команды.');
    }
    clearSession(ctx);
    ctx.session.step = 'add_villa_name';
    ctx.session.data = { photos: [] };
    await ctx.reply('Введите название виллы:');
});

bot.command('villas', async (ctx) => {
    clearSession(ctx);
    const villas = await getVillas();
    if (villas.length === 0) {
        return ctx.reply('Вилл пока нет.');
    }
    for (const villa of villas) {
        const photo = villa.photos[0] || 'https://via.placeholder.com/300?text=No+Image';
        let message = `*${villa.name}*\n`;
        message += `📍 ${villa.location}\n`;
        message += `💰 ${villa.price} ${villa.currency}\n`;
        message += villa.description ? `📝 ${villa.description}\n` : '';
        message += `ID: \`${villa.id}\`\n`;

        await ctx.replyWithPhoto(photo, {
            caption: message,
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                Markup.button.callback('Забронировать', `book_villa:${villa.id}`)
            ])
        });
    }
});

bot.command('book', async (ctx) => {
    clearSession(ctx);
    const villas = await getVillas();
    if (villas.length === 0) {
        return ctx.reply('К сожалению, вилл для бронирования пока нет.');
    }

    const villaButtons = villas.map(villa =>
        Markup.button.callback(`${villa.name} (${villa.location})`, `select_villa_to_book:${villa.id}`)
    );

    const keyboard = [];
    for (let i = 0; i < villaButtons.length; i += 1) {
        keyboard.push([villaButtons[i]]);
    }

    await ctx.reply('Какую виллу вы хотите забронировать?', Markup.inlineKeyboard(keyboard));
    ctx.session.step = 'select_villa_for_booking';
});

bot.command('my_bookings', async (ctx) => {
    clearSession(ctx);
    const userId = ctx.from?.id;
    if (!userId) {
        return ctx.reply('Не удалось определить ваш ID пользователя.');
    }

    const userBookings = await getUserBookings(userId);

    if (userBookings.length === 0) {
        return ctx.reply('У вас пока нет активных заявок.');
    }

    await ctx.reply('Ваши текущие заявки:');
    for (const booking of userBookings) {
        const villa = await getVillaById(booking.villaId);
        const villaName = villa ? villa.name : 'Неизвестная вилла';

        let message = `*Заявка ID: ${booking.id?.substring(0, 6)}...*\n`;
        message += `🏠 Вилла: ${villaName}\n`;
        message += `🗓️ Заезд: ${booking.checkIn}\n`;
        message += `🗓️ Выезд: ${booking.checkOut}\n`;
        message += `👥 Гостей: ${booking.guests}\n`;
        message += booking.comments ? `💬 Комментарии: ${booking.comments}\n` : '';
        message += `Статус: *${booking.status.toUpperCase()}*\n`;

        await ctx.reply(message, { parse_mode: 'Markdown' });
    }
});

// --- ОБЩИЕ ОБРАБОТЧИКИ ВВОДА (TEXT и PHOTO) ---

// Обработчик Inline-кнопок
bot.on('callback_query', async (ctx) => {
    if (!('data' in ctx.callbackQuery)) {
        return ctx.answerCbQuery('Произошла ошибка при обработке запроса.');
    }
    const query = ctx.callbackQuery.data;

    if (query?.startsWith('book_villa:')) {
        const villaId = query.split(':')[1];
        clearSession(ctx);
        ctx.session.step = 'book_villa_start_date';
        ctx.session.data = { villaId: villaId };
        await ctx.reply(`Вы выбрали виллу. Теперь введите **дату заезда** (ГГГГ-ММ-ДД), например, ${new Date().getFullYear()}-01-15:`, { parse_mode: 'Markdown' });
        return ctx.answerCbQuery();
    }

    if (query?.startsWith('select_villa_to_book:')) {
        const villaId = query.split(':')[1];
        ctx.session.step = 'book_villa_start_date';
        ctx.session.data = { villaId: villaId };
        await ctx.editMessageText(`Вы выбрали виллу. Теперь введите **дату заезда** (ГГГГ-ММ-ДД), например, ${new Date().getFullYear()}-01-15:`, { parse_mode: 'Markdown' });
        return ctx.answerCbQuery();
    }

    return ctx.answerCbQuery();
});

// Обработчик текстовых сообщений
bot.on(message('text'), async (ctx) => {
    const state = ctx.session;
    if (!state || !state.step) return;

    const text = ctx.message.text;
    const { step, data } = state;

    if (step.startsWith('add_villa_')) {
        switch (step) {
            case 'add_villa_name':
                data.name = text; state.step = 'add_villa_location';
                await ctx.reply('Введите локацию:');
                break;
            case 'add_villa_location':
                data.location = text; state.step = 'add_villa_price';
                await ctx.reply('Введите цену:');
                break;
            case 'add_villa_price':
                const price = parseFloat(text);
                if (isNaN(price) || price <= 0) return handleInputError(ctx, 'Укажите корректную цену (число больше 0).');
                data.price = price; state.step = 'add_villa_currency';
                await ctx.reply('Выберите валюту:', Markup.keyboard([['RUB', 'TRY'], ['USD', 'EUR', 'GBP']]).oneTime().resize());
                break;
            case 'add_villa_currency':
                if (!['RUB', 'TRY', 'USD', 'EUR', 'GBP'].includes(text.toUpperCase())) return handleInputError(ctx, 'Укажите корректную валюту из списка (RUB, TRY, USD, EUR, GBP).');
                data.currency = text.toUpperCase(); state.step = 'add_villa_description';
                await ctx.reply('Введите описание виллы (или /skip, если нет):');
                break;
            case 'add_villa_description':
                if (text === '/skip') {
                    data.description = '';
                } else {
                    data.description = text;
                }
                state.step = 'add_villa_photos';
                await ctx.reply(`Отправьте ${PHOTO_LIMIT} фото (первая - обложка).`);
                break;
            default:
                await ctx.reply('Неизвестный шаг добавления виллы.');
                clearSession(ctx);
                break;
        }
    } else if (step.startsWith('edit_')) {
        // ... ваша логика редактирования, если есть
    } else if (step.startsWith('book_villa_')) {
        const userId = ctx.from?.id;
        const userName = ctx.from?.first_name || ctx.from?.last_name || 'Неизвестный';
        const userUsername = ctx.from?.username || '';
        const villa = await getVillaById(data.villaId);
        const villaName = villa ? villa.name : 'Неизвестная вилла';

        if (!userId) {
            await ctx.reply('Не удалось определить ваш ID пользователя. Пожалуйста, попробуйте снова.');
            return clearSession(ctx);
        }

        switch (step) {
            case 'book_villa_start_date':
                if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
                    return handleInputError(ctx, 'Пожалуйста, введите дату в формате ГГГГ-ММ-ДД (например, 2025-01-15).');
                }
                data.checkIn = text;
                state.step = 'book_villa_end_date';
                await ctx.reply('Введите **дату выезда** (ГГГГ-ММ-ДД):', { parse_mode: 'Markdown' });
                break;
            case 'book_villa_end_date':
                if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
                    return handleInputError(ctx, 'Пожалуйста, введите дату в формате ГГГГ-ММ-ДД (например, 2025-01-20).');
                }
                if (new Date(text) <= new Date(data.checkIn)) {
                    return handleInputError(ctx, 'Дата выезда должна быть позже даты заезда.');
                }
                data.checkOut = text;
                state.step = 'book_villa_guests';
                await ctx.reply('Сколько гостей будет (введите число):');
                break;
            case 'book_villa_guests':
                const guests = parseInt(text, 10);
                if (isNaN(guests) || guests <= 0) {
                    return handleInputError(ctx, 'Пожалуйста, введите корректное число гостей (больше 0).');
                }
                data.guests = guests;
                state.step = 'book_villa_comments';
                await ctx.reply('Есть ли у вас особые пожелания или комментарии? (или /skip):');
                break;
            case 'book_villa_comments':
                if (text === '/skip') {
                    data.comments = '';
                } else {
                    data.comments = text;
                }

                const newBooking: Omit<Booking, 'id' | 'createdAt' | 'status'> = {
                    userId: userId,
                    userName: userName,
                    userUsername: userUsername,
                    villaId: data.villaId,
                    villaName: villaName,
                    checkIn: data.checkIn,
                    checkOut: data.checkOut,
                    guests: data.guests,
                    comments: data.comments
                };

                try {
                    await saveBooking(newBooking);
                    await completeStep(ctx, `✅ Ваша заявка на виллу "${villaName}" принята! Мы свяжемся с вами.`);
                } catch (error) {
                    console.error('Ошибка при сохранении заявки:', error);
                    await ctx.reply('Произошла ошибка при сохранении вашей заявки. Пожалуйста, попробуйте позже.');
                }
                break;
            default:
                await ctx.reply('Произошла ошибка в процессе бронирования. Пожалуйста, попробуйте снова командой /book.');
                clearSession(ctx);
                break;
        }
    }
});


// Обработчик фото
bot.on(message('photo'), async (ctx) => {
    const state = ctx.session;
    if (!state || (state.step !== 'add_villa_photos' && state.step !== 'edit_photos')) return;

    state.data.photos.push(ctx.message.photo.pop()!.file_id);

    if (state.data.photos.length < PHOTO_LIMIT) {
        await ctx.reply(`Фото ${state.data.photos.length} из ${PHOTO_LIMIT} добавлено.`);
    } else {
        if (state.step === 'add_villa_photos') {
            try {
                const villa = await saveVilla(state.data);
                await completeStep(ctx, `🎉 Вилла "${villa.name}" успешно добавлена!`);
            } catch (error) {
                console.error('Ошибка при сохранении виллы:', error);
                await ctx.reply('Произошла ошибка при сохранении виллы. Пожалуйста, попробуйте позже.');
            }
        } else {
            // await updateVilla(state.data.villaId, { photos: state.data.photos });
            // await completeStep(ctx, 'Фотографии виллы успешно обновлены.');
        }
    }
});


// --- ЗАПУСК И ОБРАБОТКА ОШИБОК ---

bot.catch((err, ctx) => {
    console.error(`Ошибка для пользователя ${ctx.from?.id}:`, err);
    ctx.reply('Ой, что-то пошло не так. Мы уже работаем над этим.').catch(e =>
        console.error('Не удалось отправить сообщение об ошибке пользователю:', e)
    );
});

bot.launch()
    .then(() => console.log('Бот успешно запущен!'))
    .catch((err) => {
        console.error('Критическая ошибка при запуске бота:', err);
        process.exit(1);
    });

// Включение graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));