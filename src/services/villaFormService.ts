// src/services/villaFormService.ts (ОБНОВЛЕННАЯ ВЕРСИЯ)

import { VillaForm } from '../types';
import {
    saveVillaForm,
    getAllVillaForms as getAllVillaFormsFromFirestore,
    updateVillaForm,
    getVillaFormById as getVillaFormByIdFromFirestore
} from '../utils/firestore';

/**
 * Создать анкету виллы в Firestore.
 * @param formData Данные анкеты.
 */
export const createVillaForm = async (formData: Omit<VillaForm, 'id' | 'createdAt' | 'updatedAt'>): Promise<VillaForm> => {
    try {
        const newForm = await saveVillaForm(formData);
        console.log(`Анкета виллы с ID ${newForm.id} успешно создана в Firestore.`);
        return newForm;
    } catch (error) {
        console.error('Ошибка при создании анкеты виллы в Firestore:', error);
        throw new Error('Не удалось создать анкету виллы.');
    }
};

/**
 * Получить все анкеты вилл из Firestore.
 * @returns Промис со списком анкет.
 */
export const getAllVillaForms = async (): Promise<VillaForm[]> => {
    try {
        const allForms = await getAllVillaFormsFromFirestore();
        return allForms;
    } catch (error) {
        console.error('Ошибка при получении списка анкет вилл из Firestore:', error);
        return [];
    }
};

/**
 * Обновить статус анкеты виллы в Firestore.
 * @param formId ID анкеты.
 * @param status Новый статус.
 */
export const updateVillaFormStatus = async (formId: string, status: 'approved' | 'rejected'): Promise<void> => {
    try {
        await updateVillaForm(formId, { status: status, updatedAt: Date.now() });
        console.log(`Статус анкеты с ID ${formId} обновлён на ${status} в Firestore.`);
    } catch (error) {
        console.error(`Ошибка при обновлении статуса анкеты с ID ${formId} в Firestore:`, error);
        throw new Error('Не удалось обновить статус анкеты виллы.');
    }
};

/**
 * Получить анкету виллы по ID из Firestore.
 * @param formId ID анкеты.
 * @returns Промис с анкетой или null.
 */
export const getVillaFormById = async (formId: string): Promise<VillaForm | null> => {
    try {
        const form = await getVillaFormByIdFromFirestore(formId);
        return form;
    } catch (error) {
        console.error(`Ошибка при поиске анкеты виллы с ID ${formId} в Firestore:`, error);
        return null;
    }
};

// Если вам нужна функция удаления анкеты виллы, ее также нужно добавить в firestore.ts
// и затем реализовать здесь:
// export const deleteVillaForm = async (formId: string): Promise<void> => { ... };