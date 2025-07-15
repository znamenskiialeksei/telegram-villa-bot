// src/services/requestService.ts (UPDATED VERSION)

import { Booking } from '../types';
import {
    saveBooking,
    getAllBookings,
    updateBooking,
    getBookingById,
    deleteBooking
} from '../utils/firestore';

/**
 * Создать заявку на бронирование в Firestore.
 * @param bookingData Данные заявки.
 * @returns Промис с объектом Booking.
 */
export const createBookingRequest = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>): Promise<Booking> => { // FIX: Changed OOmit to Omit
    try {
        // Assume bookingData already contains villaName, userName, userUsername, guests, comments if needed by Booking type
        // Or ensure they are added before calling saveBooking if they are mandatory for Booking type in types.ts
        const newBooking = await saveBooking(bookingData);
        console.log(`Заявка на бронирование с ID ${newBooking.id} успешно создана в Firestore.`);
        return newBooking;
    } catch (error) {
        console.error('Ошибка при создании заявки на бронирование в Firestore:', error);
        throw new Error('Не удалось создать заявку на бронирование.');
    }
};

/**
 * Обновить статус заявки (бронирования) в Firestore.
 * @param requestId ID заявки/бронирования.
 * @param status Новый статус.
 */
export const updateRequestStatus = async (requestId: string, status: 'approved' | 'rejected'): Promise<void> => {
    try {
        await updateBooking(requestId, { status: status === 'approved' ? 'accepted' : 'rejected', updatedAt: Date.now() }); // FIX: Added updatedAt
        console.log(`Статус заявки/бронирования с ID ${requestId} обновлён на ${status} в Firestore.`);
    } catch (error) {
        console.error(`Ошибка при обновлении статуса заявки с ID ${requestId} в Firestore:,`, error);
        throw new Error('Не удалось обновить статус заявки.');
    }
};

/**
 * Получить все заявки (бронирования) из Firestore.
 * @returns Промис со списком заявок/бронирований.
 */
export const getAllRequests = async (): Promise<Booking[]> => {
    try {
        return await getAllBookings();
    } catch (error) {
        console.error('Ошибка при получении списка заявок/бронирований из Firestore:', error);
        return [];
    }
};

/**
 * Получить заявку (бронирование) по ID из Firestore.
 * @param requestId ID заявки/бронирования.
 * @returns Промис с заявкой/бронированием или null.
 */
export const getRequestById = async (requestId: string): Promise<Booking | null> => {
    try {
        return await getBookingById(requestId);
    } catch (error) {
        console.error(`Ошибка при поиске заявки с ID ${requestId} в Firestore:`, error);
        return null;
    }
};

/**
 * Удалить заявку (бронирование) из Firestore.
 * @param requestId ID заявки/бронирования.
 */
export const deleteRequest = async (requestId: string): Promise<void> => {
    try {
        await deleteBooking(requestId);
        console.log(`Заявка/бронирование с ID ${requestId} успешно удалена из Firestore.`);
    } catch (error) {
        console.error(`Ошибка при удалении заявки с ID ${requestId} из Firestore:`, error);
        throw new Error('Не удалось удалить заявку.');
    }
};