import { useFormContext } from 'react-hook-form';
import type { UpdateEvolutionDraftFormValues } from '../../schemas/evolution.schema';

export function TabSignosVitales() {
  const { register } = useFormContext<UpdateEvolutionDraftFormValues>();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* S4: Signos Vitales */}
      <section>
        <h2 style={{ marginTop: 0, fontSize: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
          4. Signos Vitales y Mediciones
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>PA Derecha</label>
            <input type="text" {...register('bpRight')} placeholder="120/80" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>PA Izquierda</label>
            <input type="text" {...register('bpLeft')} placeholder="120/80" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Temp. Bucal (°C)</label>
            <input type="number" step="0.1" {...register('temperature', { valueAsNumber: true })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Frec. Cardíaca (lpm)</label>
            <input type="number" {...register('heartRate', { valueAsNumber: true })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Frec. Respiratoria (rpm)</label>
            <input type="number" {...register('respiratoryRate', { valueAsNumber: true })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Sat. Oxígeno (%)</label>
            <input type="number" {...register('oxygenSaturation', { valueAsNumber: true })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Peso (kg)</label>
            <input type="number" step="0.1" {...register('weight', { valueAsNumber: true })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Talla (m)</label>
            <input type="number" step="0.01" {...register('height', { valueAsNumber: true })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>IMC</label>
            <input type="number" step="0.01" {...register('bmi', { valueAsNumber: true })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Reacción Pupilar Der.</label>
            <input type="text" {...register('rightPupilReaction')} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Reacción Pupilar Izq.</label>
            <input type="text" {...register('leftPupilReaction')} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Llenado Capilar (seg)</label>
            <input type="number" {...register('capillaryRefillTime', { valueAsNumber: true })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
        </div>

        <h3 style={{ marginTop: 'var(--space-6)', fontSize: '1rem', color: 'var(--color-text-secondary)' }}>Escala de Glasgow</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Ocular (1-4)</label>
            <input type="number" min="1" max="4" {...register('glasgowOcular', { valueAsNumber: true })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Verbal (1-5)</label>
            <input type="number" min="1" max="5" {...register('glasgowVerbal', { valueAsNumber: true })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Motora (1-6)</label>
            <input type="number" min="1" max="6" {...register('glasgowMotor', { valueAsNumber: true })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Total</label>
            <input type="number" min="3" max="15" {...register('glasgowTotal', { valueAsNumber: true })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }} readOnly />
          </div>
        </div>
      </section>

      {/* S7: Obstetricia */}
      <section>
        <h2 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', margin: 0 }}>
          7. Emergencia Obstétrica (Opcional)
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Gestas</label>
            <input type="number" {...register('gestations', { valueAsNumber: true })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Partos</label>
            <input type="number" {...register('parturitions', { valueAsNumber: true })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Abortos</label>
            <input type="number" {...register('abortions', { valueAsNumber: true })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Cesáreas</label>
            <input type="number" {...register('cesareans', { valueAsNumber: true })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Fecha Última Menstruación</label>
            <input type="date" {...register('lastMenstruationDate')} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Semanas Gestación</label>
            <input type="number" {...register('gestationalWeeks', { valueAsNumber: true })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" {...register('fetalMovement')} />
              <span>Movimiento Fetal</span>
            </label>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Frec. Cardíaca Fetal</label>
            <input type="number" {...register('fetalHeartRate', { valueAsNumber: true })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" {...register('rupturedMembranes')} />
              <span>Membranas Rotas</span>
            </label>
            <input type="text" {...register('rupturedTime')} placeholder="Tiempo de ruptura" style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Altura Uterina</label>
            <input type="number" step="0.1" {...register('uterineHeight', { valueAsNumber: true })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Presentación</label>
            <input type="text" {...register('presentation')} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Dilatación</label>
            <input type="number" {...register('dilation', { valueAsNumber: true })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Borramiento</label>
            <input type="number" {...register('effacement', { valueAsNumber: true })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Plano</label>
            <input type="text" {...register('plane')} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 4' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" {...register('usefulPelvis')} />
                <span>Pelvis Útil</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" {...register('vaginalBleeding')} />
                <span>Sangrado Vaginal</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" {...register('contractions')} />
                <span>Contracciones</span>
              </label>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
