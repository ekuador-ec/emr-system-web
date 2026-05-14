import type { CSSProperties } from 'react';

export interface IconProps {
  name: string
  size?: number | string
  className?: string
  style?: CSSProperties
}

export function Icon({ name, size = 20, className, style }: IconProps) {
  const isAlertCircle = name === "icon-alert-circle";
  const mergedStyle: CSSProperties = isAlertCircle
    ? {
        ...style,
        transform: style?.transform ? `${style.transform} scale(1.12)` : "scale(1.12)",
        transformOrigin: "center",
      }
    : (style ?? {});

  return (
    <svg 
      width={size} 
      height={size} 
      className={className} 
      style={mergedStyle}
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      aria-hidden="true"
    >
      <use href={`/icons/system-icons.svg#${name}`} xlinkHref={`/icons/system-icons.svg#${name}`} />
    </svg>
  )
}
