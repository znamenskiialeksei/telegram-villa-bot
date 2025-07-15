// src/types/global.d.ts

import { SessionData } from './types'; // Убедитесь, что types.ts находится в той же папке

declare global {
  namespace NodeJS {
    interface Global {
      userForms?: {
        [userId: number]: SessionData;
      };
    }
  }
}

export {};