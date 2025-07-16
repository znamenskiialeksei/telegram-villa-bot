// src/services/requestService.ts

import { Booking } from '../types'; // Используем Booking из types.ts
import {
    saveBooking, // Для создания новой заявки/бронирования
    getAllBookings, // Для получения всех заявок/бронирований
    updateBooking, // Для обновления статуса
    getBookingById, // Для получения по ID
    deleteBooking // Для удаления
} from '../utils/firestore';

export const createBookingRequest = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>): Promise<Booking> => {
    try {
        const newBooking = await saveBooking(bookingData);
        console.log(`Заявка на бронирование с ID ${newBooking.id} успешно создана в Firestore.`);
        return newBooking;
    } catch (error) {
        console.error('Ошибка при создании заявки на бронирование в Firestore:', error);
        throw new Error('Не удалось создать заявку на бронирование.');
    }
};

export const updateRequestStatus = async (requestId: string, status: 'approved' | 'rejected'): Promise<void> => {
    try {
        await updateBooking(requestId, { status: status === 'approved' ? 'accepted' : 'rejected', updatedAt: Date.now() });
        console.log(`Статус заявки/бронирования с ID ${requestId} обновлён на ${status} в Firestore.`);
    } catch (error) {
        console.error(`Ошибка при обновлении статуса заявки с ID ${requestId} в Firestore:,`, error);
        throw new Error('Не удалось обновить статус заявки.');
    }
};

export const getAllRequests = async (): Promise<Booking[]> => {
    try {
        return await getAllBookings();
    } catch (error) {
        console.error('Ошибка при получении списка заявок/бронирований из Firestore:', error);
        return [];
    }
};

export const getRequestById = async (requestId: string): Promise<Booking | null> => {
    try {
        return await getBookingById(requestId);
    } catch (error) {
        console.error(`Ошибка при поиске заявки с ID ${requestId} в Firestore:`, error);
        return null;
    }
};

export const deleteRequest = async (requestId: string): Promise<void> => {
    try {
        await deleteBooking(requestId);
        console.log(`Заявка/бронирование с ID ${requestId} успешно удалена из Firestore.`);
    } catch (error) {
        console.error(`Ошибка при удалении заявки с ID ${requestId} из Firestore:`, error);
        throw new Error('Не удалось удалить заявку.');
    }
};