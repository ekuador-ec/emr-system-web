import type {
  CreateForm005EntryPayload,
  Form005Document,
  Form005Entry,
} from "@/domain/modules/form005/models/Form005Document";

function clampNumeric(
  value: number | null | undefined,
  precision: number,
  scale: number,
): number | null {
  if (value === null || value === undefined) return null;
  if (!Number.isFinite(value)) return null;
  const maxAbs = Math.pow(10, precision - scale) - Math.pow(10, -scale);
  if (Math.abs(value) > maxAbs) return null;
  return value;
}

function normalizeHeightMeters(value: number | null | undefined): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  if (value > 3 && value < 300) return value / 100;
  return value;
}

function nullIfBlank(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  return value;
}

function clampInteger(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (!Number.isFinite(value)) return null;
  return Math.round(value);
}

function fullName(profile: { first_name?: string; last_name?: string } | null | undefined): string | null {
  if (!profile) return null;
  const name = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim();
  return name || null;
}

export class Form005Mapper {
  static entryToDomain(item: any): Form005Entry {
    return {
      id: item.id,
      attentionDate: item.attention_date,
      attentionTime: item.attention_time,
      evolutionNote: item.evolution_note ?? null,
      prescriptions: item.prescriptions ?? null,
      bpRight: item.bp_right,
      bpLeft: item.bp_left,
      heartRate: item.heart_rate,
      respiratoryRate: item.respiratory_rate,
      temperature: item.temperature ? parseFloat(item.temperature) : null,
      bmi: item.bmi ? parseFloat(item.bmi) : null,
      weight: item.weight ? parseFloat(item.weight) : null,
      height: item.height ? parseFloat(item.height) : null,
      rightPupilReaction: item.right_pupil_reaction,
      leftPupilReaction: item.left_pupil_reaction,
      capillaryRefillTime: item.capillary_refill_time,
      oxygenSaturation: item.oxygen_saturation,
      glasgowOcular: item.glasgow_ocular,
      glasgowVerbal: item.glasgow_verbal,
      glasgowMotor: item.glasgow_motor,
      glasgowTotal: item.glasgow_total,
      createdBy: item.created_by ?? null,
      createdByName: fullName(item.author),
      createdByRole: item.author?.role ?? null,
      createdAt: item.created_at,
      updatedAt: item.updated_at ?? null,
    };
  }

  static toDomain(data: any): Form005Document {
    const entries: Form005Entry[] = data.form005_entries
      ? [...data.form005_entries]
          .map((item: any) => Form005Mapper.entryToDomain(item))
          .sort((a, b) => {
            const aKey = `${a.attentionDate ?? ""} ${a.attentionTime ?? ""} ${a.createdAt}`;
            const bKey = `${b.attentionDate ?? ""} ${b.attentionTime ?? ""} ${b.createdAt}`;
            return aKey.localeCompare(bKey);
          })
      : [];

    return {
      id: data.id,
      medicalRecordId: data.medical_record_id,
      status: data.status,
      openedBy: data.opened_by,
      openedByName: fullName(data.opener) ?? undefined,
      closedBy: data.closed_by,
      closedByName: fullName(data.closer) ?? undefined,
      closedAt: data.closed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      entries,
    };
  }

  static entryToDatabase(payload: CreateForm005EntryPayload, documentId: string): any {
    return {
      document_id: documentId,
      attention_date: nullIfBlank(payload.attentionDate),
      attention_time: nullIfBlank(payload.attentionTime),
      evolution_note: payload.evolutionNote ?? null,
      prescriptions: payload.prescriptions ?? null,
      bp_right: payload.bpRight ?? null,
      bp_left: payload.bpLeft ?? null,
      heart_rate: clampInteger(payload.heartRate),
      respiratory_rate: clampInteger(payload.respiratoryRate),
      temperature: clampNumeric(payload.temperature, 4, 2),
      bmi: clampNumeric(payload.bmi, 5, 2),
      weight: clampNumeric(payload.weight, 6, 2),
      height: clampNumeric(normalizeHeightMeters(payload.height), 4, 2),
      right_pupil_reaction: payload.rightPupilReaction ?? null,
      left_pupil_reaction: payload.leftPupilReaction ?? null,
      capillary_refill_time: clampInteger(payload.capillaryRefillTime),
      oxygen_saturation: clampInteger(payload.oxygenSaturation),
      glasgow_ocular: clampInteger(payload.glasgowOcular),
      glasgow_verbal: clampInteger(payload.glasgowVerbal),
      glasgow_motor: clampInteger(payload.glasgowMotor),
      glasgow_total: clampInteger(payload.glasgowTotal),
    };
  }
}
