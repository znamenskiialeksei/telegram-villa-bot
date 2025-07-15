// src/bot.ts

import { Telegraf, Markup } from 'telegraf';
import { message } from 'telegraf/filters';
import { MyContext, SessionData, Villa, Booking } from './types';
import {
    saveVilla, getVillas, getVillaById, updateVilla, deleteVilla,
    saveBooking, getUserBookings, getBookingById, updateBooking,
    getAllBookings, deleteBooking as deleteBookingFromFirestore // Импортируем deleteBooking для бронирований
} from './utils/firestore'; // Удален firestore, если он не нужен для прямого доступа
import { BOT_TOKEN, ADMIN_ID } from './config';

import LocalSession from 'telegraf-session-local';
import { manageVillasCommand, showVillaManagementCard } from './commands/manageVillas'; // НОВАЯ КОМАНДА
import { startEditVillaCommand, handleEditVillaInput, handleEditVillaPhotos } from './commands/editVilla'; // НОВАЯ КОМАНДА
import { deleteVillaCommand } from './commands/deleteVilla'; // Импортируем команду удаления виллы

// Константа для лимита фото
const PHOTO_LIMIT = 5;

// Инициализация бота
const bot = new Telegraf<MyContext>(BOT_TOKEN);

// Настройка сессии
const session = new LocalSession({ database: 'sessions.json' });
bot.use(session.middleware());

// --- Вспомогательные функции ---

// Функция для очистки состояния сессии
export const clearSession = (ctx: MyContext) => { // Экспортируем для использования в editVilla.ts
    ctx.session.step = undefined;
    ctx.session.data = undefined;
    ctx.session.editingVillaId = undefined; // Очищаем данные редактирования
    ctx.session.editingVillaData = undefined; // Очищаем данные редактирования
};

// Функция для завершения шага и очистки сессии
const completeStep = async (ctx: MyContext, message: string) => {
    await ctx.reply(message, Markup.removeKeyboard());
    clearSession(ctx);
};

const handleInputError = (ctx: MyContext, message: string) => ctx.reply(`Ошибка: ${message}`);

// Функция для показа главного меню (подходит для закрепленной кнопки меню)
const showMainMenu = async (ctx: MyContext) => {
    clearSession(ctx); // Очищаем сессию при входе в главное меню
    let mainMenuKeyboard;
    if (ctx.from?.id === ADMIN_ID) {
        mainMenuKeyboard = Markup.keyboard([
            ['🏡 Виллы', '🗓️ Бронирования'],
            ['➕ Добавить виллу', '⚙️ Управление виллами'], // Новая кнопка
            ['📊 Аналитика', '❓ Помощь']
        ]).resize();
    } else {
        mainMenuKeyboard = Markup.keyboard([
            ['🏡 Виллы', '🗓️ Мои заявки'],
            ['❓ Помощь']
        ]).resize();
    }
    await ctx.reply('Вы в главном меню.', mainMenuKeyboard);
};


// --- Команды бота ---

bot.start(async (ctx) => {
    await showMainMenu(ctx); // Показываем главное меню при старте
});

bot.help(async (ctx) => {
    // Теперь команда /help просто показывает главное меню
    await showMainMenu(ctx);
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
    clearSession(ctx); // Очищаем сессию перед показом вилл
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
    await ctx.reply('Выберите виллу для бронирования или вернитесь в главное меню.', Markup.inlineKeyboard([
        [Markup.button.callback('↩️ В главное меню', 'main_menu')]
    ]));
});

// НОВАЯ КОМАНДА ДЛЯ АДМИНА: УПРАВЛЕНИЕ ВИЛЛАМИ
bot.command('manage_villas', manageVillasCommand); // Используем импортированную команду

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
    await ctx.reply('Ваши заявки.', Markup.inlineKeyboard([
        [Markup.button.callback('↩️ В главное меню', 'main_menu')]
    ]));
});

// --- ОБЩИЕ ОБРАБОТЧИКИ ВВОДА (TEXT и PHOTO) ---

// Обработчик Inline-кнопок
bot.on('callback_query', async (ctx) => {
    if (!('data' in ctx.callbackQuery)) {
        return ctx.answerCbQuery('Произошла ошибка при обработке запроса.');
    }
    const query = ctx.callbackQuery.data;

    // ГЛАВНОЕ МЕНЮ И КНОПКИ УПРАВЛЕНИЯ
    if (query === 'main_menu') {
        await ctx.answerCbQuery();
        await showMainMenu(ctx);
        return;
    }

    if (query?.startsWith('view_manage_villa:')) {
        const villaId = query.split(':')[1];
        await ctx.answerCbQuery();
        await showVillaManagementCard(ctx, villaId); // Показываем карточку управления
        return;
    }

    if (query?.startsWith('edit_villa:')) {
        const villaId = query.split(':')[1];
        await ctx.answerCbQuery();
        await startEditVillaCommand(ctx, villaId); // Начинаем редактирование
        return;
    }

    // Обработка кнопки "Назад к списку вилл"
    if (query === 'manage_villas_list_back') {
        await ctx.answerCbQuery();
        await manageVillasCommand(ctx); // Показываем список вилл заново
        return;
    }

    if (query?.startsWith('confirm_delete_villa:')) {
        const villaId = query.split(':')[1];
        await ctx.answerCbQuery();
        ctx.session.step = `confirm_delete_villa_action:${villaId}`; // Сохраняем ID для подтверждения
        await ctx.reply(`Вы уверены, что хотите удалить виллу с ID \`${villaId}\`? Напишите *Да* для подтверждения или /cancel для отмены.`, { parse_mode: 'Markdown' });
        return;
    }

    // ЛОГИКА БРОНИРОВАНИЯ
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

    return ctx.answerCbQuery(); // Обязательно отвечайте на callbackQuery
});


// Обработчик текстовых сообщений
bot.on(message('text'), async (ctx) => {
    const state = ctx.session;
    const text = ctx.message.text;

    // ГЛОБАЛЬНАЯ КНОПКА ОТМЕНЫ
    if (text === '/cancel') {
        clearSession(ctx);
        await ctx.reply('Действие отменено. Вы в главном меню.');
        await showMainMenu(ctx);
        return;
    }

    // ОБРАБОТКА ТЕКСТОВЫХ КНОПОК ГЛАВНОГО МЕНЮ
    // Если пользователь нажимает текстовую кнопку, перенаправляем на соответствующую команду
    if (['🏡 Виллы', '🗓️ Мои заявки', '➕ Добавить виллу', '⚙️ Управление виллами', '📊 Аналитика', '❓ Помощь', '🗓️ Бронирования', '↩️ В главное меню'].includes(text)) {
        if (text === '🏡 Виллы') {
            return bot.handleUpdate(ctx.update); // Перенаправляем на команду /villas
        } else if (text === '🗓️ Мои заявки' || text === '🗓️ Бронирования') {
            return bot.handleUpdate(ctx.update); // Перенаправляем на команду /my_bookings
        } else if (text === '➕ Добавить виллу') {
            return bot.handleUpdate(ctx.update); // Перенаправляем на команду /add_villa
        } else if (text === '⚙️ Управление виллами') {
            return bot.handleUpdate(ctx.update); // Перенаправляем на команду /manage_villas
        } else if (text === '📊 Аналитика') {
             // return bot.handleUpdate(ctx.update); // Перенаправляем на команду /analytics
             await ctx.reply('Команда аналитики пока не реализована.'); // Заглушка, пока не реализуете команду /analytics
             await showMainMenu(ctx);
             return;
        } else if (text === '❓ Помощь') {
            return bot.handleUpdate(ctx.update); // Перенаправляем на команду /help
        } else if (text === '↩️ В главное меню') {
            await showMainMenu(ctx);
            return;
        }
    }


    // Если нет активного шага, или если уже обработали глобальные кнопки
    if (!state || !state.step) {
        await showMainMenu(ctx);
        return;
    }

    // ПРОДОЛЖЕНИЕ ЛОГИКИ ПОДТВЕРЖДЕНИЯ УДАЛЕНИЯ ВИЛЛЫ
    if (state.step.startsWith('confirm_delete_villa_action:')) {
        const villaId = state.step.split(':')[1];
        if (text.toLowerCase() === 'да') { // Подтверждение словом "Да"
            try {
                await deleteVilla(villaId); // Используем deleteVilla из utils/firestore
                await ctx.reply(`✅ Вилла с ID \`${villaId}\` успешно удалена!`);
            } catch (error) {
                console.error('Ошибка при удалении виллы:', error);
                await ctx.reply('Произошла ошибка при удалении виллы. Пожалуйста, попробуйте позже.');
            } finally {
                clearSession(ctx);
                await showMainMenu(ctx);
            }
        } else { // Любой другой ответ кроме "Да" или /cancel
            await ctx.reply('Удаление виллы отменено.');
            clearSession(ctx);
            await showMainMenu(ctx);
        }
        return;
    }


    const { step, data } = state; // Повторно деструктурируем после возможной обработки confirm_delete_villa_action

    // ЛОГИКА ДОБАВЛЕНИЯ ВИЛЛЫ (для админа)
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
    }
    // ЛОГИКА РЕДАКТИРОВАНИЯ ВИЛЛЫ
    else if (ctx.session.step && ctx.session.step.startsWith('edit_villa_')) {
        await handleEditVillaInput(ctx, text);
    }
    // ЛОГИКА БРОНИРОВАНИЯ ВИЛЛЫ
    else if (step.startsWith('book_villa_')) {
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
    } else {
        // Если текст не соответствует ни одному активному шагу, показываем главное меню
        await showMainMenu(ctx);
    }
});


// Обработчик фото
bot.on(message('photo'), async (ctx) => {
    const state = ctx.session;
    if (!state || (state.step !== 'add_villa_photos' && state.step !== 'edit_villa_photos')) return;

    if (ctx.session.step === 'edit_villa_photos') {
        // Если это режим редактирования фото, передаем в специальный обработчик
        const fileId = ctx.message.photo.pop()!.file_id;
        await handleEditVillaPhotos(ctx, fileId);
        return;
    }

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
            // Это ветка для edit_photos, если бы она была здесь.
            // Сейчас она обрабатывается через handleEditVillaPhotos
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