import { useFormContext, useFieldArray } from 'react-hook-form';
import type { UpdateEvolutionDraftFormValues } from '../../schemas/evolution.schema';
import { Icon } from '@/presentation/modules/shared/components/Sidebar/icons/Icon';
import WcButton from '@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton';

export function TabPlanTratamiento() {
  const { control, register } = useFormContext<UpdateEvolutionDraftFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'treatmentPlans',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <section
        style={{
          backgroundColor: 'var(--color-surface)',
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '12px',
            marginBottom: 'var(--space-4)',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '1.125rem' }}>13. Plan de Tratamiento</h2>
            <p
              style={{
                margin: 0,
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary)',
                marginTop: '4px',
              }}
            >
              Registre cada línea del plan con su indicación, medicamento y posología.
            </p>
          </div>
          <WcButton
            variant="terciary"
            onClick={() => append({ indication: '', medication: '', posology: '' })}
          >
            <Icon name="icon-add" size={16} /> Agregar fila
          </WcButton>
        </div>

        {fields.length === 0 ? (
          <p
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: '0.875rem',
              textAlign: 'center',
              padding: '32px',
            }}
          >
            No hay líneas de tratamiento. Haz clic en "Agregar fila".
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr) 36px',
                gap: 'var(--space-2)',
                padding: '0 var(--space-2)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
              }}
            >
              <span>Indicación</span>
              <span>Medicamento</span>
              <span>Posología</span>
              <span aria-hidden="true" />
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr) 36px',
                  gap: 'var(--space-2)',
                  alignItems: 'center',
                  padding: 'var(--space-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-bg)',
                }}
              >
                <input
                  type="text"
                  placeholder="Ej. Hidratación"
                  {...register(`treatmentPlans.${index}.indication` as const)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                  }}
                />
                <input
                  type="text"
                  placeholder="Ej. Solución salina 0.9%"
                  {...register(`treatmentPlans.${index}.medication` as const)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                  }}
                />
                <input
                  type="text"
                  placeholder="Ej. 500 ml IV en 30 min"
                  {...register(`treatmentPlans.${index}.posology` as const)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label={`Eliminar fila ${index + 1}`}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-danger)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Icon name="icon-trash" size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
