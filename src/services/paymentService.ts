// src/services/paymentService.ts (ОБНОВЛЕННАЯ ВЕРСИЯ - С FIRESTORE)

import { Payment } from '../types';
import {
    savePayment,
    getAllPayments as getPaymentsFromFirestore,
    getPaymentById as getPaymentByIdFromFirestore,
    updatePayment
} from '../utils/firestore';

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

export const getAllPayments = async (): Promise<Payment[]> => {
    try {
        const allPayments = await getPaymentsFromFirestore();
        return allPayments;
    } catch (error) {
        console.error('Ошибка при получении всех платежей из Firestore:', error);
        return [];
    }
};

export const getPaymentById = async (paymentId: string): Promise<Payment | null> => {
    try {
        const payment = await getPaymentByIdFromFirestore(paymentId);
        return payment;
    } catch (error) {
        console.error(`Ошибка при поиске платежа с ID ${paymentId} в Firestore:`, error);
        return null;
    }
};

export const updatePaymentStatus = async (paymentId: string, status: 'completed' | 'failed'): Promise<void> => {
    try {
        await updatePayment(paymentId, { status: status, updatedAt: Date.now() });
        console.log(`Статус платежа с ID ${paymentId} обновлён на ${status} в Firestore.`);
    } catch (error) {
        console.error(`Ошибка при обновлении статуса платежа с ID ${paymentId} в Firestore:`, error);
        throw new Error('Не удалось обновить статус платежа.');
    }
};