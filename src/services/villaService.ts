// src/services/villaService.ts

// Тип Villa должен быть импортирован из src/types.ts, а не переопределяться здесь
import { Villa } from '../types';
import {
    saveVilla,
    getVillas as getVillasFromFirestore, // Переименовываем
    getVillaById as getVillaByIdFromFirestore, // Переименовываем
    deleteVilla as deleteVillaFromFirestore // Переименовываем
} from '../utils/firestore'; // Импортируем функции Firestore

/**
 * Добавить новую виллу в Firestore.
 * @param villaData Данные виллы (без id, createdAt, updatedAt).
 */
export const addVilla = async (villaData: Omit<Villa, 'id' | 'createdAt' | 'updatedAt'>): Promise<Villa> => {
    try {
        const newVilla = await saveVilla(villaData); // Используем saveVilla из Firestore
        console.log(`Вилла с ID ${newVilla.id} успешно добавлена в Firestore.`);
        return newVilla;
    } catch (error) {
        console.error('Ошибка при добавлении виллы в Firestore:', error);
        throw new Error('Не удалось добавить виллу.');
    }
};

/**
 * Получить все виллы из Firestore.
 * @returns Список вилл.
 */
export const getAllVillas = async (): Promise<Villa[]> => {
    try {
        const allVillas = await getVillasFromFirestore(); // Используем getVillas из Firestore
        return allVillas;
    } catch (error) {
        console.error('Ошибка при получении списка вилл из Firestore:', error);
        return [];
    }
};

/**
 * Найти виллу по ID в Firestore.
 * @param villaId ID виллы.
 * @returns Вилла или null.
 */
export const getVillaById = async (villaId: string): Promise<Villa | null> => {
    try {
        const villa = await getVillaByIdFromFirestore(villaId); // Используем getVillaById из Firestore
        return villa;
    } catch (error) {
        console.error(`Ошибка при поиске виллы с ID ${villaId} в Firestore:`, error);
        return null;
    }
};

/**
 * Удалить виллу из Firestore.
 * @param villaId ID виллы.
 */
export const deleteVilla = async (villaId: string): Promise<void> => {
    try {
        await deleteVillaFromFirestore(villaId); // Используем deleteVilla из Firestore
        console.log(`Вилла с ID ${villaId} успешно удалена из Firestore.`);
    } catch (error) {
        console.error(`Ошибка при удалении виллы с ID ${villaId} из Firestore:`, error);
        throw new Error('Не удалось удалить виллу.');
    }
};