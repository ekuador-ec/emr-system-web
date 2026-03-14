export interface IconProps {
  name: string
  size?: number | string
  className?: string
}

export function Icon({ name, size = 20, className }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      className={className} 
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
