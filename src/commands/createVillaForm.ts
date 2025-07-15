// src/commands/createVillaForm.ts

import { Context } from 'telegraf';
import { isAdmin } from '../middlewares/auth';
import { saveVilla, getVillas } from '../utils/firestore';
import { MyContext, Villa } from '../types';

const validateVillaData = (name: string, location: string, price: string): boolean => {
    if (!name || !location || isNaN(Number(price))) return false;
    return true;
};

/**
 * Команда для создания анкеты виллы.
 */
export const createVillaFormCommand = async (ctx: MyContext) => {
    try {
        if (!(await isAdmin(ctx))) {
            ctx.reply('Ошибка: У вас нет прав для выполнения этой команды.');
            return;
        }

        if (ctx.message && 'text' in ctx.message) {
            const messageText = ctx.message.text || '';
            const villaDetails = messageText.split(' ').slice(1);

            if (villaDetails.length < 3) {
                ctx.reply('Ошибка: Проверьте правильность введенных данных. Формат: /createVillaForm [название] [локация] [цена]');
                return;
            }

            const [name, location, priceStr] = villaDetails;

            if (!validateVillaData(name, location, priceStr)) {
                ctx.reply('Ошибка: Проверьте правильность введенных данных. Формат: /createVillaForm [название] [локация] [цена]');
                return;
            }

            const price = Number(priceStr);

            const existingVillas = await getVillas();
            if (existingVillas.some((villa) => villa.name.toLowerCase() === name.toLowerCase())) {
                ctx.reply(`Ошибка: Вилла с названием "${name}" уже существует.`);
                return;
            }

            const newVilla: Omit<Villa, 'id' | 'createdAt' | 'updatedAt'> = {
                name,
                location,
                price,
                currency: 'USD', // Заглушка, если не запрашивается пошагово
                photos: []       // Заглушка, если не запрашиваются пошагово
            };

            await saveVilla(newVilla);

            ctx.reply(`Анкета виллы успешно создана и сохранена:\nНазвание: ${name}\nЛокация: ${location}\nЦена: ${price}`);
        } else {
            ctx.reply('Ошибка: сообщение не содержит текст.');
        }
    } catch (error) {
        console.error('Ошибка при выполнении команды createVillaForm:', error);
        ctx.reply('Произошла ошибка при создании анкеты виллы. Попробуйте позже.');
    }
};