// src/utils/firestore.ts (ФИНАЛЬНАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ)

import * as path from 'path'; // path больше не нужен, можно удалить, если не используется
import * as fs from 'fs';     // fs больше не нужен, можно удалить, если не используется
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { Villa, Booking, Payment, CalendarEntry, VillaForm } from '../types';

// Инициализация Firebase Admin SDK
// <--- ИЗМЕНЕНИЕ ЗДЕСЬ: Читаем из обычной переменной окружения
if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) { // Используем ваше новое имя переменной
    throw new Error('Ошибка: Переменная окружения FIREBASE_SERVICE_ACCOUNT_KEY не задана.');
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY); // Парсим JSON из строки

initializeApp({
    credential: cert(serviceAccount)
});

export const firestore = getFirestore();
// ... весь остальной код файла firestore.ts (без изменений) ...

// Объявляем ссылки на коллекции Firestore
export const villasCollection = firestore.collection('villas');
export const bookingsCollection = firestore.collection('bookings');
export const paymentsCollection = firestore.collection('payments');
export const calendarEntriesCollection = firestore.collection('calendarEntries');
export const villaFormsCollection = firestore.collection('villaForms');

// --- РАБОТА С ВИЛЛАМИ ---
export const getVillas = async (): Promise<Villa[]> => {
    const snapshot = await villasCollection.get();
    if (snapshot.empty) { return []; }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Villa));
};

export const getVillaById = async (id: string): Promise<Villa | null> => {
    const docRef = villasCollection.doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
        console.error(`Вилла с ID "${id}" не найдена в Firestore.`);
        return null;
    }
    return { id: docSnap.id, ...docSnap.data() } as Villa;
};

export const saveVilla = async (data: Omit<Villa, 'id' | 'createdAt' | 'updatedAt'>): Promise<Villa> => {
    const newVilla: Omit<Villa, 'id'> = {
        ...data,
        createdAt: Timestamp.now().toMillis(),
    } as Villa;
    const docRef = await villasCollection.add(newVilla);
    return { id: docRef.id, ...newVilla } as Villa;
};

export const updateVilla = async (id: string, data: Partial<Villa>): Promise<void> => {
    await villasCollection.doc(id).update({ ...data, updatedAt: Timestamp.now().toMillis() });
};

export const deleteVilla = async (id: string): Promise<void> => {
    await villasCollection.doc(id).delete();
};


// --- РАБОТА С ЗАЯВКАМИ НА БРОНИРОВАНИЕ (Bookings) ---
export const saveBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>): Promise<Booking> => {
    const newBooking: Omit<Booking, 'id'> = {
        ...bookingData,
        status: 'pending',
        createdAt: Timestamp.now().toMillis()
    };
    const docRef = await bookingsCollection.add(newBooking);
    return { id: docRef.id, ...newBooking } as Booking;
};

export const getUserBookings = async (userId: number): Promise<Booking[]> => {
    const snapshot = await bookingsCollection.where('userId', '==', userId).orderBy('createdAt', 'desc').get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<Booking, 'id'> }));
};

export const getBookingById = async (id: string): Promise<Booking | null> => {
    const doc = await bookingsCollection.doc(id).get();
    if (!doc.exists) {
        return null;
    }
    return { id: doc.id, ...doc.data() as Omit<Booking, 'id'> };
};

export const updateBooking = async (id: string, updates: Partial<Booking>): Promise<void> => {
    await bookingsCollection.doc(id).update(updates);
};

export async function getAllBookings(): Promise<Booking[]> {
    const snapshot = await bookingsCollection.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<Booking, 'id'> }));
}

export async function deleteBooking(bookingId: string): Promise<void> {
    await bookingsCollection.doc(bookingId).delete();
}

// --- НОВЫЕ ФУНКЦИИ: РАБОТА С ПЛАТЕЖАМИ (Payments) ---
export const savePayment = async (paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> => {
    const newPayment: Omit<Payment, 'id'> = {
        ...paymentData,
        createdAt: Timestamp.now().toMillis()
    } as Payment;
    const docRef = await paymentsCollection.add(newPayment);
    return { id: docRef.id, ...newPayment } as Payment;
};

export const getAllPayments = async (): Promise<Payment[]> => {
    const snapshot = await paymentsCollection.get();
    if (snapshot.empty) { return []; }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
};

export const getPaymentById = async (id: string): Promise<Payment | null> => {
    const docRef = paymentsCollection.doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
        return null;
    }
    return { id: docSnap.id, ...docSnap.data() } as Payment;
};

export const updatePayment = async (id: string, updates: Partial<Payment>): Promise<void> => {
    await paymentsCollection.doc(id).update({ ...updates, updatedAt: Timestamp.now().toMillis() });
};

// --- НОВЫЕ ФУНКЦИИ: РАБОТА С ЗАПИСЯМИ КАЛЕНДАРЯ (Calendar Entries) ---
export const saveCalendarEntry = async (entryData: Omit<CalendarEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEntry> => {
    const newEntry: Omit<CalendarEntry, 'id'> = {
        ...entryData,
        createdAt: Timestamp.now().toMillis()
    } as CalendarEntry;
    const docRef = await calendarEntriesCollection.add(newEntry);
    return { id: docRef.id, ...newEntry } as CalendarEntry;
};

export const getCalendarEntriesByVillaId = async (villaId: string): Promise<CalendarEntry[]> => {
    const snapshot = await calendarEntriesCollection.where('villaId', '==', villaId).get();
    if (snapshot.empty) { return []; }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CalendarEntry));
};

export const updateCalendarEntry = async (id: string, updates: Partial<CalendarEntry>): Promise<void> => {
    await calendarEntriesCollection.doc(id).update({ ...updates, updatedAt: Timestamp.now().toMillis() });
};

// --- НОВЫЕ ФУНКЦИИ: РАБОТА С АНКЕТАМИ ВИЛЛ (Villa Forms) ---
export const saveVillaForm = async (formData: Omit<VillaForm, 'id' | 'createdAt' | 'updatedAt'>): Promise<VillaForm> => {
    const newForm: Omit<VillaForm, 'id'> = {
        ...formData,
        createdAt: Timestamp.now().toMillis()
    } as VillaForm;
    const docRef = await villaFormsCollection.add(newForm);
    return { id: docRef.id, ...newForm } as VillaForm;
};

export const getAllVillaForms = async (): Promise<VillaForm[]> => {
    const snapshot = await villaFormsCollection.get();
    if (snapshot.empty) { return []; }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VillaForm));
};

export const updateVillaForm = async (id: string, updates: Partial<VillaForm>): Promise<void> => {
    await villaFormsCollection.doc(id).update({ ...updates, updatedAt: Timestamp.now().toMillis() });
};

export const getVillaFormById = async (id: string): Promise<VillaForm | null> => {
    const doc = await villaFormsCollection.doc(id).get();
    if (!doc.exists) {
        return null;
    }
    return { id: doc.id, ...doc.data() } as VillaForm;
};