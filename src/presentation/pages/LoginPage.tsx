import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/presentation/hooks/useAuth'
import { usePasswordReset } from '@/presentation/hooks/usePasswordReset'
import { ThemeToggle } from '@/presentation/components/ThemeToggle'
import { 
  loginSchema, 
  resetPasswordRequestSchema,
  type LoginFormData,
  type ResetPasswordRequestFormData 
} from '@/presentation/schemas/auth.schema'

export function LoginPage() {
  const { login, isLoggingIn, loginError, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  const [isRecovering, setIsRecovering] = useState(false)
  const [recoverySuccess, setRecoverySuccess] = useState(false)
  const { mutateAsync: requestPasswordReset, isPending: isResetting, error: resetError } = usePasswordReset()

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const {
    register: registerRecovery,
    handleSubmit: handleRecoverySubmit,
    formState: { errors: recoveryErrors },
  } = useForm<ResetPasswordRequestFormData>({
    resolver: zodResolver(resetPasswordRequestSchema),
    defaultValues: {
      email: '',
    },
  })

  if (isAuthenticated && !isLoading) {
    return <Navigate to="/" replace />
  }

  const onLogin = async (data: LoginFormData) => {
    try {
      await login(data)
      navigate('/', { replace: true })
    } catch {
      // Error is captured in loginError via the mutation
    }
  }

  const onRecovery = async (data: ResetPasswordRequestFormData) => {
    try {
      await requestPasswordReset(data.email)
      setRecoverySuccess(true)
    } catch {
      // Error is handled via resetError
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
          <h1 style={{ marginBottom: 'var(--space-2)' }}>
            {isRecovering ? 'Recuperar Contraseña' : 'Iniciar Sesión'}
          </h1>
          <p>
            {isRecovering 
              ? 'Te enviaremos un enlace para restablecerla'
              : 'Ingresa tus credenciales para continuar'}
          </p>
        </div>

        {/* Server error (Login) */}
        {!isRecovering && loginError && (
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

        {/* Server error (Recovery) */}
        {isRecovering && resetError && (
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
            {resetError.message}
          </div>
        )}

        {/* Success message (Recovery) */}
        {isRecovering && recoverySuccess && (
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
            Si existe una cuenta con ese correo, te hemos enviado un enlace para restablecer tu contraseña.
          </div>
        )}

        {!isRecovering ? (
          /* Login Form */
          <form onSubmit={handleLoginSubmit(onLogin)} noValidate>
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
              {...registerLogin('email')}
              style={loginErrors.email ? { borderColor: 'var(--color-danger)' } : undefined}
            />
            {loginErrors.email && (
              <small style={{ color: 'var(--color-danger)', marginTop: 'var(--space-1)', display: 'block' }}>
                {loginErrors.email.message}
              </small>
            )}
          </div>

          <div style={{ marginBottom: 'var(--space-2)' }}>
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
              {...registerLogin('password')}
              style={loginErrors.password ? { borderColor: 'var(--color-danger)' } : undefined}
            />
            {loginErrors.password && (
              <small style={{ color: 'var(--color-danger)', marginTop: 'var(--space-1)', display: 'block' }}>
                {loginErrors.password.message}
              </small>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-6)' }}>
             <button
                type="button"
                onClick={() => setIsRecovering(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontSize: 'var(--font-size-sm)',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline'
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
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
        ) : (
          /* Recovery Form */
          <form onSubmit={handleRecoverySubmit(onRecovery)} noValidate>
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <label
                htmlFor="recovery-email"
                style={{ display: 'block', marginBottom: 'var(--space-1)' }}
              >
                Correo electrónico
              </label>
              <input
                id="recovery-email"
                type="email"
                placeholder="tu@email.com"
                autoComplete="email"
                autoFocus
                {...registerRecovery('email')}
                style={recoveryErrors.email ? { borderColor: 'var(--color-danger)' } : undefined}
                disabled={recoverySuccess}
              />
              {recoveryErrors.email && (
                <small style={{ color: 'var(--color-danger)', marginTop: 'var(--space-1)', display: 'block' }}>
                  {recoveryErrors.email.message}
                </small>
              )}
            </div>

            {!recoverySuccess && (
               <button
                  type="submit"
                  className="btn-primary"
                  disabled={isResetting}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3) var(--space-4)',
                    fontSize: 'var(--font-size-base)',
                    opacity: isResetting ? 0.7 : 1,
                    marginBottom: 'var(--space-4)'
                  }}
                >
                  {isResetting ? 'Enviando...' : 'Enviar enlace'}
                </button>
            )}

            <div style={{ textAlign: 'center' }}>
               <button
                  type="button"
                  onClick={() => setIsRecovering(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--font-size-sm)',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Volver a Iniciar Sesión
                </button>
            </div>
          </form>
        )}

        {/* Footer Login Form */}
        {!isRecovering && (
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
        )}
      </div>
    </div>
  )
}
