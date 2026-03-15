import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/infrastructure/config/supabaseClient'
import { ThemeToggle } from '@/presentation/components/ThemeToggle'
import { PasswordInput } from '@/presentation/components/PasswordInput'
import { useUpdatePassword } from '@/presentation/hooks/useUpdatePassword'
import { updatePasswordSchema, type UpdatePasswordFormData } from '@/presentation/schemas/auth.schema'

export function UpdatePasswordPage() {
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const { mutateAsync: updatePassword, isPending: isUpdating, error: updateError } = useUpdatePassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setSessionError('El enlace es inválido o ha expirado. Por favor solicita uno nuevo.')
      }
    })
  }, [])

  const onSubmit = async (data: UpdatePasswordFormData) => {
    try {
      await updatePassword(data.password)
      setSuccess(true)
      setTimeout(() => {
         navigate('/', { replace: true })
      }, 3000)
    } catch {
      // Error is caught by updateError
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', top: 'var(--space-4)', right: 'var(--space-4)' }}>
        <ThemeToggle />
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <h1 style={{ marginBottom: 'var(--space-2)' }}>Configurar Contraseña</h1>
          <p>Ingresa tu nueva contraseña para acceder a tu cuenta en el EMR System</p>
        </div>

        {sessionError && (
          <div
            style={{
              padding: 'var(--space-3)',
              marginBottom: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-danger-light)',
              color: 'var(--color-danger)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            {sessionError}
          </div>
        )}

        {updateError && (
          <div
            style={{
              padding: 'var(--space-3)',
              marginBottom: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-danger-light)',
              color: 'var(--color-danger)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            {updateError.message}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: 'var(--space-3)',
              marginBottom: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-success-light)',
              color: 'var(--color-success)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              border: '1px solid var(--color-success)',
            }}
          >
            Contraseña actualizada exitosamente. Redirigiendo...
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label
                htmlFor="new-password"
                style={{ display: 'block', marginBottom: 'var(--space-1)' }}
              >
                Nueva Contraseña
              </label>
              <PasswordInput
                id="new-password"
                placeholder="Mínimo 6 caracteres"
                {...register('password')}
                error={!!errors.password}
                disabled={!!sessionError}
              />
              {errors.password && (
                <small style={{ color: 'var(--color-danger)', marginTop: 'var(--space-1)', display: 'block' }}>
                  {errors.password.message}
                </small>
              )}
            </div>

            <div style={{ marginBottom: 'var(--space-6)' }}>
              <label
                htmlFor="confirm-password"
                style={{ display: 'block', marginBottom: 'var(--space-1)' }}
              >
                Confirmar Contraseña
              </label>
              <PasswordInput
                id="confirm-password"
                placeholder="Repite la contraseña"
                {...register('confirmPassword')}
                error={!!errors.confirmPassword}
                disabled={!!sessionError}
              />
              {errors.confirmPassword && (
                <small style={{ color: 'var(--color-danger)', marginTop: 'var(--space-1)', display: 'block' }}>
                  {errors.confirmPassword.message}
                </small>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isUpdating || !!sessionError}
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-4)',
                fontSize: 'var(--font-size-base)',
                opacity: isUpdating ? 0.7 : 1,
              }}
            >
              {isUpdating ? 'Guardando...' : 'Guardar y Entrar'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
