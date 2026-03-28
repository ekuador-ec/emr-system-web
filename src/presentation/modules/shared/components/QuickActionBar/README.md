# QuickActionBar Component

Este es un componente reutilizable para mostrar un menú desplegable de "Acciones Rápidas" asociado a un módulo del sistema EMR.

## Instalación & Importación

```tsx
import { QuickActionBar } from "@/presentation/modules/shared/components/QuickActionBar";
```

## Props / Configuración

El componente `QuickActionBar` acepta la siguiente configuración:

- `module` (string): Nombre del módulo (ej. "Pacientes"). Se oculta automáticamente en pantallas pequeñas.
- `icon` (string): Nombre del ícono de la librería preexistente `Icon` (ej. "icon-users").
- `actions` (Array<QuickAction>): Lista de acciones a desplegar. Las acciones pueden ser rutas de navegación o funciones ejecutables.
- `disabled` (boolean) [Opcional]: Deshabilita el componente completo mostrando estado de módulo pendiente/no implementado.

### `QuickAction` Interface

```ts
export interface QuickAction {
  label: string;
  icon: string;
  route?: string;                // Si se provee, navegará a la ruta al clicar
  onClick?: () => void;          // Si se provee, ejecutará la función
  disabled?: boolean;            // Deshabilita la acción específica
}
```

## Ejemplo de uso e integración

### Módulo Funcional (Pacientes)

```tsx
<QuickActionBar
  module="Pacientes"
  icon="icon-users"
  actions={[
    { 
      label: 'Buscar Paciente', 
      icon: 'icon-search', 
      onClick: () => setQuickSearchModalOpen(true) 
    },
    { 
      label: 'Registrar Nuevo', 
      icon: 'icon-user-plus', 
      onClick: () => setCreateModalOpen(true) 
    }
  ]}
/>
```

### Módulo Pendiente de Implementar

Puedes deshabilitar el botón principal pasando `disabled={true}`, y opcionalmente un arreglo vacío para `actions`. Visualmente, el botón indicará que no está disponible (`not-allowed`, `grayscale`).

```tsx
<QuickActionBar
  module="Historias Clínicas"
  icon="icon-file-text" // Usar icono relacionado
  actions={[]}
  disabled={true}
/>
```

### Rutas (React Router)

```tsx
<QuickActionBar
  module="Reportes"
  icon="icon-bar-chart"
  actions={[
    { label: 'Ver General', icon: 'icon-eye', route: '/reportes/general' },
  ]}
/>
```
