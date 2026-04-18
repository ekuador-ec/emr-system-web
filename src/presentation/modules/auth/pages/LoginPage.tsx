import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/presentation/modules/auth/hooks/useAuth'
import { usePasswordReset } from '@/presentation/modules/auth/hooks/usePasswordReset'
import { ThemeToggle } from '@/presentation/modules/shared/components/ThemeToggle'
import { EkLogo } from '@/presentation/modules/shared/components/branding/EkLogo'
import { Footer } from '@/presentation/modules/shared/components/branding/Footer'
import { PasswordInput } from '@/presentation/modules/shared/components/PasswordInput'
import { 
  loginSchema, 
  resetPasswordRequestSchema,
  type LoginFormData,
  type ResetPasswordRequestFormData 
} from '@/presentation/modules/auth/schemas/auth.schema'

export function LoginPage() {
  const { login, isLoggingIn, isAuthenticated, isLoading, loginError } = useAuth()
  const navigate = useNavigate()

  const [isRecovering, setIsRecovering] = useState(false)
  const [recoverySuccess, setRecoverySuccess] = useState(false)
  const { mutateAsync: requestPasswordReset, isPending: isResetting } = usePasswordReset()

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
  
  const loginErrorMessage = loginError instanceof Error ? loginError.message : null

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

  const companyLogoUrl = import.meta.env.VITE_COMPANY_LOGO_URL || '/favicon.ico'
  const companyType = import.meta.env.VITE_COMPANY_TYPE || 'Centro Médico'
  const companyName = import.meta.env.VITE_COMPANY_NAME || 'Entorno de Pruebas'

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* EK Logo - Desktop only */}
      <div
        style={{
          position: 'absolute',
          top: 'var(--space-4)',
          left: 'var(--space-8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        className="hidden-mobile"
      >
        <EkLogo size='sm'/>
      </div>

      {/* Theme toggle - All devices */}
      <div style={{ position: 'absolute', top: 'var(--space-4)', right: 'var(--space-4)' }}>
        <ThemeToggle />
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-4)',
          gap: 'var(--space-6)',
        }}
      >
        {/* Company header */}
        {(companyLogoUrl || companyType || companyName) && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: 'var(--space-2) var(--space-6)',
              minHeight: '72px',
              maxWidth: '420px',
              margin: '0 auto',
              boxSizing: 'border-box',
            }}
          >
            {/* Logo solo visible en desktop */}
            {companyLogoUrl && (
              <div className="hidden-mobile" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', height: '56px' }}>
                <img
                  src={companyLogoUrl}
                  alt="Logo de la empresa"
                  style={{
                    height: '56px',
                    width: '56px',
                    objectFit: 'cover',
                    borderRadius: '50%',
                    display: 'block',
                  }}
                />
              </div>
            )}
            {(companyType || companyName) && (
              <div
                className="company-header-texts"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  height: '56px',
                  lineHeight: 1.1,
                  alignItems: 'flex-start',
                  minWidth: 0,
                  flex: 1,
                  overflow: 'hidden',
                  textAlign: 'center',
                }}
              >
                {/* Desktop: alineado a la izquierda, Mobile: centrado */}
                <div className="show-mobile" style={{ width: '100%', alignItems: 'center', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                  {companyType && (
                    <h2
                      style={{
                        margin: 0,
                        fontSize: '1.5rem',
                        fontWeight: 'var(--font-weight-bold)',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.1,
                        width: '100%',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'center',
                      }}
                      title={companyType}
                    >
                      {companyType}
                    </h2>
                  )}
                  {companyType && companyName && (
                    <div style={{ height: '4px' }} />
                  )}
                  {companyName && (
                    <span
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-text-secondary)',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        width: '100%',
                        display: 'block',
                        textAlign: 'center',
                      }}
                      title={companyName}
                    >
                      {companyName}
                    </span>
                  )}
                </div>
                {/* Desktop: alineado a la izquierda */}
                <div className="hidden-mobile" style={{ width: '100%' }}>
                  {companyType && (
                    <h2
                      style={{
                        margin: 0,
                        fontSize: '1.75rem',
                        fontWeight: 'var(--font-weight-bold)',
                        color: 'var(--color-text-primary)',
                        lineHeight: 1.1,
                        width: '100%',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'center',
                      }}
                      title={companyType}
                    >
                      {companyType}
                    </h2>
                  )}
                  {companyType && companyName && (
                    <div style={{ height: '4px' }} />
                  )}
                  {companyName && (
                    <span
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-text-secondary)',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        width: '100%',
                        display: 'block',
                        textAlign: 'center',
                      }}
                      title={companyName}
                    >
                      {companyName}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

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
          {loginErrorMessage && (
            <div
              style={{
                padding: 'var(--space-3)',
                marginBottom: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-danger-light)',
                color: 'var(--color-danger)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                border: '1px solid var(--color-danger)',
              }}
            >
              {loginErrorMessage}
            </div>
          )}
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
            <PasswordInput
              id="login-password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...registerLogin('password')}
              error={!!loginErrors.password}
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

      {/* Footer y logo juntos en mobile, solo logo en mobile, footer global en desktop */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'var(--space-4)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-secondary)',
          gap: 'var(--space-2)',
        }}
      >
        <div className="show-mobile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
          <EkLogo size="sm" />
        </div>
      </div>

      <div className="footer-global">
        <Footer />
      </div>
    </div>
  )
}
