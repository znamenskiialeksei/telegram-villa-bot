// src/services/calendarService.ts (ОБНОВЛЕННАЯ ВЕРСИЯ - С FIRESTORE)

import { CalendarEntry } from '../types';
import {
    saveCalendarEntry,
    getCalendarEntriesByVillaId,
    updateCalendarEntry as updateCalendarEntryInFirestore
} from '../utils/firestore';

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

export const getCalendarEntries = async (villaId: string): Promise<CalendarEntry[]> => {
    try {
        const entries = await getCalendarEntriesByVillaId(villaId);
        return entries;
    } catch (error) {
        console.error(`Ошибка при получении записей календаря для виллы с ID ${villaId} из Firestore:`, error);
        return [];
    }
};

export const updateCalendarEntry = async (entryId: string, updates: Partial<CalendarEntry>): Promise<void> => {
    try {
        await updateCalendarEntryInFirestore(entryId, updates);
        console.log(`Статус записи календаря с ID ${entryId} успешно обновлен в Firestore.`);
    } catch (error) {
        console.error(`Ошибка при обновлении записи календаря с ID ${entryId} в Firestore:`, error);
        throw new Error('Не удалось обновить запись календаря.');
    }
};