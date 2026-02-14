// Temporary stub - replace with actual Appwrite API calls later
import { databases } from '@/lib/appwrite';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  first_name?: string;
  last_name?: string;
}

export interface HemsBase {
  id: string;
  name: string;
  location: string;
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
}

export interface Helicopter {
  id: string;
  registration: string;
  model: string;
}

// Stub implementations - replace with real Appwrite queries
export const profilesAPI = {
  getAll: async (): Promise<UserProfile[]> => {
    // TODO: Implement with Appwrite databases
    return [];
  },
  update: async (id: string, data: Partial<UserProfile>): Promise<UserProfile> => {
    // TODO: Implement with Appwrite databases
    throw new Error('Not implemented yet');
  },
  delete: async (id: string): Promise<void> => {
    // TODO: Implement with Appwrite databases
    throw new Error('Not implemented yet');
  }
};

export const dataAPI = {
  getBases: async (): Promise<HemsBase[]> => {
    // TODO: Implement with Appwrite databases
    return [];
  },
  getHospitals: async (): Promise<Hospital[]> => {
    // TODO: Implement with Appwrite databases
    return [];
  },
  getHelicopters: async (): Promise<Helicopter[]> => {
    // TODO: Implement with Appwrite databases
    return [];
  }
};

export const atcAPI = {
  sendMessage: async (message: string): Promise<any> => {
    // TODO: Implement with Appwrite
    throw new Error('Not implemented yet');
  }
};

export const dispatchAPI = {
  createMission: async (data: any): Promise<any> => {
    // TODO: Implement with Appwrite
    throw new Error('Not implemented yet');
  }
};

export const authAPI = {
  me: async (): Promise<{ user: UserProfile }> => {
    // TODO: Implement with Appwrite account
    throw new Error('Not implemented yet');
  }
};
