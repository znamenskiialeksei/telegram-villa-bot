// src/middlewares/auth.ts

import { Context } from 'telegraf';
import { ADMIN_ID } from '../config';

export const isAdmin = async (ctx: Context): Promise<boolean> => {
    const adminIds: number[] = [ADMIN_ID];
    return adminIds.includes(ctx.from?.id || 0);
};