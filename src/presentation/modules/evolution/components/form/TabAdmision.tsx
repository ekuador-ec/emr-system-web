import { useFormContext, useWatch } from 'react-hook-form';
import type { UpdateEvolutionDraftFormValues } from '../../schemas/evolution.schema';
import { useParams } from 'react-router-dom';
import { usePatient } from '@/presentation/modules/patient/hooks/usePatients';
import { usePatientStore } from '@/presentation/modules/patient/stores/usePatientStore';
import { Icon } from '@/presentation/modules/shared/components/Sidebar/icons/Icon';

function calculateAge(birthDate: string | null): { age: number | null; hasBirthDate: boolean } {
  if (!birthDate) return { age: null, hasBirthDate: false };
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return { age, hasBirthDate: true };
}

export function TabAdmision() {
  const { patientId } = useParams<{ patientId: string }>();
  const { data: patient, isLoading } = usePatient(patientId || '');
  const { setSelectedPatientId } = usePatientStore();
  
  const { register, control, formState: { errors } } = useFormContext<UpdateEvolutionDraftFormValues>();
  
  const arrivalMethod = useWatch({ control, name: 'arrivalMethod' });
  const showOtherObservation = arrivalMethod === 'OTRO';

  const ageInfo = calculateAge(patient?.birthDate || null);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
      {/* Columna Izquierda: Información del Paciente */}
      <section style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ margin: 0, fontSize: '1.125rem' }}>
            Información del Paciente
          </h2>
          {patient && (
            <button
              type="button"
              onClick={() => setSelectedPatientId(patient.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '0.875rem',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                color: 'var(--color-text-primary)'
              }}
            >
              <Icon name="icon-see-details" size={16} />
              Detalle Paciente
            </button>
          )}
        </div>
        {isLoading ? (
          <div>Cargando datos del paciente...</div>
        ) : patient ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Nombre Completo</span>
              <span style={{ fontWeight: 500 }}>{patient.firstName} {patient.lastName}</span>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Identificación</span>
              <span style={{ fontWeight: 500 }}>{patient.idNumber}</span>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Edad</span>
              {ageInfo.hasBirthDate ? (
                <span style={{ fontWeight: 500 }}>{ageInfo.age} años</span>
              ) : (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <span 
                    style={{ fontWeight: 500, cursor: 'help', textDecoration: 'underline dotted' }}
                    title="No tiene fecha de nacimiento registrada"
                  >
                    -
                  </span>
                </div>
              )}
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Sexo</span>
              <span style={{ fontWeight: 500 }}>{patient.gender}</span>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Tipo de Sangre</span>
              <span style={{ fontWeight: 500 }}>{patient.bloodType || 'N/A'}</span>
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--color-danger)' }}>No se pudo cargar la información del paciente.</div>
        )}
      </section>

      {/* Columna Derecha: Registro de Admisión */}
      <section style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.125rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', marginBottom: 'var(--space-4)' }}>
          Registro de Admisión
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>
              Forma de llegada <span style={{color: 'var(--color-danger)'}}>*</span>
            </label>
            <select {...register('arrivalMethod')} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: errors.arrivalMethod ? '1px solid var(--color-danger)' : '1px solid var(--color-border)' }}>
              <option value="">Seleccione...</option>
              <option value="AMBULATORIO">Ambulatorio</option>
              <option value="AMBULANCIA">Ambulancia</option>
              <option value="OTRO">Otro Transporte</option>
            </select>
            {errors.arrivalMethod && <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginTop: '4px', display: 'block' }}>{errors.arrivalMethod.message as string}</span>}
          </div>

          {showOtherObservation && (
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>
                Observaciones de Forma de llegada
              </label>
              <textarea {...register('arrivalMethodObservations')} rows={2} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>
              Fuente de información / Referido de
            </label>
            <input type="text" {...register('informationSource')} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>
              Institución o persona que entrega
            </label>
            <input type="text" {...register('referringPerson')} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>
              Número o teléfono de contacto
            </label>
            <input type="text" {...register('contactNumber')} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
        </div>
      </section>
    </div>
  );
}
