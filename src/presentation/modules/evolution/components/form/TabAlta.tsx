import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import type { UpdateEvolutionDraftFormValues } from '../../schemas/evolution.schema';
import { Icon } from '@/presentation/modules/shared/components/Sidebar/icons/Icon';
import WcButton from '@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton';
import { WcCheckbox } from '@/presentation/modules/shared/components/ui/webcomponents/Checkbox/WcCheckbox';

export function TabAlta() {
  const { control, register } = useFormContext<UpdateEvolutionDraftFormValues>();
  
  const { fields: dischargeFields, append: appendDischarge, remove: removeDischarge } = useFieldArray({
    control,
    name: "discharges"
  });

  const isDeathInEmergency = useWatch({ control, name: 'deathInEmergency' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      
      {/* S13: Alta Médica */}
      <section style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.125rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', marginBottom: 'var(--space-4)' }}>
          13. Alta Médica
        </h2>
        
        <div style={{ marginTop: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500 }}>Condiciones del Alta</label>
            <WcButton variant="secondary" onClick={() => appendDischarge({ dischargeType: 'DOMICILIO' })}>
              <Icon name="icon-plus" size={16} /> Agregar Condición
            </WcButton>
          </div>

          {dischargeFields.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '16px', textAlign: 'center', padding: '16px', backgroundColor: 'var(--color-bg)', borderRadius: '8px' }}>
              No hay condiciones de alta agregadas.
            </p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px', marginBottom: '24px' }}>
              {dischargeFields.map((field, index) => (
                <div key={field.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'var(--color-bg)', borderRadius: '24px', border: '1px solid var(--color-border)' }}>
                  <select {...register(`discharges.${index}.dischargeType` as const)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
                    <option value="DOMICILIO">Domicilio</option>
                    <option value="CONSULTA_EXTERNA">Consulta Externa</option>
                    <option value="OBSERVACION">Observación</option>
                    <option value="INTERNACION">Internación</option>
                    <option value="REFERENCIA">Referencia</option>
                    <option value="EGRESA_VIVO">Egresa Vivo</option>
                    <option value="CONDICION_ESTABLE">Condición Estable</option>
                    <option value="CONDICION_INESTABLE">Condición Inestable</option>
                    <option value="DIAS_INCAPACIDAD">Días de Incapacidad</option>
                  </select>
                  <button type="button" onClick={() => removeDischarge(index)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '0 4px', display: 'flex', alignItems: 'center' }}>
                    <Icon name="icon-x" size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Días de Incapacidad</label>
            <input type="number" {...register('incapacityDays', { valueAsNumber: true })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Servicio de Referencia</label>
            <input type="text" {...register('referralService')} placeholder="Si aplica..." style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Establecimiento de Referencia</label>
            <input type="text" {...register('referralFacility')} placeholder="Si aplica..." style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', gridColumn: '1 / -1', padding: '16px', backgroundColor: isDeathInEmergency ? 'var(--color-danger-light)' : 'transparent', borderRadius: '8px', transition: 'background-color 0.3s ease' }}>
            <WcCheckbox 
              {...register('deathInEmergency')} 
              label="¿Registrar muerte en emergencia?" 
              danger={isDeathInEmergency}
            />
            {isDeathInEmergency && (
              <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px', color: 'var(--color-danger)' }}>Causa de Muerte</label>
                <textarea {...register('deathCause')} rows={3} placeholder="Describa la causa..." style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-danger)' }} />
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
