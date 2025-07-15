// src/services/paymentService.ts (ОБНОВЛЕННАЯ ВЕРСИЯ)

import { Payment } from '../types';
import {
    savePayment,
    getAllPayments as getPaymentsFromFirestore,
    getPaymentById as getPaymentByIdFromFirestore,
    updatePayment
} from '../utils/firestore';

/**
 * Создать платеж в Firestore.
 * @param paymentData Данные платежа (без id, createdAt, updatedAt).
 */
export const createPayment = async (paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> => {
    try {
        const newPayment = await savePayment(paymentData);
        console.log(`Платеж с ID ${newPayment.id} успешно создан в Firestore.`);
        return newPayment;
    } catch (error) {
        console.error('Ошибка при создании платежа в Firestore:', error);
        throw new Error('Не удалось создать платеж.');
    }
};

/**
 * Получить все платежи из Firestore.
 * @returns Промис со списком платежей.
 */
export const getAllPayments = async (): Promise<Payment[]> => {
    try {
        const allPayments = await getPaymentsFromFirestore();
        return allPayments;
    } catch (error) {
        console.error('Ошибка при получении всех платежей из Firestore:', error);
        return [];
    }
};

/**
 * Найти платеж по ID в Firestore.
 * @param paymentId ID платежа.
 * @returns Промис с платежом или null.
 */
export const getPaymentById = async (paymentId: string): Promise<Payment | null> => {
    try {
        const payment = await getPaymentByIdFromFirestore(paymentId);
        return payment;
    } catch (error) {
        console.error(`Ошибка при поиске платежа с ID ${paymentId} в Firestore:`, error);
        return null;
    }
};

/**
 * Обновить статус платежа в Firestore.
 * @param paymentId ID платежа.
 * @param status Новый статус.
 */
export const updatePaymentStatus = async (paymentId: string, status: 'completed' | 'failed'): Promise<void> => {
    try {
        await updatePayment(paymentId, { status: status });
        console.log(`Статус платежа с ID ${paymentId} обновлён на ${status} в Firestore.`);
    } catch (error) {
        console.error(`Ошибка при обновлении статуса платежа с ID ${paymentId} в Firestore:`, error);
        throw new Error('Не удалось обновить статус платежа.');
    }
};