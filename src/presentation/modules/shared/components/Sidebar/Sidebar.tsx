import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/presentation/modules/auth/hooks/useAuth'
import { useUnreadMessagesTotal } from '@/presentation/modules/messaging/hooks/useUnreadMessagesTotal'
import './Sidebar.css'
import { Icon } from './icons/Icon'

interface MenuItem {
  path: string
  label: string
  icon: string
  badge?: number
}

interface MenuGroup {
  label: string
  items: MenuItem[]
}

function useMenuGroups(): MenuGroup[] {
  const { isAdmin, user } = useAuth()
  const unreadMessages = useUnreadMessagesTotal(user?.id)
  return [
    {
      label: 'Principal',
      items: [
        { path: '/', label: 'Dashboard', icon: 'icon-dashboard' },
        { path: '/reportes', label: 'Reportes', icon: 'icon-reports' },
        { path: '/mensajes', label: 'Mensajes', icon: 'icon-messages', badge: unreadMessages },
      ]
    },
    {
      label: 'Módulos Clínicos',
      items: [
        { path: '/pacientes', label: 'Pacientes', icon: 'icon-patient' },
        { path: '/historias-clinicas', label: 'Historias Clínicas', icon: 'icon-clinical-history' },
        { path: '/evoluciones', label: 'Evoluciones Médicas', icon: 'icon-medical-evolution' },
      ]
    },
    {
      label: 'Administración',
      items: [
        { path: '/catalogos', label: 'Catálogos', icon: 'icon-catalogs' },
        ...(isAdmin ? [
          { path: '/admin/users', label: 'Usuarios', icon: 'icon-users' }
        ] : [])
      ]
    },
    {
      label: 'Comunicación y Ayuda',
      items: [
        { path: '/soporte', label: 'Soporte Técnico', icon: 'icon-support' },
      ]
    }
  ]
}

function CompanyLogo() {
  return import.meta.env.VITE_COMPANY_LOGO_URL ? (
    <img
      src={import.meta.env.VITE_COMPANY_LOGO_URL}
      alt="Company Logo"
      className="company-logo-img"
    />
  ) : (
    <span aria-hidden="true">
      {(import.meta.env.VITE_COMPANY_NAME || 'EK').substring(0, 2).toUpperCase()}
    </span>
  )
}

function SidebarContent({ isExpanded }: { isExpanded: boolean }) {
  const location = useLocation()
  const menuGroups = useMenuGroups()
  const isActive = (path: string) => location.pathname === path

  return (
    <>
      <div className="sidebar-header">
        <div className="company-logo-container">
          <CompanyLogo />
        </div>
        <div className="company-info">
          <span className="company-type">
            {import.meta.env.VITE_COMPANY_TYPE || 'Sistema Médico'}
          </span>
          <span className="company-name" title={import.meta.env.VITE_COMPANY_NAME || 'Ekuador Entorno de Pruebas'}>
            {import.meta.env.VITE_COMPANY_NAME || 'Ekuador Entorno de Pruebas'}
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="sidebar-group">
            <div className="sidebar-group-header">
              <span className="sidebar-group-label">{group.label}</span>
              <div className={`sidebar-separator ${groupIdx === 0 ? 'hidden' : ''}`} />
            </div>
            
            <div className="sidebar-group-items">
              {group.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
                  title={!isExpanded ? item.label : undefined}
                >
                  <div className="sidebar-item-icon">
                    <Icon name={item.icon} size={20} />
                    {!isExpanded && typeof item.badge === 'number' && item.badge > 0 && (
                      <span className="sidebar-item-badge collapsed-badge">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </div>
                  <span className="sidebar-item-label">{item.label}</span>
                  {isExpanded && typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="sidebar-item-badge">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-brand-mark" title="EMR System">E</div>
        <div className="sidebar-system-text">
          <span className="sidebar-brand-text">EMR System</span>
          <span className="sidebar-copyright">ek.software v1.2.0</span>
        </div>
      </div>
    </>
  )
}

export function Sidebar() {
  const [isPinned, setIsPinned] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const location = useLocation()
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  const handleMouseEnter = useCallback(() => {
    if (isPinned) return
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setIsHovering(true)
  }, [isPinned])

  const handleMouseLeave = useCallback(() => {
    if (isPinned) return
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovering(false)
    }, 150)
  }, [isPinned])

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    }
  }, [])

  const togglePin = () => {
    setIsPinned(prev => !prev)
    setIsHovering(false)
  }

  const isExpanded = isPinned || isHovering || isMobileOpen

  return (
    <>
      <div
        className={`mobile-overlay ${isMobileOpen ? 'active' : ''}`}
        onClick={() => setIsMobileOpen(false)}
      />

      <div
        className="sidebar-wrapper"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <aside className={`sidebar ${isExpanded ? 'pinned' : 'collapsed'} ${isMobileOpen ? 'mobile-open' : ''}`}>
          <SidebarContent isExpanded={isExpanded} />
        </aside>

        <button
          className="sidebar-toggle-btn"
          onClick={togglePin}
          aria-label={isPinned ? 'Desfijar menú' : 'Fijar menú expandido'}
          title={isPinned ? 'Desfijar menú' : 'Fijar menú expandido'}
        >
          <Icon name={isPinned ? 'icon-pin-off' : 'icon-pin'} size={14} />
        </button>
      </div>

      <button
        className="mobile-toggle-btn"
        onClick={() => setIsMobileOpen(prev => !prev)}
        aria-label="Abrir menú"
      >
        <Icon name="icon-menu" size={24} />
      </button>
    </>
  )
}
