import { useState, useEffect } from 'react'
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

  // Step state for two-step login: 1 for email, 2 for password
  const [step, setStep] = useState<1 | 2>(1)

  // Cooldown & Brute force mitigation states
  const [, setFailedAttempts] = useState(() => {
    const saved = localStorage.getItem('emr:login:failures')
    return saved ? parseInt(saved, 10) : 0
  })
  
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(() => {
    const until = localStorage.getItem('emr:login:lockout_until')
    if (until) {
      const remaining = Math.ceil((parseInt(until, 10) - Date.now()) / 1000)
      return remaining > 0 ? remaining : 0
    }
    return 0
  })

  const [isLockedOut, setIsLockedOut] = useState(lockoutTimeLeft > 0)

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    trigger: triggerLogin,
    getValues: getValuesLogin,
    setValue: setValueLogin,
    watch: watchLogin,
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
    watch: watchRecovery,
    setValue: setValueRecovery,
  } = useForm<ResetPasswordRequestFormData>({
    resolver: zodResolver(resetPasswordRequestSchema),
    defaultValues: {
      email: '',
    },
  })

  const emailValue = watchLogin('email')
  const recoveryEmailValue = watchRecovery('email')

  if (isAuthenticated && !isLoading) {
    return <Navigate to="/" replace />
  }
  
  const loginErrorMessage = loginError instanceof Error ? loginError.message : null

  // Timer for lockout countdown
  useEffect(() => {
    if (!isLockedOut || lockoutTimeLeft <= 0) {
      if (isLockedOut) {
        setIsLockedOut(false)
        localStorage.removeItem('emr:login:lockout_until')
      }
      return
    }

    const timer = setInterval(() => {
      setLockoutTimeLeft(prev => {
        const next = prev - 1
        if (next <= 0) {
          setIsLockedOut(false)
          localStorage.removeItem('emr:login:lockout_until')
          return 0
        }
        return next
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isLockedOut, lockoutTimeLeft])

  const onLogin = async (data: LoginFormData) => {
    if (isLockedOut) return

    try {
      await login(data)
      setFailedAttempts(0)
      localStorage.removeItem('emr:login:failures')
      localStorage.removeItem('emr:login:lockout_until')
      navigate('/', { replace: true })
    } catch {
      setFailedAttempts(prev => {
        const nextAttempts = prev + 1
        localStorage.setItem('emr:login:failures', nextAttempts.toString())
        
        if (nextAttempts >= 3) {
          const lockoutPeriod = 30 // 30 seconds
          const untilTime = Date.now() + lockoutPeriod * 1000
          localStorage.setItem('emr:login:lockout_until', untilTime.toString())
          setIsLockedOut(true)
          setLockoutTimeLeft(lockoutPeriod)
        }
        return nextAttempts
      })
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

  const handleEmailSubmit = async () => {
    if (isLockedOut) return
    const isEmailValid = await triggerLogin('email')
    if (isEmailValid) {
      setStep(2)
    }
  }

  const handleEmailKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      await handleEmailSubmit()
    }
  }

  const handleGoBack = () => {
    setStep(1)
    setValueLogin('password', '')
  }

  const handleToggleRecovering = (recovering: boolean) => {
    setIsRecovering(recovering)
    if (!recovering) {
      setStep(1)
    }
  }

  const companyLogoUrl = import.meta.env.VITE_COMPANY_LOGO_URL || '/favicon.ico'
  const companyType = import.meta.env.VITE_COMPANY_TYPE || 'Centro Médico'
  const companyName = import.meta.env.VITE_COMPANY_NAME || 'Entorno de Pruebas'

  return (
    <div className="premium-login-container">
      <style>{`
        .premium-login-container {
          height: 100vh;
          height: 100dvh;
          display: flex;
          flex-direction: column;
          position: relative;
          background: var(--color-bg);
          overflow-x: hidden;
          overflow-y: hidden;
          width: 100%;
        }

        .premium-login-card {
          background: rgba(255, 255, 255, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.04), 
                      inset 0 1px 0 rgba(255, 255, 255, 0.8),
                      0 1px 2px rgba(15, 23, 42, 0.05);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: var(--radius-2xl);
          padding: var(--space-8);
          width: 100%;
          max-width: 420px;
          overflow: hidden;
          transition: all var(--transition-normal);
          z-index: 10;
        }
        .dark .premium-login-card {
          background: rgba(30, 30, 35, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }
        .premium-login-card:hover {
          box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.08), 
                      inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }
        .dark .premium-login-card:hover {
          box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.4);
        }

        .premium-input {
          background: rgba(255, 255, 255, 0.5) !important;
          border: 1px solid rgba(40, 32, 84, 0.12) !important;
          transition: all var(--transition-fast) !important;
        }
        .dark .premium-input {
          background: rgba(22, 22, 22, 0.4) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
        }
        .premium-input:focus {
          background: #ffffff !important;
          border-color: var(--color-primary) !important;
          box-shadow: 0 0 0 4px rgba(68, 46, 242, 0.12) !important;
          transform: translateY(-1px);
        }
        .dark .premium-input:focus {
          background: #161616 !important;
          border-color: #ffffff !important;
          box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.08) !important;
        }
        .premium-input-error {
          border-color: var(--color-danger) !important;
        }
        .premium-input-error:focus {
          border-color: var(--color-danger) !important;
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15) !important;
        }

        .btn-premium-action {
          background: var(--color-primary);
          color: var(--color-primary-foreground);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: var(--radius-xl);
          padding: var(--space-3) var(--space-6);
          font-weight: var(--font-weight-bold);
          font-size: var(--font-size-base);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          box-shadow: 0 4px 12px 0 rgba(40, 32, 84, 0.15),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1);
          cursor: pointer;
        }
        .btn-premium-action:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px 0 rgba(40, 32, 84, 0.22);
          filter: brightness(1.08);
        }
        .btn-premium-action:active:not(:disabled) {
          transform: translateY(0);
        }
        .dark .btn-premium-action {
          background: #ffffff;
          color: #09090b;
          box-shadow: 0 4px 12px 0 rgba(255, 255, 255, 0.05);
        }
        .dark .btn-premium-action:hover:not(:disabled) {
          box-shadow: 0 6px 20px 0 rgba(255, 255, 255, 0.15);
        }

        .capsule-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          background: rgba(40, 32, 84, 0.04);
          border: 1px solid rgba(40, 32, 84, 0.08);
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-full);
          width: fit-content;
          margin: 0 auto var(--space-6) auto;
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          transition: all 0.2s ease;
        }
        .dark .capsule-badge {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .capsule-badge:hover {
          background: rgba(40, 32, 84, 0.08);
          transform: translateY(-1px);
        }
        .dark .capsule-badge:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .recovery-link {
          font-family: var(--font-body) !important;
          color: var(--color-text-secondary) !important;
          font-weight: var(--font-weight-regular) !important;
          font-size: var(--font-size-xs) !important;
          text-decoration: none !important;
          transition: color var(--transition-fast) !important;
        }
        .recovery-link:hover:not(:disabled) {
          color: var(--color-text) !important;
          text-decoration: underline !important;
        }

        .btn-back-simple {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1-5) !important;
          background: none !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          font-size: var(--font-size-sm) !important;
          color: var(--color-text-secondary) !important;
          font-weight: var(--font-weight-regular) !important;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .btn-back-simple:hover:not(:disabled) {
          color: var(--color-text) !important;
          transform: translateX(-2px);
        }
        .btn-back-simple:active:not(:disabled) {
          transform: scale(0.96) translateX(-2px);
        }

        .btn-clear-field {
          position: absolute !important;
          right: 12px !important;
          background: none !important;
          border: none !important;
          box-shadow: none !important;
          color: var(--color-text-secondary) !important;
          cursor: pointer !important;
          padding: var(--space-1) !important;
          border-radius: var(--radius-full) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
          opacity: 0.6 !important;
          z-index: 10 !important;
        }
        .btn-clear-field:hover:not(:disabled) {
          background: rgba(40, 32, 84, 0.06) !important;
          color: var(--color-text) !important;
          opacity: 1 !important;
          transform: scale(1.05);
        }
        .dark .btn-clear-field:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08) !important;
        }
        .btn-clear-field:active:not(:disabled) {
          transform: scale(0.92);
        }

        .premium-login-main {
          flex: 1 1 auto;
          min-height: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-4);
          gap: var(--space-5);
          z-index: 5;
        }

        .premium-login-footer-spacer {
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: var(--space-2) var(--space-4);
          font-size: var(--font-size-xs);
          color: var(--color-text-secondary);
          gap: var(--space-2);
          z-index: 5;
        }

        .footer-global {
          flex: 0 0 auto;
        }

        .footer-global footer {
          padding: var(--space-2) var(--space-4) !important;
        }

        .company-mobile-logo {
          display: none;
        }

        @media (max-height: 760px) {
          .premium-login-main {
            padding-top: var(--space-3);
            padding-bottom: var(--space-2);
            gap: var(--space-3);
          }

          .premium-login-card {
            padding: var(--space-6);
          }

          .capsule-badge {
            margin-bottom: var(--space-4);
          }

          .premium-login-footer-spacer {
            padding-top: 0;
            padding-bottom: var(--space-1);
          }

          .footer-global footer {
            padding-top: var(--space-1) !important;
            padding-bottom: var(--space-2) !important;
          }
        }

        @media (max-width: 640px) {
          .premium-login-container {
            overflow-y: auto;
          }

          .premium-login-main {
            justify-content: center;
            padding: var(--space-5) var(--space-4) var(--space-2);
            gap: var(--space-3);
          }

          .premium-login-card {
            max-width: min(420px, calc(100vw - var(--space-8)));
            padding: var(--space-6);
          }

          .company-login-header {
            flex-direction: column !important;
            gap: var(--space-2) !important;
            min-height: auto !important;
            padding: var(--space-1) var(--space-4) !important;
          }

          .company-header-texts {
            height: auto !important;
            overflow: visible !important;
            align-items: center !important;
            flex: 0 0 auto !important;
          }

          .company-mobile-logo {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            margin: 0 auto var(--space-2);
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.72);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            overflow: hidden;
            flex-shrink: 0;
            padding: 4px;
            box-sizing: border-box;
          }

          .company-mobile-logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
          }
        }

        @media (max-width: 640px) and (max-height: 720px) {
          .premium-login-main {
            padding-top: var(--space-3);
          }

          .premium-login-card {
            padding: var(--space-5);
          }

          .company-mobile-logo {
            width: 34px;
            height: 34px;
            margin-bottom: var(--space-1);
          }
        }
      `}</style>

      {/* Decorative ambient gradients */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '55vw',
          height: '55vw',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(99, 102, 241, 0) 70%)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-10%',
          width: '55vw',
          height: '55vw',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, rgba(168, 85, 247, 0) 70%)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      {/* EK Logo - Desktop only */}
      <div
        style={{
          position: 'absolute',
          top: 'var(--space-4)',
          left: 'var(--space-8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
        className="hidden-mobile"
      >
        <EkLogo size='sm'/>
      </div>

      {/* Theme toggle - All devices */}
      <div style={{ position: 'absolute', top: 'var(--space-4)', right: 'var(--space-4)', zIndex: 10 }}>
        <ThemeToggle />
      </div>

      {/* Main content */}
      <div
        className="premium-login-main"
      >
        {/* Company header */}
        {(companyLogoUrl || companyType || companyName) && (
          <div
            className="company-login-header"
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
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
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
                  {companyLogoUrl && (
                    <div className="company-mobile-logo">
                      <img
                        src={companyLogoUrl}
                        alt="Logo de la empresa"
                      />
                    </div>
                  )}
                  {companyType && (
                    <h2
                      style={{
                        margin: 0,
                        fontSize: 'clamp(1.05rem, 5vw, 1.35rem)',
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
                        fontSize: 'clamp(0.95rem, 4.5vw, 1.15rem)',
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

        {/* Back button outside the card, below the company logo/header */}
        {step === 2 && !isRecovering && (
          <div style={{ width: '100%', maxWidth: '420px', display: 'flex', justifyContent: 'flex-start', marginTop: '-var(--space-3)', marginBottom: '-var(--space-3)' }}>
            <button
              type="button"
              onClick={handleGoBack}
              disabled={isLockedOut || isLoggingIn}
              className="btn-back-simple"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Volver</span>
            </button>
          </div>
        )}

        <div className="premium-login-card" style={{ position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <h1 style={{ marginBottom: 'var(--space-2)' }}>
            {isRecovering 
              ? 'Recuperar Contraseña' 
              : step === 1 
                ? 'Iniciar Sesión' 
                : 'Ingresa tu Contraseña'}
          </h1>
          <p>
            {isRecovering 
              ? 'Te enviaremos un enlace para restablecerla'
              : step === 1
                ? 'Ingresa tus credenciales para continuar'
                : 'Introduce la clave de acceso para tu cuenta'}
          </p>
        </div>

        {/* Success message (Recovery) */}
        {isRecovering && recoverySuccess && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Si existe una cuenta con ese correo, te hemos enviado un enlace para restablecer tu contraseña.</span>
          </div>
        )}

        {/* Failed error message banner */}
        {!isRecovering && loginErrorMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{loginErrorMessage}</span>
          </div>
        )}

        {/* Lockout banner */}
        {!isRecovering && isLockedOut && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>Demasiados intentos fallidos. Por seguridad, el acceso está bloqueado temporalmente por {lockoutTimeLeft} segundos.</span>
          </div>
        )}

        {/* Email capsule badge in Step 2 */}
        {step === 2 && !isRecovering && (
          <div className="capsule-badge">
            <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{getValuesLogin('email')}</span>
            <button
              type="button"
              onClick={handleGoBack}
              disabled={isLockedOut || isLoggingIn}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontSize: 'var(--font-size-xs)',
                cursor: 'pointer',
                padding: 0,
                fontWeight: 'var(--font-weight-bold)',
                textDecoration: 'underline',
              }}
            >
              Editar
            </button>
          </div>
        )}

        {!isRecovering ? (
          /* Login Form (Step 1 and Step 2 in a horizontal slider) */
          <form onSubmit={handleLoginSubmit(onLogin)} noValidate style={{ overflow: 'hidden' }}>
            <div
              style={{
                display: 'flex',
                width: '200%',
                transform: step === 1 ? 'translateX(0%)' : 'translateX(-50%)',
                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {/* Step 1: Email */}
              <div
                style={{
                  width: '50%',
                  paddingLeft: '4px',
                  paddingRight: 'var(--space-2)',
                  opacity: step === 1 ? 1 : 0,
                  pointerEvents: step === 1 ? 'all' : 'none',
                  transition: 'opacity 0.3s ease',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ marginBottom: 'var(--space-2)' }}>
                  <label
                    htmlFor="login-email"
                    style={{ display: 'block', marginBottom: 'var(--space-1)' }}
                  >
                    Correo electrónico
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      id="login-email"
                      type="email"
                      className={`premium-input ${loginErrors.email ? 'premium-input-error' : ''}`}
                      placeholder="tu@email.com"
                      autoComplete="email"
                      autoFocus
                      disabled={isLockedOut}
                      {...registerLogin('email')}
                      onKeyDown={handleEmailKeyDown}
                      style={{
                        paddingRight: emailValue ? '36px' : 'var(--space-3)',
                      }}
                    />
                    {emailValue && !isLockedOut && (
                      <button
                        type="button"
                        onClick={() => {
                          setValueLogin('email', '')
                          document.getElementById('login-email')?.focus()
                        }}
                        className="btn-clear-field"
                        tabIndex={-1}
                        aria-label="Limpiar campo"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    )}
                  </div>
                  {loginErrors.email && (
                    <small style={{ color: 'var(--color-danger)', marginTop: 'var(--space-1)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      <span>{loginErrors.email.message}</span>
                    </small>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-6)' }}>
                  <button
                    type="button"
                    className="btn-premium-action"
                    onClick={handleEmailSubmit}
                    disabled={isLockedOut}
                    style={{
                      opacity: isLockedOut ? 0.7 : 1,
                    }}
                  >
                    <span>{isLockedOut ? `Bloqueado (${lockoutTimeLeft}s)` : 'Continuar'}</span>
                    {!isLockedOut && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    )}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-4)' }}>
                  <button
                    type="button"
                    onClick={() => handleToggleRecovering(true)}
                    disabled={isLockedOut}
                    className="recovery-link"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </div>

              {/* Step 2: Password */}
              <div
                style={{
                  width: '50%',
                  paddingLeft: 'var(--space-2)',
                  paddingRight: '4px',
                  opacity: step === 2 ? 1 : 0,
                  pointerEvents: step === 2 ? 'all' : 'none',
                  transition: 'opacity 0.3s ease',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <label
                    htmlFor="login-password"
                    style={{ display: 'block', marginBottom: 'var(--space-1)' }}
                  >
                    Contraseña
                  </label>
                  <PasswordInput
                    id="login-password"
                    className={`premium-input ${loginErrors.password ? 'premium-input-error' : ''}`}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isLockedOut}
                    {...registerLogin('password')}
                    error={!!loginErrors.password}
                  />
                  {loginErrors.password && (
                    <small style={{ color: 'var(--color-danger)', marginTop: 'var(--space-1)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      <span>{loginErrors.password.message}</span>
                    </small>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-6)' }}>
                  <button
                    type="submit"
                    className="btn-premium-action"
                    disabled={isLoggingIn || isLockedOut}
                    style={{
                      opacity: (isLoggingIn || isLockedOut) ? 0.7 : 1,
                    }}
                  >
                    <span>
                      {isLockedOut 
                        ? `Bloqueado (${lockoutTimeLeft}s)` 
                        : isLoggingIn 
                          ? 'Ingresando...' 
                          : 'Ingresar'}
                    </span>
                    {!isLockedOut && !isLoggingIn && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    )}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-4)' }}>
                  <button
                    type="button"
                    onClick={() => handleToggleRecovering(true)}
                    disabled={isLockedOut || isLoggingIn}
                    className="recovery-link"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </div>
            </div>
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
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  id="recovery-email"
                  type="email"
                  className={`premium-input ${recoveryErrors.email ? 'premium-input-error' : ''}`}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  autoFocus
                  {...registerRecovery('email')}
                  style={{
                    paddingRight: recoveryEmailValue ? '36px' : 'var(--space-3)',
                  }}
                  disabled={recoverySuccess}
                />
                {recoveryEmailValue && !recoverySuccess && (
                  <button
                    type="button"
                    onClick={() => {
                      setValueRecovery('email', '')
                      document.getElementById('recovery-email')?.focus()
                    }}
                    className="btn-clear-field"
                    tabIndex={-1}
                    aria-label="Limpiar campo"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
              {recoveryErrors.email && (
                <small style={{ color: 'var(--color-danger)', marginTop: 'var(--space-1)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>{recoveryErrors.email.message}</span>
                </small>
              )}
            </div>

            {!recoverySuccess && (
               <button
                  type="submit"
                  className="btn-premium-action"
                  disabled={isResetting}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3) var(--space-4)',
                    fontSize: 'var(--font-size-base)',
                    opacity: isResetting ? 0.7 : 1,
                    marginBottom: 'var(--space-4)',
                    justifyContent: 'center',
                  }}
                >
                  {isResetting ? 'Enviando...' : 'Enviar enlace'}
                </button>
            )}

            <div style={{ textAlign: 'center' }}>
               <button
                  type="button"
                  onClick={() => handleToggleRecovering(false)}
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
        className="premium-login-footer-spacer"
      >
        <div className="show-mobile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
          <EkLogo size="sm" />
        </div>
      </div>

      <div className="footer-global" style={{ zIndex: 5 }}>
        <Footer />
      </div>
    </div>
  )
}
