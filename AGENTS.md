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

## Reglas de Uso de Componentes Frontend

- **Botones con texto (acciones primarias/secundarias):** Usar SIEMPRE `WcButton`.
- **Botones de solo icono (acciones rápidas):** Usar SIEMPRE `WcButtonIcon`.
- **Búsqueda:** Usar SIEMPRE `WcSearchInput`. Si necesita botón de buscar, debe integrarse en el mismo componente mediante props.
- **Tabs y secciones con pestañas:** Usar SIEMPRE `WcTabsFolder`. Evitar crear tabs custom ad hoc.
- **Tablas de datos:** Usar SIEMPRE `WcTables` para listado tabular con paginación/acciones.
- **Acciones por fila en tablas:** Usar `TableActionCell` + `WcButtonIcon`.
- **Avatar en tabla:** Usar `TableAvatarCell` (incluye fallback visual consistente).
- **Filtros rápidos:** Usar `UsersQuickFilterPopover`. No crear popovers paralelos para el mismo propósito.
- **Iconografía del sistema:** Usar `Icon` con `system-icons.svg`. Evitar SVG inline salvo necesidad técnica justificada.
- **Consistencia responsive:** Reutilizar el mismo componente y adaptarlo por CSS; no crear componentes distintos solo para mobile.
- **Sin mezcla de estilos nativos innecesaria:** Evitar `button` nativo estilizado manualmente si ya aplica `WcButton`/`WcButtonIcon`.
- **Extensión de diseño:** Si falta una variante visual, extender el componente base por props/clase antes de crear uno nuevo.
- **Consistencia de intención:** `WcButton` para acciones de flujo/intención; `WcButtonIcon` para acciones compactas y contextuales.
- **Paginación por vista:** Definir constantes por modo (`table/cards`) y evitar números mágicos en JSX.

---

# Visión General del Sistema

> Esta sección documenta el estado actual de las funcionalidades implementadas para que cualquier agente pueda extender el sistema respetando las convenciones existentes. Cualquier feature nueva DEBE reutilizar la infraestructura, hooks, componentes y patrones aquí descritos antes de crear código paralelo.

## Estructura de Carpetas

```
src/
  App.tsx                  Definición de rutas (createBrowserRouter)
  main.tsx                 Bootstrap React + QueryClientProvider
  domain/modules/          Entidades, enums e interfaces de repositorio
  application/modules/     Casos de uso (clases con execute)
  infrastructure/
    core/supabaseClient.ts Cliente Supabase singleton
    modules/               Implementaciones SupabaseXxxRepository + mappers
  presentation/
    core/
      ui/                  Botones legacy (Button.tsx, index.ts)
      security/            Permisos cliente (medicalRecordPermissions.ts)
    modules/
      <feature>/
        pages/             Pantallas con routing
        components/        UI compuesta del módulo
        hooks/             Wrappers de TanStack Query sobre Use Cases
        schemas/           Zod schemas (UNICO sitio permitido)
        stores/            Zustand para UI efímera
        utils/             Helpers locales del módulo
```

Módulos activos: `auth`, `catalog`, `dashboard`, `evolution`, `medical-record`, `notifications`, `patient`, `shared`, `users`.

## Mapa de Rutas (`src/App.tsx`)

| Ruta | Componente | Acceso |
|---|---|---|
| `/login` | `LoginPage` | Público |
| `/update-password` | `UpdatePasswordPage` | Público (vía link de Supabase) |
| `/` | `DashboardPage` | Autenticado |
| `/pacientes` | `PatientsPage` | Autenticado |
| `/pacientes/:patientId/historia` | `MedicalRecordPage` | Autenticado |
| `/pacientes/:patientId/historia/evoluciones/:evolutionId` | `EvolutionWorkspacePage` | Autenticado |
| `/historias-clinicas` | `MedicalRecordsPage` | Autenticado |
| `/evoluciones` | `EvolutionsPage` | Autenticado |
| `/admin/users` | `UsersManagementPage` | `admin` |
| `*` | Redirección a `/` | - |

Todas las rutas protegidas están envueltas en `ProtectedRoute` (con prop `allowedRoles`) y `AppLayout` (sidebar + header + acciones globales).

## Integración Supabase

- Cliente singleton en `src/infrastructure/core/supabaseClient.ts` que lee `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` (fallback `VITE_SUPABASE_ANON_KEY`).
- Toda la seguridad de datos depende de **RLS** en PostgreSQL.
- Funcionalidades Supabase usadas: Auth, Database (`from`), RPC, Edge Functions, Storage (bucket `avatars`), Realtime (presence + cambios de tabla).
- Mappers (`snake_case` ↔ `camelCase`) viven en `infrastructure/modules/<feature>/mappers/`. Los dominios NUNCA conocen snake_case.

### RPCs Disponibles
- `search_cie10(query, result_limit)` (catalog)
- `get_medical_record_evolution_counts(record_ids)` (medical-record)
- `get_all_users_admin`, `get_filtered_users_admin`, `toggle_user_status`, `soft_delete_user`, `restore_deleted_user` (users)

### Edge Functions
- `invite-user` (users) - envía invitación con redirect_to.

### Realtime
- `online-users` channel (presence) en users.
- Suscripciones para notificaciones, perfiles y pacientes invalidan caché de TanStack Query vía `queryClient.invalidateQueries`.

## Módulos Implementados

### 1. Auth (`auth`)
Login con email/password, recuperación de contraseña por email, actualización de contraseña tras link de reset, protección por rol y verificación de `account_status === "active"`.

- Domain: `AuthRepository` (signIn, signOut, getCurrentUser, onAuthStateChange, sendPasswordResetEmail, updatePassword) - el modelo `UserProfile` reside en `domain/modules/users`.
- Application: `LoginUser`, `LogoutUser`, `SendPasswordResetEmailUseCase`, `UpdatePasswordUseCase`.
- Infrastructure: `SupabaseAuthRepository` con traducción de errores en `errors/authErrorMessages.ts` (mensajes en español).
- Presentation:
  - Pages: `LoginPage`, `UpdatePasswordPage`.
  - Components: `ProtectedRoute` (soporta `allowedRoles`).
  - Hooks: `useAuth`, `usePasswordReset`, `useUpdatePassword`.
  - Schemas: `auth.schema.ts` (login, reset, update password).

### 2. Catalog (`catalog`)
Catálogos maestros, búsqueda CIE-10 y búsqueda jerárquica de ubicación geográfica (Ecuador: provincia/cantón/parroquia/DPA).

- Domain: enums normalizados (`GenderEnum`, `BloodTypeEnum`, `MaritalStatusEnum`, `CulturalGroupEnum`, `EducationLevelEnum`, `InformationSourceEnum`, `KinshipEnum`, `AntecedentTypeEnum`, `HealthInsuranceTypeEnum`), `Catalog`, `CatalogItem`, `Cie10Pathology`, `Cie10SearchResult`, `GeographicLocation`.
- Application: `ListCatalogsUseCase`, `ListCatalogItemsUseCase`, `SearchCie10PathologiesUseCase` (min 2 chars), `SearchGeographicLocationsUseCase` (min 3 chars).
- Infrastructure: `SupabaseCatalogRepository` (consulta tablas `catalogs`, `catalog_items`, `geographic_locations` y RPC `search_cie10`).
- Presentation:
  - Hooks: `useCatalogs`, `useCatalogItems`, `useSearchCie10Pathologies`, `useSearchGeographicLocations`.
  - Reutilizado por: Patient (autocomplete CIE-10, ubicación, ocupación) y Evolution (diagnósticos CIE-10).

### 3. Dashboard (`dashboard`)
Landing autenticado con bienvenida y datos del perfil actual.

- Pages: `DashboardPage`.

### 4. Patient (`patient`)
CRUD completo del paciente con relaciones (contactos de emergencia, antecedentes clínicos), búsqueda avanzada, ficha rápida, drawer de detalle y soft-delete (toggle `is_active`).

- Domain: `Patient` (40+ campos: identidad, contacto, demografía, empleo, dirección, fuente de información), `PatientEmergencyContact`, `PatientClinicalAntecedent`, DTOs `CreatePatientDTO` / `UpdatePatientDTO`, `PatientListItem`, `PatientFilters`.
- Application: `CreatePatientUseCase` (valida duplicado de `idNumber`), `GetPatientUseCase`, `GetPatientByIdNumberUseCase`, `ListPatientsUseCase`, `UpdatePatientUseCase`, `TogglePatientStatusUseCase`.
- Infrastructure: `SupabasePatientRepository` con manejo manual de upsert/soft-delete para `patient_clinical_antecedents` y reemplazo total para `patient_emergency_contacts`. Carga relaciones anidadas (`occupation`, `geographic_location`, `patient_emergency_contacts`, `patient_clinical_antecedents.pathology`).
- Presentation:
  - Pages: `PatientsPage` (lista + filtros + creación).
  - Components: `PatientsList`, `PatientSearchFilters`, `PatientQuickFilterPopover`, `PatientQuickSearchModal`, `PatientDetailsDrawer`, `PatientCreateModal`, `Cie10SearchInput`, `GeographicLocationSearchInput`.
  - Hooks: `usePatients`, `usePatient`, `usePatientByIdNumber`, `useCreatePatient`, `useUpdatePatient`, `useTogglePatientStatus`, `usePatientSubscription` (realtime).
  - Store: `usePatientStore` (modales, filtros, paciente seleccionado).
  - Schemas: `patient.schema.ts` (incluye validación de cédula ecuatoriana vía `validateEcCedula` del módulo `shared`).

### 5. Medical Record (`medical-record`)
Historia clínica única por paciente. Incluye listado global de historias, configuración de la organización (cabecera institucional MSP) y vista detallada con resumen + evoluciones asociadas.

- Domain: `MedicalRecord`, `MedicalRecordListItem`, `MedicalRecordFilters`, `OrganizationConfig`, `PaginatedResult<T>`.
- Application: `CreateMedicalRecordUseCase`, `GetMedicalRecordByPatientUseCase`, `ListMedicalRecordsUseCase` (valida rango ≤ 31 días), `UpdateMedicalRecordStatusUseCase`, `GetOrganizationConfigUseCase`, `UpdateOrganizationConfigUseCase`.
- Infrastructure: `SupabaseMedicalRecordRepository` (joins con `patients` y `profiles` para creator/updater, RPC `get_medical_record_evolution_counts` para conteo eficiente de evoluciones), `SupabaseOrganizationConfigRepository`.
- Presentation:
  - Pages: `MedicalRecordsPage` (lista global), `MedicalRecordPage` (detalle por paciente).
  - Components: `MedicalRecordHeader`, `MedicalRecordSummary`, `MedicalRecordEvolutionsList`, `CreateMedicalRecordModal`, `MedicalRecordDetailsModal`, `MedicalRecordsList`, `MedicalRecordsSearchFilters`, `MedicalRecordsDateFilterPopover`, `OrganizationConfigModal`.
  - Hooks: `useMedicalRecords`, `useMedicalRecordByPatient`, `useCreateMedicalRecord`, `useUpdateMedicalRecord`, `useOrganizationConfig`.
  - Store: `useMedicalRecordStore`.
  - Schemas: `organizationConfig.schema.ts`.
  - Permisos: `presentation/core/security/medicalRecordPermissions.ts`.

### 6. Evolution (`evolution`)
Atenciones / notas evolutivas asociadas a una historia clínica. Incluye flujo emergencia ambulatoria, signos vitales, examen físico, lesiones, diagnósticos CIE-10 (ingreso/alta, presuntivo/definitivo), emergencia obstétrica y alta médica. Estados `ABIERTA`, `EN_PROCESO`, `CERRADA`.

- Domain: `MedicalEvolution` (50+ campos), `MedicalEvolutionListItem`, `EvolutionFilters`, `EvolutionSystemReview`, `EvolutionPhysicalExam`, `EvolutionInjury`, `EvolutionDiagnosis`, `EvolutionDischarge`, payloads `CreateEvolutionPayload` / `UpdateEvolutionPayload` + enums (`EvolutionStatus`, `ArrivalMethod`, `ClinicalCause`, `AccidentType`, `ViolenceType`, `IntoxicationType`, `DiagnosisType`, `DiagnosisCertainty`, `SystemReviewCondition`, `PhysicalExamRegion`, `InjuryType`, `DischargeType`).
- Application: `CreateEvolutionUseCase`, `UpdateEvolutionUseCase`, `GetEvolutionByIdUseCase`, `GetEvolutionsByMedicalRecordUseCase`, `ListEvolutionsUseCase` (rango ≤ 31 días), `CloseEvolutionUseCase` (marca `CERRADA`, registra `closed_by` y `closed_at`).
- Infrastructure: `SupabaseEvolutionRepository` que reemplaza relaciones (systems_review, physical_exams, injuries, diagnoses, discharges) en cada update, con joins profundos a `profiles` (opener/closer) y `cie10_pathologies`.
- Presentation:
  - Pages: `EvolutionsPage` (tabs "Últimas 48 horas" + "Consulta avanzada"), `EvolutionWorkspacePage` (workspace tabbed).
  - Tabs del workspace: `TabAdmision`, `TabMotivo`, `TabEmergenciaObstetrica` (solo femenino), `TabSignosVitales` (autocálculo IMC), `TabExamen`, `TabDiagnostico`, `TabAlta`.
  - Components: `CreateEvolutionModal`, `EvolutionResultsTable`, `UnsavedChangesModal`.
  - Hooks: `useEvolutions`, `useEvolutionsByMedicalRecord`, `useEvolution`, `useCreateEvolution`, `useUpdateEvolution`, `useCloseEvolution`.
  - Stores: `useEvolutionUIStore` (tab activa, modales), `useEvolutionsListStore` (filtros/paginación).
  - Schemas: `evolution.schema.ts` (validación estricta + relajada para borradores).
  - Utils: `dateRange.ts`.

### 7. Notifications (`notifications`)
Centro de notificaciones in-app con conteo de no leídas, marcar como leída individual o masivamente, y actualización en tiempo real.

- Domain: `Notification` (incluye `metadata: NotificationMetadata`), `KnownNotificationType` (`NEW_USER` | `NEW_PATIENT` | `NEW_MEDICAL_RECORD` | `NEW_EVOLUTION` | `TASK_ASSIGNED` | `SYSTEM_ALERT`), `NotificationType` (unión abierta).
- Application: `NotificationService` (servicio agrupado: `getNotifications`, `markAsRead`, `markAllAsRead`).
- Infrastructure: `SupabaseNotificationRepository` lee `metadata` desde la fila y deriva `actorName` desde `metadata.actorName`. Ya **no** consulta `profiles` (lo cual fallaba con RLS para no-admins).
- Backend (`supabase/migrations/`, repo separado):
  - `10_notifications_schema.sql`: tabla `notifications`, RLS y helper legacy `notify_user`.
  - `11_notify_new_user_trigger.sql`: trigger `on_new_user_notify_admins` → `NEW_USER` solo a admins activos.
  - `15_medical_records_schema.sql`: trigger `on_medical_record_created` → `NEW_MEDICAL_RECORD`.
  - `26_notifications_realtime_and_helpers.sql`: añade `notifications` a la publication `supabase_realtime` y crea el helper genérico `public.notify_users(actor, type, entity_id, roles?, exclude_self?)` que filtra automáticamente por `account_status='active'` y `deleted_at IS NULL`. Refactoriza `NEW_USER` y `NEW_MEDICAL_RECORD` para consumirlo.
  - `27_notify_new_patient_trigger.sql`: trigger `on_patient_created_notify` → `NEW_PATIENT`.
  - `28_notify_new_evolution_trigger.sql`: trigger `on_evolution_created_notify` → `NEW_EVOLUTION` (actor = `opened_by`).
  - `29_notifications_metadata.sql`: agrega la columna `notifications.metadata JSONB`, extiende `public.notify_users(... , p_metadata JSONB)` y refactoriza todos los triggers para escribir un payload denormalizado (`actorName`, `subjectName/Email/Role`, `patientName`, `patientIdNumber`, `evolutionStatus`). Esto elimina el JOIN a `profiles` desde el cliente y evita problemas con RLS para no-admins. Incluye el helper `public.get_profile_full_name(uuid)`.
- Presentation:
  - Components: `NotificationBell` (popover en `AppLayout`).
  - Hooks: `useNotificationsList`, `useMarkNotificationRead(userId)`, `useMarkAllNotificationsRead(userId)`, `useNotificationSubscription` (realtime).
  - Registry: `registry/notificationRegistry.ts` — fuente única de verdad para icono, variante de toast, mensaje y ruta por tipo de notificación.

#### Receta: Agregar una notificación para un módulo nuevo
1. **Backend**: crear migración `XX_notify_new_<entity>_trigger.sql` con una función `SECURITY DEFINER` que:
   - Construye un `payload JSONB` con todos los datos que la UI necesitará para renderizar (mínimo `actorName` vía `public.get_profile_full_name(...)`, más los campos propios de la entidad). Esto es **obligatorio**: el cliente NO puede leer otras tablas para enriquecer notificaciones debido a RLS.
   - Llama `public.notify_users(NEW.<actor_column>, '<TIPO>', NEW.id, <roles?>, TRUE, payload)`.
   - Atrapa excepciones con `RAISE WARNING` para no romper el INSERT primario.
   - Adjunta un `AFTER INSERT` trigger sobre la tabla destino. **Reutilizar siempre** el helper `notify_users`, nunca duplicar el loop por perfiles.
2. **Domain**: añadir el literal al union `KnownNotificationType` en `domain/modules/notifications/models/Notification.ts`. Si introduces campos nuevos en metadata, extender `NotificationMetadata`.
3. **Registry**: agregar una entrada en `NOTIFICATION_REGISTRY` (en `presentation/modules/notifications/registry/notificationRegistry.ts`) con `icon` (id válido en `system-icons.svg`), `toastVariant`, `toastTitle`, `getMessage(notification, currentUserId)` consumiendo `notification.metadata.*`, y `getRoute(notification)` opcional.
4. **NO** modificar `NotificationBell.tsx` ni `useNotificationSubscription.ts`: ambos consumen el registry y soportan tipos nuevos automáticamente.

### 8. Users (`users`)
Administración de usuarios solo para `admin`: invitación (Edge Function), edición de perfil con avatar (Storage + crop), cambio de estado (`active` / `inactive` / `suspended`), soft delete y restore, presencia online en tiempo real (presence channel), vista en tabla y cards.

- Domain: `UserProfile`, `UserWithPresence`, `PresenceEntry`, `InviteUserPayload`, `UserFilters` y enums (`UserRole`: admin, doctor, nurse, receptionist, lab_technician, pharmacist; `AccountStatus`: active, inactive, suspended). Constantes `USER_ROLE_LABELS` y `ACCOUNT_STATUS_LABELS` para etiquetas en español.
- Application: `GetFilteredUsers`, `InviteUser`, `ToggleUserStatus`, `SoftDeleteUser`, `RestoreDeletedUser`, `UpdateUserProfileUseCase` (orquesta subida/borrado de avatar vía `StorageRepository` con path `{userId}/{timestamp}.{ext}`).
- Infrastructure: `SupabaseUserRepository` (RPCs de admin, edge function `invite-user`, presence channel `online-users`).
- Presentation:
  - Pages: `UsersManagementPage` (tabla / cards, filtros, acciones).
  - Components: `InviteUserModal`, `UserProfileModal`, `UserUpdatePasswordModal`, `UsersQuickFilterPopover`, `ActiveUsersFloat`, `wcUserCard`.
  - Hooks: `useAdminUsers`, `useUpdateProfile`, `usePresenceTracker`, `usePresenceSubscription`, `useProfilesSubscription`.
  - Store: `useUserStore`.
  - Schemas: `user.schema.ts`, `admin.schema.ts`.

### 9. Shared (`shared`)
Capa transversal con utilidades, validadores, storage y la librería de UI (`Wc*`).

- Domain: `StorageRepository` (avatares), `validateEcCedula` (algoritmo Módulo 10 ecuatoriano: 10 dígitos, provincia 01-24, tercer dígito 0-5).
- Infrastructure: `SupabaseStorageRepository` (bucket `avatars`, upsert + cacheControl 3600, generación de public URL y borrado tolerante a errores).
- Presentation:
  - Layout: `AppLayout` (sidebar pinable con hover-flyout, header con notificaciones, theme toggle, logout, `QuickActionBar`, `ActiveUsersFloat`, modales globales y `Toaster`).
  - Webcomponents (`presentation/modules/shared/components/ui/webcomponents/`):
    - `WcButton`, `WcButtonIcon`
    - `WcSearchInput`, `WcTextareaExpand`
    - `WcTables` (+ `TableAvatarCell`, `TableStatusBadge`, `TableActionCell`, `TableIconButton`)
    - `WcTabsFolder` (tabs con iconos y estado de error)
    - `WcModal`, `WcWarning`
    - `WcModuleHeader` (cabecera estándar de página con título, descripción, popover informativo y slot de acciones)
    - `WcFilterPopover`, `WcFilterTag`, `WcFilterTags`, `WcTag`
  - Otros componentes: `Sidebar`, `Icon` (consume `public/system-icons.svg` vía `<symbol>`), `EkLogo`, `Footer`, `PasswordInput`, `ThemeToggle`, `Toaster`, `ConfirmDialog` + `useConfirmDialog`, `ImageCropperModal`, `QuickActionBar`.
  - Hooks: `useDebounce`.
  - Store: `themeStore` (light/dark).
  - Utils: `imageUtils.ts` (procesado de imágenes para crop de avatar).

## Patrones Convencionales del Proyecto

### Paginación
Interfaz uniforme `PaginatedResult<T> = { data: T[]; total: number; page: number; limit: number }`. En Supabase se implementa con `range(from, to)` + `count: "exact"`. Los casos de uso de listas suelen validar que el rango de fechas no exceda 31 días.

### Soft Deletes
- Usuarios: `deleted_at` + RPC `soft_delete_user` / `restore_deleted_user`.
- Pacientes / Historias / Catálogos: flag `is_active`.
- Antecedentes clínicos: flag `is_active` con upsert manual.

### Búsquedas
- CIE-10: RPC `search_cie10` (full-text con ranking).
- Ubicación geográfica: `ilike` combinado en DPA + provincia + cantón + parroquia.
- Listas: `ilike` con prefijo/sufijo `%` o combinaciones `or(...)`.
- Toda search input usa `useDebounce` con `WcSearchInput`.

### Hooks Pattern
1. Instanciar repo (`new SupabaseXxxRepository()`).
2. Instanciar use case (`new XxxUseCase(repo)`).
3. Envolver en `useQuery` / `useMutation`.
4. Invalidar `queryClient.invalidateQueries({ queryKey: [...] })` tras mutaciones o eventos realtime.

### Realtime
- Suscripciones se inicializan en hooks `useXxxSubscription` montados en `AppLayout` o pantallas relevantes.
- Nunca mutar caché manualmente: solo invalidar queryKeys.
- Presence: canal `online-users` se sincroniza vía `usePresenceTracker` (track) y `usePresenceSubscription` (sync).

### Formularios
- React Hook Form + `@hookform/resolvers/zod`.
- Schemas en `presentation/modules/<feature>/schemas/`.
- Errores se mapean a la tab correspondiente en flujos con `WcTabsFolder` (ver `EvolutionWorkspacePage`).
- Strict vs relaxed: borradores usan schema relajado; al cerrar/firmar se aplica schema estricto.

### Iconografía
Sprite SVG en `public/system-icons.svg`. Acceso vía `<Icon name="..." />`. Para añadir un icono nuevo, agregar un `<symbol id="...">` al sprite y referenciarlo por id; nunca pegar SVG inline en componentes.

## Convenciones para Añadir un Nuevo Módulo

1. **Domain (`src/domain/modules/<feature>/`)**
   - `models/Xxx.ts` con `interface`/`type` (sin dependencias externas).
   - `repositories/XxxRepository.ts` con la interfaz pública.
2. **Application (`src/application/modules/<feature>/use-cases/`)**
   - Una clase por caso de uso con `execute(...)`. Sin propiedades de parámetros en el constructor (asignar en el cuerpo).
   - Validaciones de negocio y traducción a errores genéricos en español.
3. **Infrastructure (`src/infrastructure/modules/<feature>/`)**
   - `repositories/SupabaseXxxRepository.ts` implementando la interfaz del dominio.
   - `mappers/xxxMapper.ts` para snake_case ↔ camelCase.
   - Si requiere RLS especial o RPC, documentar la dependencia del backend en el PR.
4. **Presentation (`src/presentation/modules/<feature>/`)**
   - `pages/`, `components/`, `hooks/`, `schemas/`, `stores/`, `utils/` según necesidad.
   - Página principal usa `WcModuleHeader` y se monta dentro de `AppLayout` desde `App.tsx`.
   - Estado servidor SIEMPRE vía TanStack Query; UI efímera vía Zustand sin `persist` cuando contenga PII.
5. **Routing (`src/App.tsx`)**
   - Añadir la ruta envuelta en `ProtectedRoute` y `AppLayout`.
   - Si requiere rol restringido, pasar `allowedRoles={[...]}`.
6. **Logout / Cleanup**
   - Si el módulo agrega un store de Zustand con datos sensibles, asegúrese de resetearlo en el flujo de logout junto con `queryClient.clear()`.
7. **Notificaciones (si aplica)**
   - Si el módulo emite eventos que otros usuarios deberían saber (creación de entidad, asignación, alerta), seguir la receta del módulo `notifications` (ver sección **7. Notifications → Receta: Agregar una notificación para un módulo nuevo**). Resumen: 1 migración SQL invocando `public.notify_users(...)`, 1 literal en `KnownNotificationType`, 1 entrada en `NOTIFICATION_REGISTRY`. **Nunca** duplicar el loop de inserción en triggers ni el switch de mensajes en `NotificationBell`.

## Scripts del Proyecto

```bash
pnpm dev          # Vite dev server
pnpm build        # tsc -b && vite build (verificación de tipos obligatoria)
pnpm lint         # oxlint .
pnpm lint:fix     # oxlint --fix
pnpm preview      # Preview del build
```

Antes de marcar una tarea como completada, ejecutar como mínimo `pnpm lint` y, si se tocaron tipos públicos o esquemas, `pnpm build` para validar el typecheck.

