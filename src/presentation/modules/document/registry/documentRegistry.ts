import type { DocumentType } from "@/domain/modules/document/models/ClinicalDocument";

export interface DocumentTypeDefinition {
  type: DocumentType;
  code: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  createLabel: string;
  workspacePath: (patientId: string, documentId: string) => string;
}

export const DOCUMENT_REGISTRY: Record<DocumentType, DocumentTypeDefinition> = {
  FORM_008: {
    type: "FORM_008",
    code: "008",
    label: "Evolución Médica (Formulario 008)",
    shortLabel: "Formulario 008",
    description:
      "Atención de emergencia: motivo, signos vitales, examen físico, lesiones, diagnósticos CIE-10 y alta médica.",
    icon: "icon-medical-evolution",
    createLabel: "Evolución 008",
    workspacePath: (patientId, documentId) =>
      `/pacientes/${patientId}/historia/evoluciones/${documentId}`,
  },
  FORM_005: {
    type: "FORM_005",
    code: "005",
    label: "Evolución y Prescripciones (Formulario 005)",
    shortLabel: "Formulario 005",
    description:
      "Nota de progreso clínico: signos vitales, narrativa de evolución y prescripciones.",
    icon: "icon-clipboard",
    createLabel: "Formulario 005",
    workspacePath: (patientId, documentId) =>
      `/pacientes/${patientId}/historia/documentos/form005/${documentId}`,
  },
};

export const DOCUMENT_TYPES: DocumentTypeDefinition[] = [
  DOCUMENT_REGISTRY.FORM_008,
  DOCUMENT_REGISTRY.FORM_005,
];

export function getDocumentDefinition(type: DocumentType): DocumentTypeDefinition {
  return DOCUMENT_REGISTRY[type];
}
