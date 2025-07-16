// src/services/calendarService.ts (ОБНОВЛЕННАЯ ВЕРСИЯ)

import { CalendarEntry } from '../types';
import {
    saveCalendarEntry,
    getCalendarEntriesByVillaId,
    updateCalendarEntry as updateCalendarEntryInFirestore // Переименовываем
} from '../utils/firestore';

/**
 * Добавить запись в календарь в Firestore.
 * @param entryData Данные записи календаря (без id, createdAt, updatedAt).
 */
export const addCalendarEntry = async (entryData: Omit<CalendarEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEntry> => {
    try {
        const newEntry = await saveCalendarEntry(entryData);
        console.log(`Запись для виллы с ID ${newEntry.villaId} на дату ${newEntry.date} успешно добавлена в Firestore.`);
        return newEntry;
    } catch (error) {
        console.error('Ошибка при добавлении записи в календарь в Firestore:', error);
        throw new Error('Не удалось добавить запись в календарь.');
    }
};

/**
 * Получить записи календаря для виллы из Firestore.
 * @param villaId ID виллы.
 * @returns Промис со списком записей календаря.
 */
export const getCalendarEntries = async (villaId: string): Promise<CalendarEntry[]> => {
    try {
        const entries = await getCalendarEntriesByVillaId(villaId);
        return entries;
    } catch (error) {
        console.error(`Ошибка при получении записей календаря для виллы с ID ${villaId} из Firestore:`, error);
        return [];
    }
};

/**
 * Обновить статус записи в календаре в Firestore.
 * @param entryId ID записи календаря.
 * @param updates Поля для обновления.
 */
export const updateCalendarEntry = async (entryId: string, updates: Partial<CalendarEntry>): Promise<void> => {
    try {
        await updateCalendarEntryInFirestore(entryId, updates);
        console.log(`Запись календаря с ID ${entryId} успешно обновлена в Firestore.`);
    } catch (error) {
        console.error(`Ошибка при обновлении записи календаря с ID ${entryId} в Firestore:`, error);
        throw new Error('Не удалось обновить запись календаря.');
    }
};

// Если вам нужна функция удаления записи календаря, ее также нужно добавить в firestore.ts
// и затем реализовать здесь:
// export const deleteCalendarEntry = async (entryId: string): Promise<void> => { ... };