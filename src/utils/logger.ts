/**
 * Логирует сообщение в консоль.
 * @param message Сообщение для логирования.
 */
export const log = (message: string): void => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [LOG]: ${message}`);
};

/**
 * Логирует ошибку в консоль.
 * @param error Ошибка для логирования.
 */
export const logError = (error: Error): void => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR]: ${error.message}`);
    if (error.stack) {
        console.error(`[${timestamp}] [STACK]: ${error.stack}`);
    }
};

/**
 * Логирует предупреждение в консоль.
 * @param message Предупреждение для логирования.
 */
export const logWarn = (message: string): void => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [WARN]: ${message}`);
};

/**
 * Логирует произвольные данные в консоль.
 * @param data Данные для логирования.
 */
export const logData = (data: unknown): void => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [DATA]:`, data);
};