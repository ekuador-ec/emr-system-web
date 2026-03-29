import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseMedicalRecordRepository } from '@/infrastructure/modules/medical-record/repositories/SupabaseMedicalRecordRepository';
import { GetMedicalRecordByPatientUseCase } from '@/application/modules/medical-record/use-cases/GetMedicalRecordByPatientUseCase';
import { CreateMedicalRecordUseCase } from '@/application/modules/medical-record/use-cases/CreateMedicalRecordUseCase';
import { UpdateMedicalRecordStatusUseCase } from '@/application/modules/medical-record/use-cases/UpdateMedicalRecordStatusUseCase';
import { ListMedicalRecordsUseCase } from '@/application/modules/medical-record/use-cases/ListMedicalRecordsUseCase';
import type { MedicalRecord, MedicalRecordFilters } from '@/domain/modules/medical-record/models/MedicalRecord';

// Instantiate repository and use cases outside the hook
const repository = new SupabaseMedicalRecordRepository();
const getMedicalRecordByPatientUseCase = new GetMedicalRecordByPatientUseCase(repository);
const createMedicalRecordUseCase = new CreateMedicalRecordUseCase(repository);
const updateMedicalRecordStatusUseCase = new UpdateMedicalRecordStatusUseCase(repository);
const listMedicalRecordsUseCase = new ListMedicalRecordsUseCase(repository);

export const useMedicalRecordByPatient = (patientId: string) => {
  return useQuery({
    queryKey: ['medical-record', 'patient', patientId],
    queryFn: () => getMedicalRecordByPatientUseCase.execute(patientId),
    enabled: !!patientId,
  });
};

export const useMedicalRecords = (filters?: MedicalRecordFilters) => {
  return useQuery({
    queryKey: ['medical-records', filters],
    queryFn: () => listMedicalRecordsUseCase.execute(filters),
  });
};

export const useCreateMedicalRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (patientId: string) => createMedicalRecordUseCase.execute(patientId),
    onSuccess: (data: MedicalRecord) => {
      queryClient.invalidateQueries({ queryKey: ['medical-record', 'patient', data.patientId] });
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
    },
  });
};

export const useUpdateMedicalRecordStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      updateMedicalRecordStatusUseCase.execute(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-record'] });
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
    },
  });
};
