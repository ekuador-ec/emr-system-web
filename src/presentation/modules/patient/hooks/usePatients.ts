import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PatientFilters } from '@/domain/modules/patient/repositories/PatientRepository';
import type { CreatePatientDTO, UpdatePatientDTO } from '@/domain/modules/patient/models/Patient';
import { SupabasePatientRepository } from '@/infrastructure/modules/patient/repositories/SupabasePatientRepository';
import { CreatePatientUseCase } from '@/application/modules/patient/use-cases/createPatientUseCase';
import { UpdatePatientUseCase } from '@/application/modules/patient/use-cases/updatePatientUseCase';
import { GetPatientUseCase } from '@/application/modules/patient/use-cases/getPatientUseCase';
import { ListPatientsUseCase } from '@/application/modules/patient/use-cases/listPatientsUseCase';
import { TogglePatientStatusUseCase } from '@/application/modules/patient/use-cases/togglePatientStatusUseCase';
import { GetPatientByIdNumberUseCase } from '@/application/modules/patient/use-cases/getPatientByIdNumberUseCase';

const repository = new SupabasePatientRepository();

const createPatientUseCase = new CreatePatientUseCase(repository);
const updatePatientUseCase = new UpdatePatientUseCase(repository);
const getPatientUseCase = new GetPatientUseCase(repository);
const listPatientsUseCase = new ListPatientsUseCase(repository);
const togglePatientStatusUseCase = new TogglePatientStatusUseCase(repository);
const getPatientByIdNumberUseCase = new GetPatientByIdNumberUseCase(repository);

export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (filters?: PatientFilters) => [...patientKeys.lists(), filters] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
  byIdNumber: (idNumber: string) => [...patientKeys.all, 'byIdNumber', idNumber] as const,
};

export const usePatients = (filters?: PatientFilters, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: patientKeys.list(filters),
    queryFn: () => listPatientsUseCase.execute(filters),
    enabled: options?.enabled !== false,
  });
};

export const usePatient = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => getPatientUseCase.execute(id),
    enabled: !!id && options?.enabled !== false,
  });
};

export const usePatientByIdNumber = (idNumber: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: patientKeys.byIdNumber(idNumber),
    queryFn: () => getPatientByIdNumberUseCase.execute(idNumber),
    enabled: !!idNumber && options?.enabled !== false,
  });
};

export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePatientDTO) => createPatientUseCase.execute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePatientDTO }) =>
      updatePatientUseCase.execute(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(variables.id) });
    },
  });
};

export const useTogglePatientStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      togglePatientStatusUseCase.execute(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(variables.id) });
    },
  });
};
