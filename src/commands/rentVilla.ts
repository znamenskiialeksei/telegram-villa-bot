import { Context } from 'telegraf';

export const rentVillaCommand = (ctx: Context) => {
    try {
        // Проверяем, что ctx.message существует и является текстовым сообщением
        if (ctx.message && 'text' in ctx.message) {
            const messageText = ctx.message.text || '';
            const args = messageText.split(' ').slice(1); // Убираем команду из сообщения

            if (args.length < 3) {
                ctx.reply('Ошибка: Укажите параметры для аренды виллы. Пример: /rent [локация] [макс. цена] [мин. спальни]');
                return;
            }

            const [location, maxPrice, minBedrooms] = args;

            // Проверяем корректность введённых данных
            if (isNaN(Number(maxPrice)) || isNaN(Number(minBedrooms))) {
                ctx.reply('Ошибка: Укажите корректные значения для максимальной цены и минимального количества спален.');
                return;
            }

            ctx.reply(
                `Поиск вилл с параметрами:\n- Локация: ${location}\n- Максимальная цена: ${maxPrice}\n- Минимальное количество спален: ${minBedrooms}`
            );

            // Здесь можно добавить логику для поиска вилл в базе данных
        } else {
            ctx.reply('Ошибка: сообщение не содержит текст.');
        }
    } catch (error) {
        console.error('Ошибка при выполнении команды rentVilla:', error);
        ctx.reply('Произошла ошибка при обработке запроса на аренду виллы. Попробуйте позже.');
    }
};