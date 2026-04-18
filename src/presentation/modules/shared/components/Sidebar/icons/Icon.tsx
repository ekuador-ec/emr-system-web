import type { CSSProperties } from 'react';

export interface IconProps {
  name: string
  size?: number | string
  className?: string
  style?: CSSProperties
}

export function Icon({ name, size = 20, className, style }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      className={className} 
      style={style}
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      aria-hidden="true"
    >
      <use href={`/icons/system-icons.svg#${name}`} />
    </svg>
  )
}
