// AWS Backend API Client
// This replaces the Supabase client with calls to our AWS backend

const API_URL = import.meta.env.VITE_API_URL || 'http://api.virtualhems.com';

// Get auth token from localStorage (set by Cognito login)
const getAuthToken = () => {
  return localStorage.getItem('auth_token') || '';
};

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
};

// Supabase-compatible client interface
export const supabase = {
  auth: {
    getSession: async () => {
      const token = getAuthToken();
      return {
        data: {
          session: token ? { access_token: token } : null
        },
        error: null
      };
    },
    signOut: async () => {
      localStorage.removeItem('auth_token');
      return { error: null };
    }
  },
  
  from: (table: string) => ({
    select: (columns = '*') => ({
      eq: async (column: string, value: any) => {
        try {
          const data = await apiRequest(`/api/${table}?${column}=${value}`);
          return { data, error: null };
        } catch (error) {
          return { data: null, error };
        }
      },
      single: async () => {
        try {
          const data = await apiRequest(`/api/${table}`);
          return { data: data[0] || null, error: null };
        } catch (error) {
          return { data: null, error };
        }
      },
      then: async (resolve: any) => {
        try {
          const data = await apiRequest(`/api/${table}`);
          resolve({ data, error: null });
        } catch (error) {
          resolve({ data: null, error });
        }
      }
    }),
    
    insert: async (values: any) => {
      try {
        const data = await apiRequest(`/api/${table}`, {
          method: 'POST',
          body: JSON.stringify(values)
        });
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    
    update: async (values: any) => ({
      eq: async (column: string, value: any) => {
        try {
          const data = await apiRequest(`/api/${table}/${value}`, {
            method: 'PUT',
            body: JSON.stringify(values)
          });
          return { data, error: null };
        } catch (error) {
          return { data: null, error };
        }
      }
    }),
    
    delete: () => ({
      eq: async (column: string, value: any) => {
        try {
          await apiRequest(`/api/${table}/${value}`, {
            method: 'DELETE'
          });
          return { error: null };
        } catch (error) {
          return { error };
        }
      }
    })
  })
};
