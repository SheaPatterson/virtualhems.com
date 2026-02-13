// AWS Backend API Client
// This replaces the Supabase client with calls to our AWS backend
import { getAccessToken } from '../aws/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://api.virtualhems.com';

// Get auth token from Cognito session
const getAuthToken = async () => {
  try {
    const token = await getAccessToken();
    return token || '';
  } catch (error) {
    console.error('Error getting auth token:', error);
    return '';
  }
};

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.statusText} - ${error}`);
  }

  return response.json();
};

// Map table names to API endpoints
const tableToEndpoint: Record<string, string> = {
  'hems_bases': '/api/hems-bases',
  'hospitals': '/api/hospitals',
  'helicopters': '/api/helicopters',
  'missions': '/api/missions',
  'profiles': '/api/profiles',
};

// Supabase-compatible client interface
export const supabase = {
  auth: {
    getSession: async () => {
      const token = await getAuthToken();
      return {
        data: {
          session: token ? { access_token: token } : null
        },
        error: null
      };
    },
    signOut: async () => {
      // Use the proper Cognito signOut from auth.ts
      const { signOut } = await import('../aws/auth');
      await signOut();
      return { error: null };
    }
  },
  
  from: (table: string) => {
    const endpoint = tableToEndpoint[table] || `/api/${table}`;
    
    return {
      select: (columns = '*') => ({
        eq: async (column: string, value: any) => {
          try {
            const result = await apiRequest(`${endpoint}?${column}=${value}`);
            // Extract data from response object (e.g., { bases: [...] })
            const dataKey = Object.keys(result).find(k => Array.isArray(result[k]));
            const data = dataKey ? result[dataKey] : result;
            return { data, error: null };
          } catch (error) {
            console.error('API Error:', error);
            return { data: null, error };
          }
        },
        single: async () => {
          try {
            const result = await apiRequest(endpoint);
            const dataKey = Object.keys(result).find(k => Array.isArray(result[k]));
            const data = dataKey ? result[dataKey][0] : result;
            return { data: data || null, error: null };
          } catch (error) {
            console.error('API Error:', error);
            return { data: null, error };
          }
        },
        then: async (resolve: any) => {
          try {
            const result = await apiRequest(endpoint);
            // Extract data array from response (e.g., { bases: [...] } -> [...])
            const dataKey = Object.keys(result).find(k => Array.isArray(result[k]));
            const data = dataKey ? result[dataKey] : result;
            resolve({ data, error: null });
          } catch (error) {
            console.error('API Error:', error);
            resolve({ data: null, error });
          }
        }
      }),
      
      insert: async (values: any) => {
        try {
          const data = await apiRequest(endpoint, {
            method: 'POST',
            body: JSON.stringify(values)
          });
          return { data, error: null };
        } catch (error) {
          console.error('API Error:', error);
          return { data: null, error };
        }
      },
      
      update: async (values: any) => ({
        eq: async (column: string, value: any) => {
          try {
            const data = await apiRequest(`${endpoint}/${value}`, {
              method: 'PUT',
              body: JSON.stringify(values)
            });
            return { data, error: null };
          } catch (error) {
            console.error('API Error:', error);
            return { data: null, error };
          }
        }
      }),
      
      delete: () => ({
        eq: async (column: string, value: any) => {
          try {
            await apiRequest(`${endpoint}/${value}`, {
              method: 'DELETE'
            });
            return { error: null };
          } catch (error) {
            console.error('API Error:', error);
            return { error };
          }
        }
      })
    };
  }
};

