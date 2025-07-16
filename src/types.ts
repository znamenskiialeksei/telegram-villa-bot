// src/types.ts (ULTIMATE CORRECT VERSION)

import { Context as TelegrafContext } from 'telegraf';

export interface Villa {
    id?: string;
    name: string;
    location: string;
    price: number;
    currency: string;
    photos: string[];
    description?: string;
    calendarLink?: string;
    createdAt?: number; // timestamp
    updatedAt?: number; // timestamp
    isApproved?: boolean; // Added for villa approval logic
    ownerId?: number; // If you want to store Telegram ID of the villa owner
}

export interface SessionData {
    step?: string;
    data?: any; // Can be refined further if userForms[userId].data has a strict structure.
}

export interface MyContext extends TelegrafContext {
    session: SessionData;
}

export interface Booking { // This is your main "Booking Request"
    id?: string;
    villaId: string;
    villaName: string;
    userId: number; // Telegram User ID (number)
    userName?: string;
    userUsername?: string;
    guests: number;
    checkIn: string; // Check-in date (YYYY-MM-DD)
    checkOut: string; // Check-out date (YYYY-MM-DD)
    comments?: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
    createdAt: number; // timestamp
    updatedAt?: number; // timestamp
}

// INTERFACES FOR FIRESTORE COLLECTIONS (Payment, CalendarEntry, VillaForm)

export interface Payment {
    id?: string;
    bookingId: string; // ID of the associated booking
    userId: number; // ID of the user who made the payment
    amount: number;
    currency: string; // Currency of the payment
    status: 'pending' | 'completed' | 'failed';
    createdAt: number; // timestamp
    updatedAt?: number; // timestamp
}

export interface CalendarEntry {
    id?: string; // ID for the calendar entry
    villaId: string;
    date: string; // Date in YYYY-MM-DD format
    isBooked: boolean; // True if the date is booked
    bookingId?: string; // ID of the booking if the date is booked
    createdAt: number; // timestamp
    updatedAt?: number; // timestamp
}

export interface VillaForm { // Type for temporary villa forms (if not directly merging with Villa)
    id?: string;
    name: string;
    location: string;
    price: number;
    currency: string; // For consistency with Villa
    photos: string[]; // Array of Telegram file_ids
    description?: string;
    ownerId: number; // Telegram User ID of the owner submitting the form
    status: 'pending' | 'approved' | 'rejected';
    createdAt: number; // timestamp
    updatedAt?: number; // timestamp
}