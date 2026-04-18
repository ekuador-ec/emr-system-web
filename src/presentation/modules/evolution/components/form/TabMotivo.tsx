import { useFormContext } from 'react-hook-form';
import type { UpdateEvolutionDraftFormValues } from '../../schemas/evolution.schema';

export function TabMotivo() {
  const { register } = useFormContext<UpdateEvolutionDraftFormValues>();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* S1: Motivo de consulta */}
      <section>
        <h2 style={{ marginTop: 0, fontSize: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
          1. Motivo de Consulta
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Fecha de Atención</label>
            <input type="date" {...register('attentionDate')} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Hora de Atención</label>
            <input type="time" {...register('attentionTime')} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Causa Clínica</label>
            <select {...register('clinicalCause')} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
              <option value="">Seleccione...</option>
              <option value="TRAUMA">Trauma</option>
              <option value="CAUSA_CLINICA">Causa Clínica</option>
              <option value="CAUSA_GINECOLOGICA_OBSTETRICA">Causa Ginecológica u Obstétrica</option>
              <option value="CAUSA_QUIRURGICA">Causa Quirúrgica</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" {...register('notifyPolice')} />
              <span>¿Notificar a la policía?</span>
            </label>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Descripción del Motivo</label>
            <textarea {...register('clinicalCauseDescription')} rows={3} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
        </div>
      </section>

      {/* S2: Evento */}
      <section>
        <h2 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', margin: 0 }}>
          2. Evento (Accidente, Violencia, Intoxicación)
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Fecha y Hora del Evento</label>
            <input type="datetime-local" {...register('eventDateTime')} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Lugar del Evento</label>
            <input type="text" {...register('eventLocation')} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Dirección del Evento</label>
            <input type="text" {...register('eventAddress')} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" {...register('requiresPoliceCustody')} />
              <span>¿Requiere custodia policial?</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" {...register('alcoholicBreath')} />
              <span>¿Aliento Etílico?</span>
            </label>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Valor Alcocheck</label>
            <input type="number" step="0.01" {...register('alcocheckValue', { valueAsNumber: true })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Tipo de Accidente</label>
            <select {...register('accidentType')} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
              <option value="">Ninguno</option>
              <option value="TRANSITO">Tránsito</option>
              <option value="CAIDA">Caída</option>
              <option value="QUEMADURA">Quemadura</option>
              <option value="MORDEDURA">Mordedura</option>
              <option value="AHOGAMIENTO">Ahogamiento</option>
              <option value="CUERPO_EXTRANO">Cuerpo Extraño</option>
              <option value="APLASTAMIENTO">Aplastamiento</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Tipo de Violencia</label>
            <select {...register('violenceType')} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
              <option value="">Ninguna</option>
              <option value="ARMA_FUEGO">Arma de Fuego</option>
              <option value="RINA">Riña</option>
              <option value="VIOLENCIA_FAMILIAR">Violencia Familiar</option>
              <option value="ABUSO_FISICO">Abuso Físico</option>
              <option value="ABUSO_PSICOLOGICO">Abuso Psicológico</option>
              <option value="ABUSO_SEXUAL">Abuso Sexual</option>
              <option value="OTRO">Otra</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Tipo de Intoxicación</label>
            <select {...register('intoxicationType')} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
              <option value="">Ninguna</option>
              <option value="ALCOHOLICA">Alcohólica</option>
              <option value="ALIMENTARIA">Alimentaria</option>
              <option value="DROGAS">Drogas</option>
              <option value="GASES">Inhalación de Gases</option>
              <option value="ENVENENAMIENTO">Envenenamiento</option>
              <option value="PICADURA">Picadura</option>
              <option value="ANAFILAXIA">Anafilaxia</option>
              <option value="OTRO">Otra</option>
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Observaciones del Evento</label>
            <textarea {...register('eventObservations')} rows={2} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
        </div>
      </section>
    </div>
  );
}
