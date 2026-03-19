import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/infrastructure/core/supabaseClient';
import { useToastStore } from '@/presentation/modules/shared/components/Toaster';

export function usePatientSubscription() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  useEffect(() => {
    const channel = supabase
      .channel('patients_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'patients',
        },
        (payload) => {
          const newPatient = payload.new;
          
          queryClient.invalidateQueries({ queryKey: ['patients'] });

          addToast({
            type: 'info',
            message: `Nuevo paciente registrado: ${newPatient.first_name} ${newPatient.last_name}`,
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, addToast]);
}
