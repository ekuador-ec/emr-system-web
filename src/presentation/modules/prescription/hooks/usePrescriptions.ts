import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreatePrescriptionUseCase } from "@/application/modules/prescription/use-cases/CreatePrescriptionUseCase";
import { UpdatePrescriptionUseCase } from "@/application/modules/prescription/use-cases/UpdatePrescriptionUseCase";
import { EmitPrescriptionUseCase } from "@/application/modules/prescription/use-cases/EmitPrescriptionUseCase";
import { DeletePrescriptionUseCase } from "@/application/modules/prescription/use-cases/DeletePrescriptionUseCase";
import { GetPrescriptionByIdUseCase } from "@/application/modules/prescription/use-cases/GetPrescriptionByIdUseCase";
import { ListPrescriptionsByDocumentUseCase } from "@/application/modules/prescription/use-cases/ListPrescriptionsByDocumentUseCase";
import { GetPrescriptionCountsByMedicalRecordUseCase } from "@/application/modules/prescription/use-cases/GetPrescriptionCountsByMedicalRecordUseCase";
import { SupabasePrescriptionRepository } from "@/infrastructure/modules/prescription/repositories/SupabasePrescriptionRepository";
import type {
  CreatePrescriptionPayload,
  UpdatePrescriptionPayload,
} from "@/domain/modules/prescription/models/MedicalPrescription";
import type { DocumentType } from "@/domain/modules/document/models/ClinicalDocument";

const prescriptionRepository = new SupabasePrescriptionRepository();
const createPrescriptionUseCase = new CreatePrescriptionUseCase(prescriptionRepository);
const updatePrescriptionUseCase = new UpdatePrescriptionUseCase(prescriptionRepository);
const emitPrescriptionUseCase = new EmitPrescriptionUseCase(prescriptionRepository);
const deletePrescriptionUseCase = new DeletePrescriptionUseCase(prescriptionRepository);
const getPrescriptionByIdUseCase = new GetPrescriptionByIdUseCase(prescriptionRepository);
const listPrescriptionsByDocumentUseCase = new ListPrescriptionsByDocumentUseCase(
  prescriptionRepository,
);
const getPrescriptionCountsUseCase = new GetPrescriptionCountsByMedicalRecordUseCase(
  prescriptionRepository,
);

export const prescriptionKeys = {
  all: ["prescriptions"] as const,
  lists: () => [...prescriptionKeys.all, "list"] as const,
  listByDocument: (type: DocumentType, id: string) =>
    [...prescriptionKeys.lists(), { type, id }] as const,
  counts: () => [...prescriptionKeys.all, "counts"] as const,
  countsByMedicalRecord: (medicalRecordId: string) =>
    [...prescriptionKeys.counts(), medicalRecordId] as const,
  details: () => [...prescriptionKeys.all, "detail"] as const,
  detail: (id: string) => [...prescriptionKeys.details(), id] as const,
};

export type PrescriptionCountMap = Record<string, number>;

function buildCountKey(type: DocumentType, id: string): string {
  return `${type}:${id}`;
}

export function usePrescriptionCountsByMedicalRecord(medicalRecordId: string | null) {
  return useQuery({
    queryKey: prescriptionKeys.countsByMedicalRecord(medicalRecordId ?? ""),
    queryFn: () => getPrescriptionCountsUseCase.execute(medicalRecordId!),
    enabled: Boolean(medicalRecordId),
    select: (counts): PrescriptionCountMap => {
      const map: PrescriptionCountMap = {};
      for (const entry of counts) {
        map[buildCountKey(entry.sourceDocumentType, entry.sourceDocumentId)] = entry.count;
      }
      return map;
    },
  });
}

export function prescriptionCountKey(type: DocumentType, id: string): string {
  return buildCountKey(type, id);
}

export function usePrescriptionsByDocument(
  sourceDocumentType: DocumentType | null,
  sourceDocumentId: string | null,
) {
  return useQuery({
    queryKey: prescriptionKeys.listByDocument(
      (sourceDocumentType ?? "FORM_008") as DocumentType,
      sourceDocumentId ?? "",
    ),
    queryFn: () =>
      listPrescriptionsByDocumentUseCase.execute(sourceDocumentType!, sourceDocumentId!),
    enabled: Boolean(sourceDocumentType && sourceDocumentId),
  });
}

export function usePrescription(id: string | null) {
  return useQuery({
    queryKey: prescriptionKeys.detail(id ?? ""),
    queryFn: () => getPrescriptionByIdUseCase.execute(id!),
    enabled: Boolean(id),
  });
}

function invalidateDocument(
  queryClient: ReturnType<typeof useQueryClient>,
  type: DocumentType,
  id: string,
) {
  queryClient.invalidateQueries({ queryKey: prescriptionKeys.listByDocument(type, id) });
  queryClient.invalidateQueries({ queryKey: prescriptionKeys.lists() });
  queryClient.invalidateQueries({ queryKey: prescriptionKeys.counts() });
}

export function useCreatePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePrescriptionPayload) =>
      createPrescriptionUseCase.execute(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.detail(data.id) });
      invalidateDocument(queryClient, data.sourceDocumentType, data.sourceDocumentId);
    },
  });
}

export function useUpdatePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePrescriptionPayload }) =>
      updatePrescriptionUseCase.execute(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.detail(data.id) });
      invalidateDocument(queryClient, data.sourceDocumentType, data.sourceDocumentId);
    },
  });
}

export function useEmitPrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => emitPrescriptionUseCase.execute(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.detail(data.id) });
      invalidateDocument(queryClient, data.sourceDocumentType, data.sourceDocumentId);
    },
  });
}

export function useDeletePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
    }: {
      id: string;
      sourceDocumentType: DocumentType;
      sourceDocumentId: string;
    }) => deletePrescriptionUseCase.execute(id),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.detail(variables.id) });
      invalidateDocument(queryClient, variables.sourceDocumentType, variables.sourceDocumentId);
    },
  });
}
