import { useFormContext, useFieldArray } from 'react-hook-form';
import type { UpdateEvolutionDraftFormValues } from '../../schemas/evolution.schema';
import { Icon } from '@/presentation/modules/shared/components/Sidebar/icons/Icon';
import WcButton from '@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton';

export function TabExamen() {
  const { control, register } = useFormContext<UpdateEvolutionDraftFormValues>();
  
  const { fields: systemsFields, append: appendSystem, remove: removeSystem } = useFieldArray({
    control,
    name: "systemsReview"
  });

  const { fields: examFields, append: appendExam, remove: removeExam } = useFieldArray({
    control,
    name: "physicalExams"
  });

  const { fields: injuryFields, append: appendInjury, remove: removeInjury } = useFieldArray({
    control,
    name: "injuries"
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      
      {/* S3: Revisión de Sistemas */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>3. Revisión de Sistemas</h2>
          <WcButton variant="secondary" onClick={() => appendSystem({ condition: 'CONDICION_ESTABLE', description: '' })}>
            <Icon name="icon-plus" size={16} /> Agregar
          </WcButton>
        </div>
        
        {systemsFields.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '16px' }}>No hay revisiones registradas. Haz clic en "Agregar".</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {systemsFields.map((field, index) => (
              <div key={field.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '16px', backgroundColor: 'var(--color-bg)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Condición</label>
                  <select {...register(`systemsReview.${index}.condition` as const)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                    <option value="VIA_AEREA_LIBRE">Vía aérea libre</option>
                    <option value="VIA_AEREA_OBSTRUIDA">Vía aérea obstruida</option>
                    <option value="CONDICION_ESTABLE">Condición Estable</option>
                    <option value="CONDICION_INESTABLE">Condición Inestable</option>
                  </select>
                </div>
                <div style={{ flex: 3 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Descripción</label>
                  <input type="text" {...register(`systemsReview.${index}.description` as const)} placeholder="Cronología, localización, características..." style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
                </div>
                <button type="button" onClick={() => removeSystem(index)} style={{ marginTop: '24px', background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '8px' }}>
                  <Icon name="icon-trash" size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* S5: Examen Físico */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>5. Examen Físico Regional</h2>
          <WcButton variant="secondary" onClick={() => appendExam({ region: 'OTRO', hasPathology: false, description: '' })}>
            <Icon name="icon-plus" size={16} /> Agregar
          </WcButton>
        </div>

        {examFields.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '16px' }}>No hay exámenes registrados. Haz clic en "Agregar".</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {examFields.map((field, index) => (
              <div key={field.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '16px', backgroundColor: 'var(--color-bg)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Región</label>
                  <select {...register(`physicalExams.${index}.region` as const)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                    <option value="CABEZA">Cabeza</option>
                    <option value="CUELLO">Cuello</option>
                    <option value="TORAX">Tórax</option>
                    <option value="ABDOMEN">Abdomen</option>
                    <option value="COLUMNA">Columna</option>
                    <option value="PELVIS">Pelvis</option>
                    <option value="EXTREMIDADES">Extremidades</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" {...register(`physicalExams.${index}.hasPathology` as const)} />
                    <span>Con Patología (CP)</span>
                  </label>
                </div>
                <div style={{ flex: 3 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Hallazgos</label>
                  <input type="text" {...register(`physicalExams.${index}.description` as const)} placeholder="Descripción de la patología..." style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
                </div>
                <button type="button" onClick={() => removeExam(index)} style={{ marginTop: '24px', background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '8px' }}>
                  <Icon name="icon-trash" size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* S6: Lesiones */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>6. Localización de Lesiones</h2>
          <WcButton variant="secondary" onClick={() => appendInjury({ injuryType: 'OTRO' })}>
            <Icon name="icon-plus" size={16} /> Agregar
          </WcButton>
        </div>

        {injuryFields.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '16px' }}>No hay lesiones registradas. Haz clic en "Agregar".</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px' }}>
            {injuryFields.map((field, index) => (
              <div key={field.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'var(--color-bg)', borderRadius: '24px', border: '1px solid var(--color-border)' }}>
                <select {...register(`injuries.${index}.injuryType` as const)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
                  <option value="HERIDA_PENETRANTE">Herida Penetrante</option>
                  <option value="HERIDA_CORTANTE">Herida Cortante</option>
                  <option value="FRACTURA_CERRADA">Fractura Cerrada</option>
                  <option value="CUERPO_EXTRANO">Cuerpo Extraño</option>
                  <option value="HEMORRAGIA">Hemorragia</option>
                  <option value="MORDEDURA">Mordedura</option>
                  <option value="PICADURA">Picadura</option>
                  <option value="EXCORIACION">Excoriación</option>
                  <option value="DEFORMIDAD_MASA">Deformidad o Masa</option>
                  <option value="HEMATOMA">Hematoma</option>
                  <option value="ERITEMA_INFLAMACION">Eritema / Inflamación</option>
                  <option value="LUXACION_ESGUINCE">Luxación / Esguince</option>
                  <option value="QUEMADURA">Quemadura</option>
                  <option value="OTRO">Otro</option>
                </select>
                <button type="button" onClick={() => removeInjury(index)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '0 4px', display: 'flex', alignItems: 'center' }}>
                  <Icon name="icon-x" size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
