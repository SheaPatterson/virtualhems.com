import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { HemsBase } from '../types/models';

export function useBases() {
  const [bases, setBases] = useState<HemsBase[] | null>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBases = async () => {
      const { data, error } = await supabase.from('hems_bases').select('*');
      if (error) {
        console.error('Error fetching bases:', error);
      } else {
        setBases(data);
      }
      setIsLoading(false);
    };

    fetchBases();
  }, []);

  return { bases, isLoading };
}