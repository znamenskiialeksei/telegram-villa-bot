import { Context, NarrowedContext } from 'telegraf';
import { Message, Update } from 'telegraf/types';
import { isAdmin } from '../middlewares/auth';

export const sendNotificationCommand = async (
    ctx: NarrowedContext<Context, Update.MessageUpdate<Message.TextMessage>>
) => {
    try {
        // Проверяем, является ли пользователь администратором
        if (!(await isAdmin(ctx))) {
            ctx.reply('Ошибка: У вас нет прав для выполнения этой команды.');
            return;
        }

        const message = ctx.message.text.split(' ').slice(1).join(' '); // Ожидается команда вида /sendNotification текст_уведомления
        if (!message) {
            ctx.reply('Пожалуйста, укажите текст уведомления. Например: /sendNotification Новая вилла доступна для бронирования!');
            return;
        }

        // Здесь должна быть логика отправки уведомлений всем пользователям
        // Например:
        // const users = await getAllUsers(); // Получение списка пользователей из базы данных
        // users.forEach(user => {
        //     ctx.telegram.sendMessage(user.chatId, message);
        // });

        ctx.reply(`Уведомление отправлено: "${message}"`);
    } catch (error) {
        console.error('Ошибка при выполнении команды sendNotification:', error);
        ctx.reply('Произошла ошибка при отправке уведомления. Попробуйте позже.');
    }
};
