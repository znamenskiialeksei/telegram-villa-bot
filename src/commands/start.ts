import { Context, Markup } from 'telegraf';

export const startCommand = (ctx: Context) => {
    ctx.reply(
        'Добро пожаловать в бот аренды вилл! Выберите действие или используйте /help для получения списка доступных команд.',
        Markup.inlineKeyboard([
            [Markup.button.callback('Помощь', 'help')],
            [Markup.button.callback('Арендовать виллу', 'rent_villa')],
            [Markup.button.callback('Панель владельца', 'owner_panel')],
            [Markup.button.callback('Панель администратора', 'admin_panel')],
        ])
    );
};