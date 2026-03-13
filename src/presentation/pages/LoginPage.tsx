import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/presentation/hooks/useAuth'
import { ThemeToggle } from '@/presentation/components/ThemeToggle'
import { loginSchema, type LoginFormData } from '@/presentation/schemas/auth.schema'

export function LoginPage() {
  const { login, isLoggingIn, loginError, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  if (isAuthenticated && !isLoading) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data)
      navigate('/', { replace: true })
    } catch {
      // Error is captured in loginError via the mutation
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
      {/* Theme toggle */}
      <div style={{ position: 'absolute', top: 'var(--space-4)', right: 'var(--space-4)' }}>
        <ThemeToggle />
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <h1 style={{ marginBottom: 'var(--space-2)' }}>Iniciar Sesión</h1>
          <p>Ingresa tus credenciales para continuar</p>
        </div>

        {/* Server error */}
        {loginError && (
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
            {loginError.message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label
              htmlFor="login-email"
              style={{ display: 'block', marginBottom: 'var(--space-1)' }}
            >
              Correo electrónico
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              autoFocus
              {...register('email')}
              style={errors.email ? { borderColor: 'var(--color-danger)' } : undefined}
            />
            {errors.email && (
              <small style={{ color: 'var(--color-danger)', marginTop: 'var(--space-1)', display: 'block' }}>
                {errors.email.message}
              </small>
            )}
          </div>

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <label
              htmlFor="login-password"
              style={{ display: 'block', marginBottom: 'var(--space-1)' }}
            >
              Contraseña
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register('password')}
              style={errors.password ? { borderColor: 'var(--color-danger)' } : undefined}
            />
            {errors.password && (
              <small style={{ color: 'var(--color-danger)', marginTop: 'var(--space-1)', display: 'block' }}>
                {errors.password.message}
              </small>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoggingIn}
            style={{
              width: '100%',
              padding: 'var(--space-3) var(--space-4)',
              fontSize: 'var(--font-size-base)',
              opacity: isLoggingIn ? 0.7 : 1,
            }}
          >
            {isLoggingIn ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {/* Footer Login Form */}
        <p
          style={{
            textAlign: 'center',
            marginTop: 'var(--space-6)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
          }}
        >
          Contacta al administrador si no tienes una cuenta
        </p>
      </div>
    </div>
  )
}
