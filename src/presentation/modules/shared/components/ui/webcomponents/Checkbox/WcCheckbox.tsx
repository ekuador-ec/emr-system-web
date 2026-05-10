import React, { forwardRef } from 'react';

interface WcCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'style' | 'checkboxStyle'> {
  label?: string | React.ReactNode;
  description?: string;
  error?: string;
  danger?: boolean;
  checkboxStyle?: React.CSSProperties;
  style?: React.CSSProperties;
}

export const WcCheckbox = forwardRef<HTMLInputElement, WcCheckboxProps>(
  ({ label, description, error, danger, className, checkboxStyle, style, ...props }, ref) => {
    const id = props.id || props.name || Math.random().toString(36).substr(2, 9);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', ...style }} className={className}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <input
            type="checkbox"
            id={id}
            ref={ref}
            {...props}
            style={{
              width: '18px',
              height: '18px',
              marginTop: '2px', // align with text
              cursor: props.disabled ? 'not-allowed' : 'pointer',
              ...checkboxStyle,
            }}
          />
          {label && (
            <label
              htmlFor={id}
              style={{
                fontSize: '0.875rem',
                cursor: props.disabled ? 'not-allowed' : 'pointer',
                color: danger ? 'var(--color-danger)' : 'var(--color-text)',
                lineHeight: '1.4',
                userSelect: 'none'
              }}
            >
              {label}
            </label>
          )}
        </div>
        {description && (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginLeft: '26px' }}>
            {description}
          </span>
        )}
        {error && (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginLeft: '26px' }}>
            {error}
          </span>
        )}
      </div>
    );
  }
);

WcCheckbox.displayName = 'WcCheckbox';
