// src/commands/manageVillas.ts

import { Markup } from 'telegraf';
import { MyContext } from '../types';
import { isAdmin } from '../middlewares/auth';
import { getVillas, getVillaById } from '../utils/firestore';

/**
 * Команда для администратора: Показать список всех вилл в виде карточек.
 */
export const manageVillasCommand = async (ctx: MyContext) => {
    if (!(await isAdmin(ctx))) {
        return ctx.reply('У вас нет прав для выполнения этой команды.');
    }

    ctx.session.step = 'manage_villas_list'; // Устанавливаем шаг для контекста управления виллами

    const villas = await getVillas();
    if (villas.length === 0) {
        return ctx.reply('В системе нет зарегистрированных вилл.');
    }

    await ctx.reply('Вот список всех вилл (нажмите на ID для управления):');

    for (const villa of villas) {
        const photo = villa.photos[0] || 'https://via.placeholder.com/300?text=No+Image'; // Заглушка, если нет фото
        let message = `*${villa.name}*\n`;
        message += `📍 ${villa.location}\n`;
        message += `💰 ${villa.price} ${villa.currency}\n`;
        message += `ID: \`${villa.id}\`\n`;

        await ctx.replyWithPhoto(photo, {
            caption: message,
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                Markup.button.callback('Подробнее / Управление', `view_manage_villa:${villa.id}`)
            ])
        });
    }
    await ctx.reply('Выберите виллу для управления или вернитесь в главное меню.', Markup.inlineKeyboard([
        [Markup.button.callback('↩️ В главное меню', 'main_menu')] // Кнопка для возврата в главное меню
    ]));
};

/**
 * Функция для отображения детальной карточки виллы с кнопками управления.
 * Вызывается при нажатии на inline-кнопку "Подробнее / Управление".
 */
export const showVillaManagementCard = async (ctx: MyContext, villaId: string) => {
    const villa = await getVillaById(villaId);

    if (!villa) {
        return ctx.reply('Вилла не найдена.');
    }

    let message = `*Детали виллы: ${villa.name}*\n`;
    message += `📍 Локация: ${villa.location}\n`;
    message += `💰 Цена: ${villa.price} ${villa.currency}\n`;
    message += villa.description ? `📝 Описание: ${villa.description}\n` : '';
    message += `ID: \`${villa.id}\`\n`;

    const photo = villa.photos[0] || 'https://via.placeholder.com/300?text=No+Image';

    await ctx.replyWithPhoto(photo, {
        caption: message,
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
            [Markup.button.callback('✏️ Редактировать виллу', `edit_villa:${villa.id}`)],
            [Markup.button.callback('🗑️ Удалить виллу', `confirm_delete_villa:${villa.id}`)],
            [Markup.button.callback('↩️ Назад к списку вилл', 'manage_villas_list_back')]
        ])
    });
};