import type { MedicalRecord } from '@/domain/modules/medical-record/models/MedicalRecord';

export const MedicalRecordMapper = {
  toDomain: (data: any, evolutionCount = 0): MedicalRecord => {
    const creatorName = data.creator
      ? `${data.creator.first_name} ${data.creator.last_name}`.trim()
      : null;
    const updaterName = data.updater
      ? `${data.updater.first_name} ${data.updater.last_name}`.trim()
      : null;

    let patientName: string | null = null;
    let patientIdNumber: string | null = null;
    let patientGender: string | null = null;
    let patientBloodType: string | null = null;
    if (data.patient) {
      const p = data.patient;
      patientName = `${p.first_name} ${p.last_name} ${p.second_last_name || ''}`.trim();
      patientIdNumber = p.id_number || null;
      patientGender = p.gender || null;
      patientBloodType = p.blood_type || null;
    }

    return {
      id: data.id,
      patientId: data.patient_id,
      isActive: data.is_active,
      createdBy: data.created_by,
      updatedBy: data.updated_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdByName: creatorName,
      updatedByName: updaterName,
      patientName,
      patientIdNumber,
      patientGender,
      patientBloodType,
      evolutionCount,
    };
  },
};
