import { useEffect, useState } from 'react'

interface EkLogoProps {
  size?: 'sm' | 'md' | 'lg'
}

export function EkLogo({ size = 'sm' }: EkLogoProps) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const html = document.documentElement
    setIsDark(html.classList.contains('dark'))

    const observer = new MutationObserver(() => {
      setIsDark(html.classList.contains('dark'))
    })

    observer.observe(html, { attributes: true, attributeFilter: ['class'] })

    return () => observer.disconnect()
  }, [])

  const sizeMap = {
    sm: '32px',
    md: '40px',
    lg: '48px',
  }

  const logoSrc = isDark ? '/logo-on-dark.svg' : '/ek-logo-on-light.svg'
  const logoAlt = 'ek.software'

  return (
    <img
      src={logoSrc}
      alt={logoAlt}
      style={{
        height: sizeMap[size],
        width: 'auto',
      }}
    />
  )
}
