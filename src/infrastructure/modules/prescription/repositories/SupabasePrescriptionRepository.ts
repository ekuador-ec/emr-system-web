import type { PrescriptionRepository } from "@/domain/modules/prescription/repositories/PrescriptionRepository";
import type {
  CreatePrescriptionPayload,
  MedicalPrescription,
  PrescriptionDiagnosisInput,
  UpdatePrescriptionPayload,
} from "@/domain/modules/prescription/models/MedicalPrescription";
import type { DocumentType } from "@/domain/modules/document/models/ClinicalDocument";
import { PrescriptionMapper } from "../mappers/PrescriptionMapper";
import { supabase } from "@/infrastructure/core/supabaseClient";

const SELECT_DETAIL = `
  *,
  medical_prescription_diagnoses(*)
`;

function nullIfBlank(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export class SupabasePrescriptionRepository implements PrescriptionRepository {
  private async getUserId(): Promise<string> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("No authenticated user found");
    return user.id;
  }

  private async replaceDiagnoses(
    prescriptionId: string,
    diagnoses: PrescriptionDiagnosisInput[] | undefined,
  ): Promise<void> {
    if (diagnoses === undefined) return;

    const { error: deleteError } = await supabase
      .from("medical_prescription_diagnoses")
      .delete()
      .eq("prescription_id", prescriptionId);
    if (deleteError) {
      throw new Error(`Error replacing prescription diagnoses: ${deleteError.message}`);
    }

    if (diagnoses.length === 0) return;

    const rows = diagnoses.map((diagnosis, index) => ({
      prescription_id: prescriptionId,
      cie10_id: diagnosis.cie10Id,
      cie10_code: diagnosis.cie10Code,
      cie10_description: diagnosis.cie10Description,
      display_order: index,
    }));

    const { error: insertError } = await supabase
      .from("medical_prescription_diagnoses")
      .insert(rows);
    if (insertError) {
      throw new Error(`Error saving prescription diagnoses: ${insertError.message}`);
    }
  }

  async create(payload: CreatePrescriptionPayload): Promise<MedicalPrescription> {
    const userId = await this.getUserId();

    const { data: inserted, error } = await supabase
      .from("medical_prescriptions")
      .insert({
        medical_record_id: payload.medicalRecordId,
        source_document_type: payload.sourceDocumentType,
        source_document_id: payload.sourceDocumentId,
        status: "BORRADOR",
        issue_date: payload.issueDate ?? undefined,
        validity_date: payload.validityDate ?? undefined,
        allergies: nullIfBlank(payload.allergies),
        rp_text: nullIfBlank(payload.rpText),
        indications_text: nullIfBlank(payload.indicationsText),
        created_by: userId,
      })
      .select("id")
      .single();

    if (error) throw new Error(`Error creating prescription: ${error.message}`);

    await this.replaceDiagnoses(inserted.id, payload.diagnoses);

    return this.getById(inserted.id);
  }

  async update(id: string, payload: UpdatePrescriptionPayload): Promise<MedicalPrescription> {
    const updateData: Record<string, unknown> = {};
    if (payload.issueDate !== undefined) updateData.issue_date = payload.issueDate;
    if (payload.validityDate !== undefined) updateData.validity_date = payload.validityDate;
    if (payload.allergies !== undefined) updateData.allergies = nullIfBlank(payload.allergies);
    if (payload.rpText !== undefined) updateData.rp_text = nullIfBlank(payload.rpText);
    if (payload.indicationsText !== undefined) {
      updateData.indications_text = nullIfBlank(payload.indicationsText);
    }

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from("medical_prescriptions")
        .update(updateData)
        .eq("id", id);
      if (error) throw new Error(`Error updating prescription: ${error.message}`);
    }

    await this.replaceDiagnoses(id, payload.diagnoses);

    return this.getById(id);
  }

  async emit(id: string): Promise<MedicalPrescription> {
    const { data, error } = await supabase
      .from("medical_prescriptions")
      .update({ status: "EMITIDA" })
      .eq("id", id)
      .select("id");

    if (error) throw new Error(`Error emitting prescription: ${error.message}`);
    if (!data || data.length === 0) {
      throw new Error(
        "No se pudo emitir la receta. Solo el autor (médico que la creó) puede emitirla.",
      );
    }

    return this.getById(id);
  }

  async delete(id: string): Promise<void> {
    const { data, error } = await supabase
      .from("medical_prescriptions")
      .delete()
      .eq("id", id)
      .select("id");

    if (error) throw new Error(`Error deleting prescription: ${error.message}`);
    if (!data || data.length === 0) {
      throw new Error(
        "No se pudo eliminar la receta. Solo el autor puede eliminar su borrador (las recetas emitidas son inmutables).",
      );
    }
  }

  async getById(id: string): Promise<MedicalPrescription> {
    const { data, error } = await supabase
      .from("medical_prescriptions")
      .select(SELECT_DETAIL)
      .eq("id", id)
      .single();

    if (error) throw new Error(`Error fetching prescription: ${error.message}`);

    return PrescriptionMapper.toDomain(data);
  }

  async listByDocument(
    sourceDocumentType: DocumentType,
    sourceDocumentId: string,
  ): Promise<MedicalPrescription[]> {
    const { data, error } = await supabase
      .from("medical_prescriptions")
      .select(SELECT_DETAIL)
      .eq("source_document_type", sourceDocumentType)
      .eq("source_document_id", sourceDocumentId)
      .order("created_at", { ascending: true });

    if (error) throw new Error(`Error fetching prescriptions: ${error.message}`);

    return (data ?? []).map(PrescriptionMapper.toDomain);
  }
}
