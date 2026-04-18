import { useFormContext, useFieldArray, Controller } from 'react-hook-form';
import type { UpdateEvolutionDraftFormValues } from '../../schemas/evolution.schema';
import { Icon } from '@/presentation/modules/shared/components/Sidebar/icons/Icon';
import { Cie10SearchInput } from '@/presentation/modules/patient/components/Patients/Cie10SearchInput';
import WcButton from '@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton';

export function TabDiagnostico() {
  const { control, register, setValue } = useFormContext<UpdateEvolutionDraftFormValues>();
  
  const { fields: diagFields, append: appendDiag, remove: removeDiag } = useFieldArray({
    control,
    name: "diagnoses"
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      
      {/* S11 / S12: Diagnósticos */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>11 / 12. Diagnósticos</h2>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Ingreso y Alta</p>
          </div>
          <WcButton variant="secondary" onClick={() => appendDiag({ type: 'INGRESO', certainty: 'PRESUNTIVO', cie10Id: '', description: '' })}>
            <Icon name="icon-plus" size={16} /> Agregar
          </WcButton>
        </div>

        {diagFields.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '16px', textAlign: 'center', padding: '32px' }}>
            No hay diagnósticos registrados. Haz clic en "Agregar".
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {diagFields.map((field, index) => (
              <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', backgroundColor: 'var(--color-bg)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-text)' }}>Diagnóstico #{index + 1}</h4>
                  <button type="button" onClick={() => removeDiag(index)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                    <Icon name="icon-trash" size={18} />
                  </button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Momento</label>
                    <select {...register(`diagnoses.${index}.type` as const)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                      <option value="INGRESO">Al Ingreso</option>
                      <option value="ALTA">Al Alta</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Certeza</label>
                    <select {...register(`diagnoses.${index}.certainty` as const)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                      <option value="PRESUNTIVO">Presuntivo</option>
                      <option value="DEFINITIVO">Definitivo</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Diagnóstico (CIE-10)</label>
                    <Controller
                      control={control}
                      name={`diagnoses.${index}.cie10Id` as const}
                      render={({ field: controllerField }) => (
                        <Cie10SearchInput
                          value={controllerField.value}
                          onChange={controllerField.onChange}
                          onDescriptionSelect={(desc) => {
                            setValue(`diagnoses.${index}.description` as const, desc, { shouldValidate: true, shouldDirty: true });
                          }}
                        />
                      )}
                    />
                  </div>
                  
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Descripción / Observaciones</label>
                    <input type="text" {...register(`diagnoses.${index}.description` as const)} placeholder="Descripción adicional del diagnóstico..." style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
