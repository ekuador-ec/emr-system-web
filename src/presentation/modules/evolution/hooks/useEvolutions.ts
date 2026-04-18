import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateEvolutionUseCase } from '@/application/modules/evolution/use-cases/CreateEvolutionUseCase';
import { UpdateEvolutionUseCase } from '@/application/modules/evolution/use-cases/UpdateEvolutionUseCase';
import { CloseEvolutionUseCase } from '@/application/modules/evolution/use-cases/CloseEvolutionUseCase';
import { GetEvolutionByIdUseCase } from '@/application/modules/evolution/use-cases/GetEvolutionByIdUseCase';
import { GetEvolutionsByMedicalRecordUseCase } from '@/application/modules/evolution/use-cases/GetEvolutionsByMedicalRecordUseCase';
import { SupabaseEvolutionRepository } from '@/infrastructure/modules/evolution/repositories/SupabaseEvolutionRepository';
import type { CreateEvolutionPayload, UpdateEvolutionPayload } from '@/domain/modules/evolution/models/Evolution';

// Instancias de Use Cases
const evolutionRepository = new SupabaseEvolutionRepository();
const createEvolutionUseCase = new CreateEvolutionUseCase(evolutionRepository);
const updateEvolutionUseCase = new UpdateEvolutionUseCase(evolutionRepository);
const closeEvolutionUseCase = new CloseEvolutionUseCase(evolutionRepository);
const getEvolutionByIdUseCase = new GetEvolutionByIdUseCase(evolutionRepository);
const getEvolutionsByMedicalRecordUseCase = new GetEvolutionsByMedicalRecordUseCase(evolutionRepository);

export const evolutionKeys = {
  all: ['evolutions'] as const,
  lists: () => [...evolutionKeys.all, 'list'] as const,
  listByMedicalRecord: (id: string) => [...evolutionKeys.lists(), { medicalRecordId: id }] as const,
  details: () => [...evolutionKeys.all, 'detail'] as const,
  detail: (id: string) => [...evolutionKeys.details(), id] as const,
};

export function useEvolutionsByMedicalRecord(medicalRecordId: string) {
  return useQuery({
    queryKey: evolutionKeys.listByMedicalRecord(medicalRecordId),
    queryFn: () => getEvolutionsByMedicalRecordUseCase.execute(medicalRecordId),
    enabled: !!medicalRecordId,
  });
}

export function useEvolution(id: string) {
  return useQuery({
    queryKey: evolutionKeys.detail(id),
    queryFn: () => getEvolutionByIdUseCase.execute(id),
    enabled: !!id,
  });
}

export function useCreateEvolution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEvolutionPayload) => createEvolutionUseCase.execute(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: evolutionKeys.listByMedicalRecord(data.medicalRecordId) });
    },
  });
}

export function useUpdateEvolution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEvolutionPayload }) => 
      updateEvolutionUseCase.execute(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: evolutionKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: evolutionKeys.listByMedicalRecord(data.medicalRecordId) });
    },
  });
}

export function useCloseEvolution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => closeEvolutionUseCase.execute(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: evolutionKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: evolutionKeys.listByMedicalRecord(data.medicalRecordId) });
    },
  });
}
