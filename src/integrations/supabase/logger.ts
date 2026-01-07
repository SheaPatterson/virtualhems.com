import { supabase } from '@/integrations/supabase/client';

export const log = async (message: string, level: 'INFO' | 'WARNING' | 'ERROR') => {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level,
    message,
  };

  try {
    const { error } = await supabase
      .from('logs')
      .insert([logData]);

    if (error) {
      console.error(`Error logging message to DB: ${error.message}`);
    } else {
      console.log(`[${timestamp}] ${level}: ${message}`);
    }
  } catch (error) {
    console.error(`Network error during logging: ${error}`);
  }
};