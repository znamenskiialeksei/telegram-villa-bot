// src/types.ts

import { Context as TelegrafContext } from 'telegraf';

export interface Villa {
    id?: string;
    name: string;
    location: string;
    price: number;
    currency: string;
    photos: string[];
    description?: string;
    calendarLink?: string;
    createdAt?: number; // timestamp
    updatedAt?: number; // timestamp
    isApproved?: boolean; // Добавлено для логики утверждения виллы
    ownerId?: number; // Если вы хотите хранить ID владельца виллы (Telegram ID)
}

export interface SessionData {
    step?: string;
    data?: any;
    editingVillaId?: string; // ID виллы, которую редактируем
    editingVillaData?: Partial<Villa>; // Данные виллы, которые временно хранятся в процессе редактирования
}

export interface MyContext extends TelegrafContext {
    session: SessionData;
}

export interface Booking { // Это ваша основная "Заявка на бронирование"
    id?: string;
    villaId: string;
    villaName: string;
    userId: number; // ID пользователя Telegram (число)
    userName?: string;
    userUsername?: string;
    guests: number;
    checkIn: string; // Дата заезда (YYYY-MM-DD)
    checkOut: string; // Дата выезда (YYYY-MM-DD)
    comments?: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'; // Добавлен 'cancelled'
    createdAt: number; // timestamp
    updatedAt?: number; // timestamp
}

// ИНТЕРФЕЙСЫ ДЛЯ FIRESTORE КОЛЛЕКЦИЙ (если они будут использоваться)

export interface Payment {
    id?: string;
    bookingId: string; // ID связанного бронирования
    userId: number; // ID пользователя, который совершил платеж
    amount: number;
    currency: string; // Валюта платежа
    status: 'pending' | 'completed' | 'failed';
    createdAt: number; // timestamp
    updatedAt?: number; // timestamp
}

export interface CalendarEntry {
    id?: string; // ID записи календаря
    villaId: string;
    date: string; // Дата в формате YYYY-MM-DD
    isBooked: boolean; // Забронирована ли дата
    bookingId?: string; // ID бронирования, если дата забронирована
    createdAt: number; // timestamp
    updatedAt?: number; // timestamp
}

export interface VillaForm { // Тип для временных анкет вилл (если они не дублируют Villa)
    id?: string;
    name: string;
    location: string;
    price: number;
    currency: string; // Для консистентности с Villa
    photos: string[]; // Массив file_id Telegram
    description?: string;
    ownerId: number; // ID пользователя Telegram, который заполняет анкету
    status: 'pending' | 'approved' | 'rejected';
    createdAt: number; // timestamp
    updatedAt?: number; // timestamp
}