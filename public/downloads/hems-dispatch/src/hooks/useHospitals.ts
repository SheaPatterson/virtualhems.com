import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Hospital } from '../types/models';

export function useHospitals() {
  const [hospitals, setHospitals] = useState<Hospital[] | null>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHospitals = async () => {
      const { data, error } = await supabase.from('hospitals').select('*');
      if (error) {
        console.error('Error fetching hospitals:', error);
      } else {
        setHospitals(data);
      }
      setIsLoading(false);
    };

    fetchHospitals();
  }, []);

  return { hospitals, isLoading };
}