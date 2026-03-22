import { useThemeStore } from '@/presentation/modules/shared/stores/themeStore'

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'
  
  return (
    <wc-button-circle
      variant="primary"
      icon={isDark ? 'icon-sun' : 'icon-moon'}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      onClick={toggleTheme}
    />
  )
}
