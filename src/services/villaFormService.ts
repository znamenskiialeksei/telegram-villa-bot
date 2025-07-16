// src/services/villaFormService.ts

import { VillaForm } from '../types';
import {
    saveVillaForm,
    getAllVillaForms as getAllVillaFormsFromFirestore,
    updateVillaForm,
    getVillaFormById as getVillaFormByIdFromFirestore
} from '../utils/firestore';

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

export const getAllVillaForms = async (): Promise<VillaForm[]> => {
    try {
        const allForms = await getAllVillaFormsFromFirestore();
        return allForms;
    } catch (error) {
        console.error('Ошибка при получении списка анкет вилл из Firestore:', error);
        return [];
    }
};

export const updateVillaFormStatus = async (formId: string, status: 'approved' | 'rejected'): Promise<void> => {
    try {
        await updateVillaForm(formId, { status: status, updatedAt: Date.now() });
        console.log(`Статус анкеты с ID ${formId} обновлён на ${status} в Firestore.`);
    } catch (error) {
        console.error(`Ошибка при обновлении статуса анкеты с ID ${formId} в Firestore:`, error);
        throw new Error('Не удалось обновить статус анкеты виллы.');
    }
};

export const getVillaFormById = async (formId: string): Promise<VillaForm | null> => {
    try {
        const form = await getVillaFormByIdFromFirestore(formId);
        return form;
    } catch (error) {
        console.error(`Ошибка при поиске анкеты виллы с ID ${formId} в Firestore:`, error);
        return null;
    }
};