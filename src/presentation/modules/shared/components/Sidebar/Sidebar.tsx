import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/presentation/modules/auth/hooks/useAuth'
import './Sidebar.css'
import { Icon } from './icons/Icon'

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()
  const { isAdmin } = useAuth()

  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded)
  }

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  const isActive = (path: string) => location.pathname === path

  const menuGroups = [
    {
      label: 'Principal',
      items: [
        { path: '/', label: 'Dashboard', icon: 'icon-dashboard' },
        { path: '/mensajes', label: 'Mensajes', icon: 'icon-messages' },
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
        ...(isAdmin ? [{ path: '/admin/users', label: 'Usuarios', icon: 'icon-users' }] : [])
      ]
    },
    {
      label: 'Comunicación y Ayuda',
      items: [
        { path: '/soporte', label: 'Soporte Técnico', icon: 'icon-support' },
      ]
    }
  ]

  return (
    <>
      <div 
        className={`mobile-overlay ${isMobileOpen ? 'active' : ''}`} 
        onClick={() => setIsMobileOpen(false)}
      />
      
      <aside className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'} ${isMobileOpen ? 'mobile-open' : ''}`}>
        
        <div className="sidebar-header">
          <div className="sidebar-brand-icon">E</div>
          {!(!isExpanded && !isMobileOpen) && <span className="sidebar-brand-text">EMR System</span>}
        </div>

        <button 
          className="sidebar-toggle-btn" 
          onClick={toggleSidebar}
          aria-label={isExpanded ? 'Contraer menú' : 'Expandir menú'}
        >
          {isExpanded ? <Icon name="icon-chevron-left" size={16} /> : <Icon name="icon-chevron-right" size={16} />}
        </button>

        <nav className="sidebar-nav">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="sidebar-group">
              <div className="sidebar-group-label">{group.label}</div>
              {group.items.map((item, itemIdx) => (
                <Link 
                  key={itemIdx} 
                  to={item.path} 
                  className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
                  title={(!isExpanded && !isMobileOpen) ? item.label : undefined}
                >
                  <span className="sidebar-item-icon">
                    <Icon name={item.icon} size={20} />
                  </span>
                  <span className="sidebar-item-label">{item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="client-info-container">
            <div className="company-logo-container">
              {import.meta.env.VITE_COMPANY_LOGO_URL ? (
                <img 
                  src={import.meta.env.VITE_COMPANY_LOGO_URL} 
                  alt="Company Logo" 
                  className="company-logo-img" 
                />
              ) : (
                <span aria-hidden="true">
                  {(import.meta.env.VITE_COMPANY_NAME || 'EK').substring(0, 2).toUpperCase()}
                </span>
              )}
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

          <div className="copyright-info">
            <span className="copyright-brand">ek.software</span>
            <span className="copyright-version">versión 1.2.0</span>
          </div>
        </div>

      </aside>

      <button className="mobile-toggle-btn" onClick={toggleMobileSidebar} aria-label="Abrir menú">
        <Icon name="icon-menu" size={24} />
      </button>
    </>
  )
}
