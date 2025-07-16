// src/services/bookingService.ts

import { Booking } from '../types';
import {
    saveBooking,
    getAllBookings as getBookingsFromFirestore,
    getBookingById as getBookingByIdFromFirestore,
    updateBooking,
    deleteBooking as deleteBookingFromFirestore
} from '../utils/firestore';

/**
 * Создать бронирование в Firestore.
 * @param bookingData Данные бронирования (без id, createdAt, status).
 */
export const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>): Promise<Booking> => {
    try {
        const newBooking = await saveBooking(bookingData);
        console.log(`Бронирование с ID ${newBooking.id} успешно создано в Firestore.`);
        return newBooking;
    } catch (error) {
        console.error('Ошибка при создании бронирования в Firestore:', error);
        throw new Error('Не удалось создать бронирование.');
    }
};

/**
 * Получить все бронирования из Firestore.
 * @returns Промис со списком бронирований.
 */
export const getAllBookings = async (): Promise<Booking[]> => {
    try {
        const allBookings = await getBookingsFromFirestore();
        return allBookings;
    } catch (error) {
        console.error('Ошибка при получении всех бронирований из Firestore:', error);
        return [];
    }
};

/**
 * Найти бронирование по ID в Firestore.
 * @param bookingId ID бронирования.
 * @returns Промис с бронированием или null.
 */
export const getBookingById = async (bookingId: string): Promise<Booking | null> => {
    try {
        const booking = await getBookingByIdFromFirestore(bookingId);
        return booking;
    } catch (error) {
        console.error(`Ошибка при поиске бронирования с ID ${bookingId} в Firestore:`, error);
        return null;
    }
};

/**
 * Обновить статус бронирования в Firestore.
 * @param bookingId ID бронирования.
 * @param status Новый статус.
 */
export const updateBookingStatus = async (bookingId: string, status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'): Promise<void> => {
    try {
        await updateBooking(bookingId, { status: status, updatedAt: Date.now() });
        console.log(`Статус бронирования с ID ${bookingId} обновлён на ${status} в Firestore.`);
    } catch (error) {
        console.error(`Ошибка при обновлении статуса бронирования с ID ${bookingId} в Firestore:`, error);
        throw new Error('Не удалось обновить статус бронирования.');
    }
};

/**
 * Удалить бронирование из Firestore.
 * @param bookingId ID бронирования.
 */
export const deleteBooking = async (bookingId: string): Promise<void> => {
    try {
        await deleteBookingFromFirestore(bookingId);
        console.log(`Бронирование с ID ${bookingId} успешно удалено из Firestore.`);
    } catch (error) {
        console.error(`Ошибка при удалении бронирования с ID ${bookingId} из Firestore:`, error);
        throw new Error('Не удалось удалить бронирование.');
    }
};