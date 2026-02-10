// AWS API Client for VirtualHEMS
import { getAccessToken, getIdToken } from './auth';
import { getAWSConfig } from './config';

class APIClient {
  private baseUrl: string = '';
  
  async init() {
    const config = await getAWSConfig();
    this.baseUrl = config.apiEndpoint;
  }
  
  private async getHeaders(requireAuth = false): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (requireAuth) {
      const token = await getIdToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  }
  
  async get<T>(endpoint: string, requireAuth = true): Promise<T> {
    if (!this.baseUrl) await this.init();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: await this.getHeaders(requireAuth)
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || 'Request failed');
    }
    
    return response.json();
  }
  
  // Public GET (no auth required)
  async getPublic<T>(endpoint: string): Promise<T> {
    return this.get<T>(endpoint, false);
  }
  
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    if (!this.baseUrl) await this.init();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: await this.getHeaders(true),
      body: data ? JSON.stringify(data) : undefined
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || 'Request failed');
    }
    
    return response.json();
  }
  
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    if (!this.baseUrl) await this.init();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: await this.getHeaders(true),
      body: data ? JSON.stringify(data) : undefined
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || 'Request failed');
    }
    
    return response.json();
  }
  
  async delete<T>(endpoint: string): Promise<T> {
    if (!this.baseUrl) await this.init();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: await this.getHeaders(true)
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || 'Request failed');
    }
    
    return response.json();
  }
}

export const api = new APIClient();

// Type definitions for API responses
export interface UserProfile {
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  location?: string | null;
  bio?: string | null;
  simulators?: string | null;
  experience?: string | null;
  social_links?: Record<string, string>;
  api_key?: string;
  is_admin?: boolean;
  is_subscribed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Mission {
  mission_id: string;
  user_id: string;
  callsign: string;
  mission_type: string;
  hems_base: any;
  helicopter: any;
  crew: any[];
  origin: any;
  pickup: any;
  destination: any;
  patient_age?: number;
  patient_gender?: string;
  patient_weight_lbs?: number;
  patient_details?: string;
  waypoints: any[];
  tracking: {
    latitude: number;
    longitude: number;
    altitudeFt?: number;
    groundSpeedKts?: number;
    headingDeg?: number;
    verticalSpeedFtMin?: number;
    fuelRemainingLbs?: number;
    timeEnrouteMinutes?: number;
    phase: string;
    lastUpdate: number;
  };
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface HemsBase {
  id: string;
  name: string;
  location: string;
  faaIdentifier?: string;
  latitude: number;
  longitude: number;
  contact?: string;
  helicopterId?: string;
  createdAt: string;
}

export interface Hospital {
  id: string;
  name: string;
  city: string;
  faaIdentifier?: string;
  latitude: number;
  longitude: number;
  isTraumaCenter: boolean;
  traumaLevel?: number;
  createdAt: string;
}

export interface Helicopter {
  id: string;
  model: string;
  registration: string;
  fuelCapacityLbs: number;
  cruiseSpeedKts: number;
  fuelBurnRateLbHr: number;
  maintenanceStatus: 'FMC' | 'AOG';
  imageUrl?: string;
  createdAt: string;
}

// API Functions
export const authAPI = {
  login: async (email: string, password: string) => 
    api.post<{ success: boolean; access_token: string; id_token: string; refresh_token: string }>('/api/auth/login', { email, password }),
  
  register: async (email: string, password: string, first_name: string, last_name: string) =>
    api.post<{ success: boolean; message: string; user_id: string }>('/api/auth/register', { email, password, first_name, last_name }),
  
  me: async () => api.get<{ user: UserProfile }>('/api/auth/me')
};

export const profilesAPI = {
  getAll: async () => api.get<{ profiles: UserProfile[] }>('/api/profiles'),
  update: async (data: Partial<UserProfile>) => api.put<{ success: boolean }>('/api/profiles/me', data),
  rotateKey: async () => api.post<{ api_key: string }>('/api/profiles/rotate-key')
};

export const missionsAPI = {
  create: async (data: any) => api.post<{ success: boolean; mission_id: string; mission: Mission }>('/api/missions', data),
  getAll: async (status?: string) => api.get<{ missions: Mission[] }>(`/api/missions${status ? `?status=${status}` : ''}`),
  getActive: async () => api.get<{ missions: Mission[] }>('/api/missions/active'),
  getById: async (id: string) => api.get<{ mission: Mission }>(`/api/missions/${id}`),
  updateTelemetry: async (id: string, data: any) => api.put<{ success: boolean }>(`/api/missions/${id}/telemetry`, data),
  complete: async (id: string) => api.put<{ success: boolean }>(`/api/missions/${id}/complete`)
};

export const dataAPI = {
  getHemsBases: async () => api.get<{ bases: HemsBase[] }>('/api/hems-bases'),
  getHospitals: async () => api.get<{ hospitals: Hospital[] }>('/api/hospitals'),
  getHelicopters: async () => api.get<{ helicopters: Helicopter[] }>('/api/helicopters')
};

export const dispatchAPI = {
  sendMessage: async (missionId: string, message: string) =>
    api.post<{ success: boolean; response_text: string }>('/api/dispatch/ai', { mission_id: missionId, message }),
  generateTTS: async (text: string) =>
    api.post<{ audio_url: string }>('/api/dispatch/tts', { text })
};
