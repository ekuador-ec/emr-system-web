import type { DocumentStatus } from "@/domain/modules/document/models/ClinicalDocument";

export interface Form005VitalSigns {
  bpRight: string | null;
  bpLeft: string | null;
  heartRate: number | null;
  respiratoryRate: number | null;
  temperature: number | null;
  bmi: number | null;
  weight: number | null;
  height: number | null;
  rightPupilReaction: string | null;
  leftPupilReaction: string | null;
  capillaryRefillTime: number | null;
  oxygenSaturation: number | null;
  glasgowOcular: number | null;
  glasgowVerbal: number | null;
  glasgowMotor: number | null;
  glasgowTotal: number | null;
}

export interface Form005Entry extends Form005VitalSigns {
  id: string;
  attentionDate: string | null;
  attentionTime: string | null;
  evolutionNote: string | null;
  prescriptions: string | null;
  createdBy: string | null;
  createdByName?: string | null;
  createdByRole?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface Form005Document {
  id: string;
  medicalRecordId: string;
  status: DocumentStatus;
  openedBy: string;
  openedByName?: string;
  closedBy: string | null;
  closedByName?: string | null;
  closedAt: string | null;
  updatedByName?: string | null;
  createdAt: string;
  updatedAt: string;

  entries?: Form005Entry[];
}

export interface CreateForm005Payload {
  medicalRecordId: string;
}

export type CreateForm005EntryPayload = Partial<Form005VitalSigns> & {
  attentionDate?: string | null;
  attentionTime?: string | null;
  evolutionNote?: string | null;
  prescriptions?: string | null;
};

export type UpdateForm005EntryPayload = CreateForm005EntryPayload;
