import { useState, forwardRef } from 'react'

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ error, style, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    return (
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          style={{
            ...style,
            width: '100%',
            paddingRight: '2.5rem', 
            borderColor: error ? 'var(--color-danger)' : style?.borderColor,
          }}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          tabIndex={-1} 
          style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-secondary)',
          }}
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {showPassword ? (
            <svg width="20" height="20">
              <use href="/icons/system-icons.svg#icon-eye-off" xlinkHref="/icons/system-icons.svg#icon-eye-off" />
            </svg>
          ) : (
            <svg width="20" height="20">
              <use href="/icons/system-icons.svg#icon-eye" xlinkHref="/icons/system-icons.svg#icon-eye" />
            </svg>
          )}
        </button>
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'
