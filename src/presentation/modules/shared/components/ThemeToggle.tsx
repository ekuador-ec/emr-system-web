import { useThemeStore } from '@/presentation/modules/shared/stores/themeStore'
import WcButtonIcon from '@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon'

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'
  
  return (
    <WcButtonIcon
      variant="ghost"
      shape="circle"
      icon={isDark ? 'icon-sun' : 'icon-moon'}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      onClick={toggleTheme}
    />
  )
}
