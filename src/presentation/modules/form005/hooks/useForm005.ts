import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateForm005UseCase } from "@/application/modules/form005/use-cases/CreateForm005UseCase";
import { AddForm005EntryUseCase } from "@/application/modules/form005/use-cases/AddForm005EntryUseCase";
import { UpdateForm005EntryUseCase } from "@/application/modules/form005/use-cases/UpdateForm005EntryUseCase";
import { CloseForm005UseCase } from "@/application/modules/form005/use-cases/CloseForm005UseCase";
import { GetForm005ByIdUseCase } from "@/application/modules/form005/use-cases/GetForm005ByIdUseCase";
import { GetForm005ByMedicalRecordUseCase } from "@/application/modules/form005/use-cases/GetForm005ByMedicalRecordUseCase";
import { SupabaseForm005Repository } from "@/infrastructure/modules/form005/repositories/SupabaseForm005Repository";
import { clinicalDocumentKeys } from "@/presentation/modules/document/hooks/useClinicalDocuments";
import type { UserRole } from "@/domain/modules/users/models/User";
import type {
  CreateForm005EntryPayload,
  CreateForm005Payload,
  UpdateForm005EntryPayload,
} from "@/domain/modules/form005/models/Form005Document";

const form005Repository = new SupabaseForm005Repository();
const createForm005UseCase = new CreateForm005UseCase(form005Repository);
const addForm005EntryUseCase = new AddForm005EntryUseCase(form005Repository);
const updateForm005EntryUseCase = new UpdateForm005EntryUseCase(form005Repository);
const closeForm005UseCase = new CloseForm005UseCase(form005Repository);
const getForm005ByIdUseCase = new GetForm005ByIdUseCase(form005Repository);
const getForm005ByMedicalRecordUseCase = new GetForm005ByMedicalRecordUseCase(form005Repository);

export const form005Keys = {
  all: ["form005"] as const,
  lists: () => [...form005Keys.all, "list"] as const,
  listByMedicalRecord: (id: string) => [...form005Keys.lists(), { medicalRecordId: id }] as const,
  details: () => [...form005Keys.all, "detail"] as const,
  detail: (id: string) => [...form005Keys.details(), id] as const,
};

function invalidateDocuments(queryClient: ReturnType<typeof useQueryClient>, medicalRecordId: string) {
  queryClient.invalidateQueries({ queryKey: form005Keys.lists() });
  queryClient.invalidateQueries({ queryKey: form005Keys.listByMedicalRecord(medicalRecordId) });
  queryClient.invalidateQueries({ queryKey: clinicalDocumentKeys.lists() });
}

export function useForm005ByMedicalRecord(medicalRecordId: string) {
  return useQuery({
    queryKey: form005Keys.listByMedicalRecord(medicalRecordId),
    queryFn: () => getForm005ByMedicalRecordUseCase.execute(medicalRecordId),
    enabled: !!medicalRecordId,
  });
}

export function useForm005(id: string) {
  return useQuery({
    queryKey: form005Keys.detail(id),
    queryFn: () => getForm005ByIdUseCase.execute(id),
    enabled: !!id,
  });
}

export function useCreateForm005() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateForm005Payload) => createForm005UseCase.execute(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: form005Keys.detail(data.id) });
      invalidateDocuments(queryClient, data.medicalRecordId);
    },
  });
}

export function useAddForm005Entry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, payload }: { documentId: string; payload: CreateForm005EntryPayload }) =>
      addForm005EntryUseCase.execute(documentId, payload),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: form005Keys.detail(result.document.id) });
      invalidateDocuments(queryClient, result.document.medicalRecordId);
    },
  });
}

export function useUpdateForm005Entry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentId,
      entryId,
      payload,
    }: {
      documentId: string;
      entryId: string;
      payload: UpdateForm005EntryPayload;
    }) => updateForm005EntryUseCase.execute(documentId, entryId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: form005Keys.detail(data.id) });
      invalidateDocuments(queryClient, data.medicalRecordId);
    },
  });
}

export function useCloseForm005() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, actorRole }: { id: string; actorRole: UserRole | undefined }) =>
      closeForm005UseCase.execute(id, actorRole),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: form005Keys.detail(data.id) });
      invalidateDocuments(queryClient, data.medicalRecordId);
    },
  });
}
