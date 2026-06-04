import { create } from "zustand";
import type { DocumentType } from "@/domain/modules/document/models/ClinicalDocument";

export interface PrescriptionsManagerTarget {
  patientId: string;
  medicalRecordId: string;
  sourceDocumentType: DocumentType;
  sourceDocumentId: string;
  parentClosed: boolean;
}

export interface ReadOnlyPrescriptionTarget {
  prescriptionId: string;
  patientId: string;
  medicalRecordId: string;
}

interface PrescriptionUIState {
  managerTarget: PrescriptionsManagerTarget | null;
  openPrescriptionsManager: (target: PrescriptionsManagerTarget) => void;
  closePrescriptionsManager: () => void;

  readOnlyTarget: ReadOnlyPrescriptionTarget | null;
  openReadOnlyPrescription: (target: ReadOnlyPrescriptionTarget) => void;
  closeReadOnlyPrescription: () => void;

  reset: () => void;
}

export const usePrescriptionUIStore = create<PrescriptionUIState>((set) => ({
  managerTarget: null,
  openPrescriptionsManager: (target) => set({ managerTarget: target }),
  closePrescriptionsManager: () => set({ managerTarget: null }),

  readOnlyTarget: null,
  openReadOnlyPrescription: (target) => set({ readOnlyTarget: target }),
  closeReadOnlyPrescription: () => set({ readOnlyTarget: null }),

  reset: () => set({ managerTarget: null, readOnlyTarget: null }),
}));
