import 'telegraf';

declare module 'telegraf' {
    interface Context {
        session: {
            step?: string;
            data?: any;
        };
    }
}
