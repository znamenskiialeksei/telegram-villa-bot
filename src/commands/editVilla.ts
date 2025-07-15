// src/commands/editVilla.ts

import { Markup } from 'telegraf';
import { MyContext, Villa } from '../types';
import { isAdmin } from '../middlewares/auth';
import { getVillaById, updateVilla } from '../utils/firestore';
import { clearSession } from '../bot'; // Импортируем clearSession из bot.ts

/**
 * Начинает пошаговый диалог редактирования виллы.
 */
export const startEditVillaCommand = async (ctx: MyContext, villaId: string) => {
    if (!(await isAdmin(ctx))) {
        return ctx.reply('У вас нет прав для выполнения этой команды.');
    }

    const villa = await getVillaById(villaId);
    if (!villa) {
        return ctx.reply('Вилла не найдена для редактирования.');
    }

    // Сохраняем ID редактируемой виллы и её текущие данные в сессии
    ctx.session.editingVillaId = villaId;
    ctx.session.editingVillaData = { ...villa }; // Копируем текущие данные для редактирования

    ctx.session.step = 'edit_villa_name';
    await ctx.reply(
        `Начинаем редактирование виллы *"${villa.name}"* (ID: \`${villaId}\`).\n\n` +
        `Введите новое название (текущее: "${villa.name}") или отправьте /skip для пропуска:`,
        { parse_mode: 'Markdown' }
    );
};

/**
 * Обрабатывает пошаговый ввод при редактировании виллы.
 */
export const handleEditVillaInput = async (ctx: MyContext, text: string) => {
    const { editingVillaId, editingVillaData, step } = ctx.session;

    if (!editingVillaId || !editingVillaData || !step || !step.startsWith('edit_villa_')) {
        await ctx.reply('Ошибка в процессе редактирования виллы. Начните заново командой /manage_villas.');
        clearSession(ctx);
        return;
    }

    // Обработка /cancel на любом этапе редактирования
    if (text === '/cancel') {
        clearSession(ctx);
        await ctx.reply('Редактирование виллы отменено. Данные не изменены.');
        return;
    }

    // Логика пошагового редактирования
    switch (step) {
        case 'edit_villa_name':
            if (text !== '/skip') {
                editingVillaData.name = text;
            }
            ctx.session.step = 'edit_villa_location';
            await ctx.reply(
                `Введите новую локацию (текущая: "${editingVillaData.location}") или отправьте /skip:`,
                { parse_mode: 'Markdown' }
            );
            break;

        case 'edit_villa_location':
            if (text !== '/skip') {
                editingVillaData.location = text;
            }
            ctx.session.step = 'edit_villa_price';
            await ctx.reply(
                `Введите новую цену (текущая: ${editingVillaData.price}) или отправьте /skip:`,
                { parse_mode: 'Markdown' }
            );
            break;

        case 'edit_villa_price':
            if (text !== '/skip') {
                const price = parseFloat(text);
                if (isNaN(price) || price <= 0) {
                    await ctx.reply('Ошибка: Укажите корректную цену (число больше 0) или /skip.');
                    return; // Остаемся на этом шаге
                }
                editingVillaData.price = price;
            }
            ctx.session.step = 'edit_villa_currency';
            await ctx.reply(
                `Введите новую валюту (текущая: ${editingVillaData.currency || 'не указана'}) или отправьте /skip:`,
                Markup.keyboard([['RUB', 'TRY'], ['USD', 'EUR', 'GBP']]).oneTime().resize()
            );
            break;

        case 'edit_villa_currency':
            if (text !== '/skip') {
                const currency = text.toUpperCase();
                if (!['RUB', 'TRY', 'USD', 'EUR', 'GBP'].includes(currency)) {
                    await ctx.reply('Ошибка: Укажите корректную валюту из списка (RUB, TRY, USD, EUR, GBP) или /skip.');
                    return; // Остаемся на этом шаге
                }
                editingVillaData.currency = currency;
            }
            ctx.session.step = 'edit_villa_description';
            await ctx.reply(
                `Введите новое описание (текущее: "${editingVillaData.description || 'нет'} ") или отправьте /skip:`,
                { parse_mode: 'Markdown' }
            );
            break;

        case 'edit_villa_description':
            if (text !== '/skip') {
                editingVillaData.description = text;
            }
            ctx.session.step = 'edit_villa_photos';
            await ctx.reply('Отправьте новые фотографии (до 5 штук) или /skip, чтобы оставить текущие. (Отправьте /done после всех фото)');
            break;

        case 'edit_villa_photos':
            // Фото обрабатываются отдельным обработчиком bot.on('photo')
            // Здесь мы ждем команду /done, чтобы завершить ввод фото
            if (text === '/done') {
                // Если фото не были загружены, оставляем старые
                if (!editingVillaData.photos || editingVillaData.photos.length === 0) {
                    // Можно добавить логику, чтобы убедиться, что хоть какие-то фото есть (старые или новые)
                    // Если изначально фото не было, и пользователь не загрузил новые, это может быть проблемой.
                    // Например: если !villa.photos и не загружено новых фото - alert.
                }
                // Переходим к сохранению
                await saveEditedVilla(ctx);
            } else {
                await ctx.reply('Пожалуйста, отправьте фотографии или /done для завершения ввода фото.');
            }
            break;

        default:
            await ctx.reply('Неизвестный шаг редактирования виллы. Редактирование отменено.');
            clearSession(ctx);
            break;
    }
};

/**
 * Обрабатывает загрузку фотографий при редактировании виллы.
 */
export const handleEditVillaPhotos = async (ctx: MyContext, fileId: string) => {
    const { editingVillaId, editingVillaData, step } = ctx.session;

    if (!editingVillaId || !editingVillaData || step !== 'edit_villa_photos') {
        return; // Игнорируем фото, если не в правильном режиме редактирования
    }

    if (!editingVillaData.photos) {
        editingVillaData.photos = [];
    }

    editingVillaData.photos.push(fileId);
    const PHOTO_LIMIT = 5; // Снова определяем лимит, или берем из config.ts

    if (editingVillaData.photos.length < PHOTO_LIMIT) {
        await ctx.reply(`Фото ${editingVillaData.photos.length} из ${PHOTO_LIMIT} добавлено. Отправьте ещё или /done.`);
    } else {
        await ctx.reply(`Достигнут лимит в ${PHOTO_LIMIT} фото. Отправьте /done для завершения редактирования.`);
    }
};


/**
 * Сохраняет отредактированную виллу в Firestore.
 */
const saveEditedVilla = async (ctx: MyContext) => {
    const { editingVillaId, editingVillaData } = ctx.session;

    if (!editingVillaId || !editingVillaData) {
        await ctx.reply('Ошибка: Нет данных для сохранения виллы. Начните заново командой /manage_villas.');
        clearSession(ctx);
        return;
    }

    try {
        await updateVilla(editingVillaId, editingVillaData); // Обновляем виллу в Firestore
        await ctx.reply(
            `✅ Вилла *"${editingVillaData.name || 'без названия'}"* (ID: \`${editingVillaId}\`) успешно обновлена!`,
            { parse_mode: 'Markdown' }
        );
    } catch (error) {
        console.error('Ошибка при сохранении отредактированной виллы:', error);
        await ctx.reply('Произошла ошибка при сохранении изменений виллы. Пожалуйста, попробуйте позже.');
    } finally {
        clearSession(ctx); // Очищаем сессию после завершения или ошибки
    }
};