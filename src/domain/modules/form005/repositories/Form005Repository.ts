import type {
  CreateForm005EntryPayload,
  CreateForm005Payload,
  Form005Document,
  UpdateForm005EntryPayload,
} from "@/domain/modules/form005/models/Form005Document";

export interface AddForm005EntryResult {
  document: Form005Document;
  entryId: string;
}

export interface Form005Repository {
  create(payload: CreateForm005Payload): Promise<Form005Document>;
  getById(id: string): Promise<Form005Document>;
  getByMedicalRecordId(medicalRecordId: string): Promise<Form005Document[]>;
  addEntry(documentId: string, payload: CreateForm005EntryPayload): Promise<AddForm005EntryResult>;
  updateEntry(
    documentId: string,
    entryId: string,
    payload: UpdateForm005EntryPayload,
  ): Promise<Form005Document>;
  close(id: string): Promise<Form005Document>;
}
