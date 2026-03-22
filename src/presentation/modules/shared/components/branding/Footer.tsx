export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      style={{
        textAlign: 'center',
        padding: 'var(--space-4)',
        fontSize: '9px',
        color: 'var(--color-text-secondary)',
        width: '100%',
        maxWidth: '100vw',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <p style={{ margin: 0, whiteSpace: 'nowrap', fontSize: '10px', textAlign: 'center' }}>
        ©{currentYear} <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--color-primary)',
            textDecoration: 'none',
            fontWeight: 'var(--font-weight-medium)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            const target = e.target as HTMLElement
            target.style.textDecoration = 'underline'
          }}
          onMouseLeave={(e) => {
            const target = e.target as HTMLElement
            target.style.textDecoration = 'none'
          }}
        >
          ekuador.ec
        </a>
        {' '}| Todos los derechos reservados
      </p>
    </footer>
  )
}
