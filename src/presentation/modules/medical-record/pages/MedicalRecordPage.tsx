import { useParams } from 'react-router-dom';
import { MedicalRecordHeader } from '@/presentation/modules/medical-record/components/header/MedicalRecordHeader';
import { MedicalRecordSummary } from '@/presentation/modules/medical-record/components/summary/MedicalRecordSummary';
import { MedicalRecordEvolutionsList } from '@/presentation/modules/medical-record/components/evolutions/MedicalRecordEvolutionsList';
import { useMedicalRecordByPatient } from '@/presentation/modules/medical-record/hooks/useMedicalRecord';
import { PatientDetailsDrawer } from '@/presentation/modules/patient/components/Patients/PatientDetailsDrawer';
import { MedicalRecordAiAssistant } from '@/presentation/modules/ai/components/MedicalRecordAiAssistant';

export function MedicalRecordPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const { data: medicalRecord } = useMedicalRecordByPatient(patientId || '');

  if (!patientId) {
    return (
      <div style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--color-danger)" }}>
        ID de paciente invalido.
      </div>
    );
  }

  return (
    <div style={{ padding: "var(--space-6) var(--space-8)", maxWidth: "960px", margin: "0 auto" }}>
      <MedicalRecordHeader />

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        <MedicalRecordSummary patientId={patientId} />

        {medicalRecord && (
          <>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <MedicalRecordAiAssistant patientId={patientId} />
            </div>
            <MedicalRecordEvolutionsList medicalRecordId={medicalRecord.id} />
          </>
        )}
      </div>

      <PatientDetailsDrawer />
    </div>
  );
}
