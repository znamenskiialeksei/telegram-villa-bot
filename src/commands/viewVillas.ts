import { Context } from 'telegraf';

export const viewVillasCommand = async (ctx: Context) => {
    try {
        // Здесь должна быть логика получения списка доступных вилл из базы данных
        // Например:
        // const villas = await getAvailableVillas();
        // if (villas.length === 0) {
        //     ctx.reply('Нет доступных вилл для аренды.');
        //     return;
        // }

        // Временно используем статические данные
        const villas = [
            { id: 1, name: 'Вилла "Море"', location: 'Побережье', price: 100 },
            { id: 2, name: 'Вилла "Горы"', location: 'Горный район', price: 120 },
            { id: 3, name: 'Вилла "Лес"', location: 'Лесная зона', price: 90 },
        ];

        let message = 'Список доступных вилл:\n\n';
        villas.forEach((villa) => {
            message += `- ${villa.name} (Локация: ${villa.location}, Цена: $${villa.price} за ночь)\n`;
        });

        ctx.reply(message);
    } catch (error) {
        console.error('Ошибка при выполнении команды viewVillas:', error);
        ctx.reply('Произошла ошибка при получении списка вилл. Попробуйте позже.');
    }
};
