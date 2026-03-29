import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseOrganizationConfigRepository } from '@/infrastructure/modules/medical-record/repositories/SupabaseOrganizationConfigRepository';
import { GetOrganizationConfigUseCase } from '@/application/modules/medical-record/use-cases/GetOrganizationConfigUseCase';
import { UpdateOrganizationConfigUseCase } from '@/application/modules/medical-record/use-cases/UpdateOrganizationConfigUseCase';
import type { OrganizationConfig } from '@/domain/modules/medical-record/models/OrganizationConfig';

const repository = new SupabaseOrganizationConfigRepository();
const getUseCase = new GetOrganizationConfigUseCase(repository);
const updateUseCase = new UpdateOrganizationConfigUseCase(repository);

export const useOrganizationConfig = () => {
  return useQuery({
    queryKey: ['organization-config'],
    queryFn: () => getUseCase.execute(),
  });
};

export const useUpdateOrganizationConfig = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (config: Partial<OrganizationConfig>) => updateUseCase.execute(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-config'] });
    },
  });
};
