# Reglas y Contexto del Proyecto para Agentes de IA

> **IMPORTANTE PARA EL AGENTE:** Al leer este archivo (`AGENTS.md`), asumes el rol de desarrollador en este ecosistema. DEBES cumplir estrictamente TODAS las convenciones y reglas aquí estipuladas en cada interacción, sugerencia de código, o refactorización.

Este es un Sistema de Gestión de Historias Clínicas (EMR - Electronic Medical Records) enfocado en alta escalabilidad, seguridad de datos y actualizaciones en tiempo real.

## Stack Tecnológico Principal

- **Frontend:** React 19, TypeScript, Vite (SWC).
- **Backend/BaaS:** Supabase (PostgreSQL, Auth, Realtime).
- **Enrutamiento:** React Router DOM v7.
- **Gestión de Estado Servidor:** TanStack Query (React Query).
- **Gestión de Estado Cliente:** Zustand.
- **Linter:** Oxlint (No usar ESLint).
- **Gestor de Paquetes:** pnpm.

## Reglas Arquitectónicas: Clean Architecture

El proyecto está estrictamente dividido en 4 capas. El código generado DEBE respetar esta separación de responsabilidades:

1. **Domain (`src/domain`):**
   - Contiene los modelos base (Interfaces/Types de TypeScript).
   - Contiene las interfaces de los repositorios.
   - REGLA: Cero dependencias externas. No puede importar nada de React, Supabase o librerías de terceros.

2. **Application (`src/application`):**
   - Contiene los Casos de Uso (Lógica de negocio).
   - Orquesta el flujo de datos usando las interfaces de los repositorios del dominio.
   - REGLA: No interactúa con el DOM, React ni la red de forma directa.

3. **Infrastructure (`src/infrastructure`):**
   - Implementa las interfaces de los repositorios definidos en el dominio (ej. llamadas reales a `supabase.from()`).
   - Contiene la configuración de clientes externos (Supabase, APIs).
   - REGLA: Es la única capa que conoce y maneja la base de datos o red.

4. **Presentation (`src/presentation`):**
   - Contiene componentes de React, páginas y custom hooks.
   - REGLA: Los componentes NUNCA hacen llamadas directas a Supabase. DEBEN usar custom hooks que consuman los Casos de Uso a través de TanStack Query.
   - REGLA (Validaciones): Los esquemas de validación (ej. Zod) y sus tipos inferidos DEBEN centralizarse en la carpeta `src/presentation/schemas/` agrupados por módulo de negocio (ej. `auth.schema.ts`, `user.schema.ts`).
   - REGLA (Componentes Limpios): ESTÁ PROHIBIDO definir esquemas de validación directamente dentro de los archivos de los componentes visuales (`.tsx`). Los componentes deben importar los esquemas y tipos desde su archivo correspondiente en `schemas/` para garantizar la reusabilidad y adherirse al Principio de Responsabilidad Única (SRP).

## Reglas de Estado y Flujo de Datos

- **Datos del Servidor (Supabase):** Usar SIEMPRE `useQuery` o `useMutation` de TanStack Query. Nunca guardar respuestas de la API en un `useState` o en Zustand.
- **Datos de UI (Cliente):** Usar Zustand solo para estado efímero de la interfaz (modales, pasos de un formulario, filtros locales).
- **Tiempo Real:** Las suscripciones de Supabase Realtime deben invalidar la caché específica en TanStack Query (`queryClient.invalidateQueries()`) en lugar de mutar el DOM manualmente.

## Reglas de Seguridad y Buenas Prácticas

- **Prevención XSS y Fuga de Datos:** NUNCA usar `localStorage` o el middleware `persist` de Zustand para guardar PII (Información Personal Identificable), historias clínicas o tokens médicos. Todo el estado sensible debe vivir en memoria (RAM) gestionado por TanStack Query.
- **Tipado Estricto:** Prohibido usar `any`. Todo el código debe estar fuertemente tipado mediante interfaces del dominio.
- **Importaciones Estrictas:** Debido a la configuración `verbatimModuleSyntax`, TODOS los tipos e interfaces deben importarse usando `import type`. Además, ESTÁ PROHIBIDO el uso de rutas relativas (ej. `../../`). Se debe utilizar SIEMPRE el alias de ruta `@/` para apuntar a la carpeta `src/`.
- **Restricciones de TypeScript (`erasableSyntaxOnly`):** Está ESTRICTAMENTE PROHIBIDO usar "propiedades de parámetros" en los constructores (ej. `constructor(private repo: Repo) {}`). Debido a la configuración de Type Stripping, todas las propiedades de clase deben declararse explícitamente y asignarse dentro del cuerpo del constructor.
- **Manejo de Errores:** Los Casos de Uso deben capturar los errores de la infraestructura y lanzar errores genéricos de dominio para que la UI los muestre amigablemente.
- **Limpieza de Sesión:** Proveer siempre un mecanismo para hacer `queryClient.clear()` y resetear los stores de Zustand al ejecutar el cierre de sesión (Logout).

## Reglas de Interacción para Agentes de IA

- **Uso Obligatorio de Skills:** ANTES de implementar o generar nuevo código, el agente DEBE explorar y leer el contenido de las carpetas `.agents/skills/`, `.agent/skills/`, `.agents/skill/` o `.agent/skill/` dentro del proyecto. Las guías contenidas en estos directorios deben aplicarse rigurosamente (especialmente para UI y diseño web).
- **Cero Emojis:** Está ESTRICTAMENTE PROHIBIDO utilizar emojis en el código fuente, archivos de configuración, comentarios, respuestas textuales y mensajes de commit.
- **Restricción de Comentarios:** NO utilizar comentarios en el interior del código a menos que sea estrictamente necesario para explicar decisiones técnicas inusuales o lógicas de negocio complejas (explica el *por qué*, no el *qué*). El código debe ser completamente autodescriptivo.
- **Modificaciones Precisas:** Al editar archivos mediante herramientas, no reescribir un archivo completo si solo se requiere un ajuste en pocas líneas. Las modificaciones deben ser atómicas y focalizadas.
