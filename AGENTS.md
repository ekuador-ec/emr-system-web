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
  - **Excepción única (borradores de EM cifrados):** los borradores activos de Evoluciones Médicas (status `ABIERTA` o `EN_PROCESO`) pueden almacenarse temporalmente en `localStorage` **siempre que** cumplan TODAS estas condiciones:
    1. El payload se cifre con AES-GCM antes de escribir, usando una clave derivada del `access_token` de la sesión actual de Supabase (HKDF + `crypto.subtle`). La clave nunca se persiste.
    2. Cada entrada se identifique por `emr:draft:<evolutionId>` y se limpie en cuanto el autosave al servidor responda OK.
    3. Se limpien todas las entradas al cerrar sesión y al transicionar la EM a `CERRADA`.
    4. Sirvan únicamente como red de seguridad offline frente a pérdida de conexión o cierre accidental — la fuente de verdad sigue siendo el servidor.
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

Módulos activos: `ai`, `auth`, `catalog`, `dashboard`, `evolution`, `medical-record`, `messaging`, `notifications`, `patient`, `reports`, `shared`, `users`.

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
| `/mensajes` | `MessagesPage` | Autenticado |
| `/reportes` | `ReportsPage` | Autenticado |
| `/asistente-ia` | `AiAssistantPage` | Autenticado |
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

- Domain: `Notification` (incluye `metadata: NotificationMetadata`), `KnownNotificationType` (`NEW_USER` | `NEW_PATIENT` | `NEW_MEDICAL_RECORD` | `NEW_EVOLUTION` | `NEW_MESSAGE` | `TASK_ASSIGNED` | `SYSTEM_ALERT`), `NotificationType` (unión abierta).
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
Administración de usuarios solo para `admin`: invitación (Edge Function), edición de perfil con avatar (Storage + crop), cambio de estado (`active` / `inactive` / `suspended`), soft delete y restore, presencia en tiempo real con cuatro estados (online/away/busy/offline), vista en tabla y cards.

- Domain: `UserProfile`, `UserWithPresence`, `PresenceEntry`, `MyPresenceSnapshot`, `InviteUserPayload`, `UserFilters` y enums (`UserRole`: admin, doctor, nurse, receptionist, lab_technician, pharmacist; `AccountStatus`: active, inactive, suspended; `PresenceStatus`: online | away | busy | offline; `ManualPresenceStatus`: available | busy | invisible; `PresenceActivitySignal`: active | idle). Constantes `USER_ROLE_LABELS`, `ACCOUNT_STATUS_LABELS`, `PRESENCE_STATUS_LABELS`, `MANUAL_PRESENCE_LABELS` para etiquetas en español.
- Application: `GetFilteredUsers` (acepta `presenceStatuses: PresenceStatus[]`), `InviteUser`, `ToggleUserStatus`, `SoftDeleteUser`, `RestoreDeletedUser`, `UpdateUserProfileUseCase`, `SendPresenceHeartbeat`, `SetManualPresence`, `GetMyPresence`.
- Infrastructure: `SupabaseUserRepository` (RPCs de admin, edge function `invite-user`, RPCs de presencia `upsert_presence_heartbeat`, `set_manual_presence`, `get_my_presence`).
- Backend de presencia (`supabase/migrations/`):
  - `05_presence_tracking.sql`: tabla original `presence_status` con `user_id`, `is_online`, `last_seen`.
  - `53_presence_status_extended.sql`: amplia la tabla con `manual_status` (`available|busy|invisible`) y `activity_signal` (`active|idle`). Helper `effective_presence_status(last_seen, manual, activity)` calcula el estado efectivo (online/away/busy/offline). RPCs nuevas: `upsert_presence_heartbeat(p_user_id, p_activity_signal)`, `set_manual_presence(p_user_id, p_manual_status)`, `get_my_presence()` (solo expone la fila del caller, incluye `manual_status`). El RPC legacy `upsert_presence(user_id, is_online)` queda como shim de compatibilidad. RPCs admin (`get_all_users_admin`, `get_filtered_users_admin`) y `list_messaging_contacts` se refactorizaron para devolver `presence_status TEXT` derivado por SQL; `get_filtered_users_admin` acepta el parámetro nuevo `filter_presence TEXT[]`. Reaper `reap_stale_presence()` programado con `pg_cron` cada minuto: marca `activity_signal = idle` cuando `last_seen < now() - 2min` y `is_online = false` cuando `last_seen < now() - 5min`, garantizando que el cierre abrupto del navegador se propague en menos de 5 minutos sin depender del cliente.
- Presentation:
  - Pages: `UsersManagementPage` (tabla / cards, filtros, acciones). El filtro de conexión ahora es multi-select sobre los 4 `PresenceStatus` (`presence` en `UsersQuickFilterState`).
  - Components: `InviteUserModal`, `UserProfileModal`, `UserUpdatePasswordModal`, `UsersQuickFilterPopover` (con campo `presence: PresenceStatus[]`), `wcUserCard` (chip de presencia adicional). El selector de estado manual vive en `FloatingProfileHub` (shared) como un grupo dentro del menú del avatar: Disponible / Ocupado / Aparecer desconectado (Ausente NO se elige manualmente, se deriva de la inactividad).
  - Hooks:
    - `useAdminUsers`, `useUpdateProfile`, `useProfilesSubscription`.
    - `usePresenceTracker(userId)` (montado en `AppLayout`): FSM con heartbeat 30s focus / 60s hidden, idle por 10 min sin input, idle por 2 min con `document.hidden`, sin marcar offline desde cliente (el reaper se encarga). Listeners pasivos en `mousemove/keydown/wheel/touchstart/scroll` con throttle 1s. Cleanup en logout/unmount manda un heartbeat final con `activity_signal = idle` e invalida queries de admin y mensajería.
    - `usePresenceSubscription(enabled)` (montado en `AppLayout`): escucha `postgres_changes` sobre `presence_status` e invalida `["admin","users"]` + `MESSAGING_QUERY_KEY` para que el reaper propague a la UI sin reload.
    - `useSetManualPresence(userId)`: mutación TanStack Query con update optimista del `usePresenceStore`, rollback en error, invalidación de admin + mensajería en éxito.
  - Store: `useUserStore` (UI), `usePresenceStore` (Zustand sin `persist`: `manualStatus`, `activitySignal`, `effectiveStatus`, `isHydrated`). Helper `deriveEffectivePresence(manual, activity)` espeja la fórmula SQL para optimismo cliente. El store se resetea en `useAuth.logout` junto con los demás stores de PII.
  - Utils: `presenceMap.ts` en `messaging/utils/` (`buildPresenceMap`, `presenceOf`) para que componentes de mensajería consuman el estado efectivo de cada contacto desde una sola fuente.
  - Schemas: `user.schema.ts`, `admin.schema.ts`.

### 9. Messaging (`messaging`)
Mensajería 1:1 en tiempo real entre usuarios autenticados. Página dedicada `/mensajes` (lista + chat) y sistema de burbujas flotantes estilo Messenger disponible globalmente. Soporta envío con Enter, indicador "escribiendo", presencia online reutilizada del módulo users, conteo de no leídos, silenciar conversaciones y borradores cifrados en localStorage. Los mensajes y conversaciones inactivas se eliminan automáticamente a los 30 días vía `pg_cron`.

- Domain: `Conversation`, `ConversationParticipantSummary`, `ConversationType` (`direct` | `group`), `MessagingContact`, `Message`, `MessagePage`, `ConversationRepository`, `MessageRepository` (+ `ListMessagesOptions`).
- Application: `ListConversationsUseCase`, `GetConversationUseCase`, `OpenDirectConversationUseCase`, `ListMessagesUseCase` (paginación cursor `before` + límite 50), `SendMessageUseCase` (valida 1–4000 chars, trim), `MarkConversationReadUseCase`, `ToggleConversationMuteUseCase`, `ListMessagingContactsUseCase`.
- Infrastructure: `SupabaseConversationRepository` (combina `listForUser` con RPC `get_unread_counts` y ordena por `last_message_at`; usa RPC `get_or_create_direct_conversation`, `mark_conversation_read`, `list_messaging_contacts`), `SupabaseMessageRepository` (`listByConversation` con cursor descendente, `send` con `sender_id = auth.uid()`).
- Backend (`supabase/migrations/`):
  - `40_conversations_schema.sql`: tablas `conversations` y `conversation_participants` con RLS (solo participantes), RPC `get_or_create_direct_conversation` (SECURITY DEFINER).
  - `41_messages_schema.sql`: tabla `messages` con RLS, trigger `touch_conversation_on_message` que actualiza `last_message_*` del padre, RPCs `mark_conversation_read` y `get_unread_counts`.
  - `42_messages_realtime_and_notify.sql`: añade `conversations`, `conversation_participants` y `messages` a la publication `supabase_realtime`. Trigger `notify_new_message` que **deduplica** notificaciones `NEW_MESSAGE` por destinatario y conversación (refresca la existente no leída en vez de crear una nueva) — esto evita inundar la campana durante envíos rápidos.
  - `43_messages_cleanup_30d.sql`: helper `public.run_messaging_cleanup()` + job `pg_cron` diario a las 03:15 UTC.
  - `44_list_messaging_contacts.sql`: RPC `list_messaging_contacts()` (SECURITY DEFINER, accesible a `authenticated`) que devuelve el subset mínimo de profiles + presencia para alimentar el selector de contactos sin exponer email/identification_number.
- Presentation:
  - Pages: `MessagesPage` (layout 2-paneles + soporte deep-link `?c=<conversationId>`).
  - Components: `ConversationList`, `ConversationListItem`, `ChatWindow` (header + lista + composer; reusable en página y burbuja vía prop `compact`), `MessageList` (agrupa por día y por sender), `MessageBubble`, `MessageComposer` (`Enter` envía, `Shift+Enter` salto), `NewChatPicker` (modal con `WcModal` + `WcSearchInput`), `UserAvatar`, `FloatingChatHub` (botón flotante + popover con tabs Chats/Usuarios), `FloatingChatBubbles` (stack de mini-ventanas estilo Messenger, máx 3 en desktop).
  - Hooks: `useConversations`, `useConversation`, `useMessagingContacts`, `useOpenDirectConversation`, `useMarkConversationRead`, `useToggleConversationMute`, `useMessages` (`useInfiniteQuery`), `useSendMessage`, `useMessagingSubscription` (Realtime: INSERT/UPDATE en messages, conversations y conversation_participants — auto-pop burbuja minimizada en mensajes entrantes con conversación cerrada), `useTypingChannel` (Broadcast Realtime en `messaging:typing:<convId>`), `useMessageDraft` (debounce 500ms), `useUnreadMessagesTotal` (badge sidebar).
  - Store: `useMessagingUIStore` (Zustand: `activeConversationId`, `bubbles`, `isHubOpen`, `hubTab`, `isNewChatPickerOpen`; **sin `persist`**). Export auxiliar `isConversationOpenSomewhere(id)` para suprimir toasts cuando la conv. ya está visible.
  - Schemas: `message.schema.ts` (Zod: trim, 1–4000 chars).
  - Utils: `formatMessageTime.ts` (`formatMessageTime`, `formatRelativeShort`, `formatDayHeading`, `isSameDay`, `fullName`, `userInitials`), `messageDraftCache.ts` (envoltorio sobre `infrastructure/core/draftCache` para borradores cifrados con prefijo `emr:msg-draft:`).
- Borradores cifrados: el módulo añade el prefijo `emr:msg-draft:` al registro global de `draftCache`. La función `clearAllDrafts()` (invocada desde `useAuth` al hacer logout) borra automáticamente tanto los borradores de EM como los de mensajería. Cumple la excepción autorizada en AGENTS.md (cifrado AES-GCM con clave derivada del `access_token` vía HKDF).
- Notificaciones: el tipo `NEW_MESSAGE` está registrado en `notificationRegistry.ts`. La metadata incluye `actorName`, `conversationId` y `preview`. `useNotificationSubscription` suprime el toast si `isConversationOpenSomewhere(conversationId)` devuelve `true`.

### 10. Shared (`shared`)
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

### 11. Reports (`reports`)
Modulo de analitica y reportes. Provee dos superficies: el `DashboardPage` (en `/`) que resume los KPIs principales de los ultimos 30 dias y la `ReportsPage` (en `/reportes`) con vistas detalladas filtrables por rango. Fases 1-5 estan completas: vista general, actividad clinica, diagnosticos, tendencias historicas (365 dias via snapshots), productividad por clinico, carga/picos, lazy-loading del modulo y exportacion CSV.

- Domain: `ReportRange` (`from`, `to`, `granularity`), `ReportRangeOnly`, `GeneralKpis`, `EvolutionVolumePoint`, `DemographicBuckets`, `TopDiagnosis`, `TopDiagnosesFilters`, `EvolutionDistribution`, `EvolutionCloseStats`, `DiagnosesByChapter`, `DiagnosesSummary`, `DiagnosesChapterFilters`, `ClinicianProductivityRow`, `ClinicianProductivityFilters`, `WorkloadHeatmapCell`, `MetricKey`, `MetricSeriesPoint`, `MetricSeriesRequest`.
- Application: `GetGeneralKpisUseCase`, `GetEvolutionVolumeUseCase`, `GetPatientDemographicsUseCase`, `GetTopDiagnosesUseCase`, `GetEvolutionDistributionUseCase`, `GetEvolutionCloseStatsUseCase`, `GetDiagnosesByChapterUseCase`, `GetDiagnosesSummaryUseCase`, `GetClinicianProductivityUseCase`, `GetWorkloadHeatmapUseCase`, `GetMetricSeriesUseCase` (rango max 365 dias). Helper compartido `assertReportRange` (max 90 dias para RPCs en vivo).
- Infrastructure: `SupabaseReportsRepository` consume las RPCs `report_general_kpis`, `report_evolution_volume`, `report_patient_demographics`, `report_top_diagnoses`, `report_evolution_distribution`, `report_evolution_close_stats`, `report_diagnoses_by_chapter`, `report_diagnoses_summary`, `report_clinician_productivity`, `report_workload_heatmap`, `report_metric_series`. `reportsMapper.ts` normaliza snake_case y bigint string -> number.
- Backend:
  - `supabase/migrations/47_reports_general_kpis.sql`: RPCs basicas + helper `reports_assert_range` (max 90 dias).
  - `supabase/migrations/48_reports_clinical_activity.sql`: distribuciones por estado, arribo, causa clinica, alta; estadisticas de cierre (avg/mediana/p90/alertas > 24h y > 72h).
  - `supabase/migrations/49_reports_diagnoses_insights.sql`: agregaciones por capitulo CIE-10 y resumen comparativo ingreso/alta + presuntivo/definitivo.
  - `supabase/migrations/50_mv_evolutions_daily.sql`: materialized view diaria por (bucket, status, clinical_cause, arrival_method, opened_by) refrescada cada hora via `pg_cron`.
  - `supabase/migrations/51_reports_admin_kpis.sql`: RPCs admin con guard `reports_assert_admin()`. `report_clinician_productivity(from, to, role?)` y `report_workload_heatmap(from, to)` (ISO weekday en `America/Guayaquil`).
  - `supabase/migrations/52_report_snapshots.sql`: tabla generica `report_snapshots(snapshot_date, metric_key, value, dims jsonb)` con UNIQUE(snapshot_date, metric_key, dims) e indices `(metric_key, snapshot_date DESC)` + GIN(dims). Helpers `write_snapshot()`, `collect_daily_snapshots(date)` (idempotente, calcula 8+ metricas core), `backfill_report_snapshots(from, to)` (max 730 dias) y RPC publica `report_metric_series(key, from, to, dims?)` (max 365 dias). Job `pg_cron` nocturno a 03:30 UTC + bootstrap inicial al instalar la migracion.
  - Todas las RPCs son `SECURITY DEFINER` con `GRANT EXECUTE` a `authenticated`. Las admin verifican rol internamente. Las agregaciones ocurren en Postgres; el cliente jamas descarga listados completos.
  - Catalogo actual de `metric_key`: `patients.total`, `patients.created.daily`, `medical_records.total`, `medical_records.created.daily`, `evolutions.created.daily` (con dims `status` o sin dims), `evolutions.closed.daily`, `diagnoses.created.daily`, `users.active.total`, `messages.created.daily`. Para agregar una nueva metrica basta con anadir el bloque en `collect_daily_snapshots()` (sin cambios de esquema gracias al diseno key+dims).
- Presentation:
  - Pages: `DashboardPage` (KPIs compactos + 2 mini-charts; CTA hacia `/reportes`), `ReportsPage` (cargada via `React.lazy` con `<Suspense>` desde `App.tsx`; `WcModuleHeader` + filtro de rango global + `WcTabsFolder` con tabs "General", "Actividad clinica", "Diagnosticos", "Tendencias historicas" y para admin "Productividad", "Carga y picos").
  - Components:
    - Widgets: `KpiCard`, `ChartCard`, `LineChartCard`, `BarChartCard`, `DonutChartCard`, `RankingTableCard`, `HeatmapCard`, `ExportCsvButton` (boton reusable con `csvExport.ts` - BOM UTF-8 + escape correcto). `chartPalette` tematizable.
    - Layout: `ReportSection`.
    - Filters: `ReportDateRangeFilter` parametrizable (`presets`, `maxDays`, `title`) - mismo componente sirve para rangos de 90 dias (tabs en vivo) y 365 dias (tendencias historicas); `SegmentedControl`.
    - Sections: `GeneralOverviewSection`, `ClinicalActivitySection`, `DiagnosesInsightsSection`, `HistoricalTrendsSection` (filtro local + multi-metric toggle + line chart con bucketizado cliente por dia/semana/mes), `AdminProductivitySection`, `AdminWorkloadSection`. La tabla rica de productividad vive en `ProductivityTable.tsx`.
  - Hooks: `useGeneralKpis`, `useEvolutionVolume`, `usePatientDemographics`, `useTopDiagnoses`, `useEvolutionDistribution`, `useEvolutionCloseStats`, `useDiagnosesByChapter`, `useDiagnosesSummary`, `useClinicianProductivity` (admin), `useWorkloadHeatmap` (admin), `useMetricSeries` (snapshots, `staleTime` 1h) - TanStack Query con `staleTime` 2-5 min para vivos, 1h para historicos, `refetchOnWindowFocus: false`. `useReportsRefresh` invalida todo el queryKey `['reports']`.
  - Store: `useReportsUIStore` (Zustand sin `persist`: preset, range, granularity para tabs en vivo). `HistoricalTrendsSection` mantiene su propio estado local porque opera en un universo de rangos distinto (max 365 dias).
  - Utils: `dateRange.ts` (presets cortos y largos: `last7..last365`, `mtd`, `lastMonth`, `ytd`, `lastFullYear`, `custom`); `reportLabels.ts`; `csvExport.ts` (`rowsToCsv`, `downloadCsv` con BOM UTF-8 y nombre con timestamp).
- Libreria de graficos: `recharts` (paleta tematizable via CSS vars).
- Bundling: `vite.config.ts` define `manualChunks` que separa `recharts` y `d3-*` en el chunk `vendor-charts`, ademas de chunks dedicados para `@tanstack/react-query`, `@supabase`, `react-router` y `emoji-picker-react`. El modulo `/reportes` se carga con `React.lazy` desde `App.tsx`, asi que la primera visita a otras rutas no descarga `recharts`.
- Performance:
  - RPCs en vivo: rango max 90 dias validado en SQL.
  - Series historicas: leen `report_snapshots` precalculados (idempotentes, generados por `collect_daily_snapshots()` cada noche). Cero impacto sobre tablas transaccionales para rangos largos.
  - `useQueries` despacha las 9+ series de tendencias en paralelo con queryKeys estables.
  - El modulo NO se suscribe a Realtime; refresh manual o por `staleTime`.
- Seguridad: las tabs admin se filtran por `useAuth().isAdmin` y las RPCs respaldan el guard en SQL (defensa en profundidad). RLS sobre `report_snapshots` solo permite SELECT a `authenticated`.

#### Recetas: Agregar un nuevo reporte o KPI

Hay tres escenarios comunes. Sigue el que aplique:

**A) Agregar una metrica al panel de Tendencias historicas (`HistoricalTrendsSection`)**

Es la opcion mas barata, sirve para cualquier KPI numerico diario y NO requiere cambios en frontend pesados.

1. **Backend**: dentro de `public.collect_daily_snapshots()` (migracion 52 o una nueva migracion ascendente) agregar un `PERFORM public.write_snapshot(p_date, '<namespace>.<metric>.daily', (SELECT ... FROM ... WHERE created_at::date = p_date));`. Para series con dimensiones, usar `INSERT ... GROUP BY ... ON CONFLICT (snapshot_date, metric_key, dims) DO UPDATE` siguiendo el patron del bloque `evolutions.created.daily` por status. Tras desplegar la migracion, opcionalmente ejecutar `SELECT public.backfill_report_snapshots('YYYY-MM-DD'::date, CURRENT_DATE - 1);` para poblar el historico.
2. **Domain**: anadir el literal a `MetricKey` (`src/domain/modules/reports/models/MetricSeries.ts`).
3. **Frontend**: anadir una entrada al `METRIC_CATALOG` dentro de `HistoricalTrendsSection.tsx` (`key`, `label`, `hint`, `aggregation`). El chip aparece automaticamente y se grafica en cuanto el usuario lo activa.
4. NO modificar `report_metric_series`, `useMetricSeries` ni el `LineChartCard`. Todo es data-driven gracias al diseno key+dims.

**B) Agregar una RPC en vivo con un nuevo conjunto de columnas**

Cuando la metrica no encaja en una serie diaria (rankings, agregaciones con filtros, distribuciones, etc.) y debe consultarse en tiempo real con rango maximo 90 dias.

1. **Backend**: nueva migracion `XX_reports_<feature>.sql` con la RPC. Reglas inviolables:
   - `LANGUAGE plpgsql SECURITY DEFINER STABLE`
   - `SET search_path = public, pg_temp`
   - Si es admin-only: `PERFORM public.reports_assert_admin();` al inicio.
   - Validar el rango: `PERFORM public.reports_assert_range(p_from, p_to, 90);`
   - `GRANT EXECUTE ON FUNCTION public.<nombre>(...) TO authenticated;`
   - Comentar con `COMMENT ON FUNCTION` describiendo proposito y limites.
   - Si la funcion usa `RETURNS TABLE(col_a, col_b, ...)` y referencia esos nombres como columnas/aliases dentro de CTEs, anteponer `#variable_conflict use_column` justo despues de `AS $$` para evitar el error "column reference X is ambiguous". Caso paradigmatico: `report_clinician_productivity` que reusa `user_id` en CTEs internas.
2. **Domain**: modelo en `src/domain/modules/reports/models/<Feature>.ts` y metodo en `ReportsRepository`.
3. **Application**: clase `Get<X>UseCase` con `execute` que llame `assertReportRange` y traduzca errores genericos en castellano (sin filtrar mensajes crudos del backend).
4. **Infrastructure**: implementar en `SupabaseReportsRepository` (`await supabase.rpc(...)`) y anadir interfaz `<X>Row` + metodo `to<X>` en `reportsMapper.ts` (snake_case -> camelCase, `toNumber` para bigints serializados como string).
5. **Hook**: agregar `use<X>` en `useReports.ts`. `staleTime` 2 min para KPIs, 5 min para series, 5 min para distribuciones. Para hooks admin: `enabled: isAdmin` ademas de la guard SQL (defensa en profundidad + evita 401s ruidosos).
6. **Presentation**: crear la seccion (`<X>Section.tsx`) usando los widgets existentes (`KpiCard`, `LineChartCard`, `BarChartCard`, `DonutChartCard`, `RankingTableCard`, `HeatmapCard`). Si hay tabla descargable, incorporar `ExportCsvButton` via la prop `actions` del widget o en la toolbar de la seccion.
7. **Routing**: anadir la tab en `ReportsPage.tsx`. Para tabs admin, agregarlas al bloque `if (isAdmin)`.
8. **Documentar la migracion** en esta seccion (`AGENTS.md`) con su lista de RPCs.

**C) Agregar un widget visual nuevo**

Cuando ningun widget existente sirve para representar la metrica.

1. Crear en `src/presentation/modules/reports/components/widgets/<X>Card.tsx` + `.css`. Convencion: aceptar `title`, `subtitle`, `isLoading`, `isEmpty`, `actions?: ReactNode`. Si usa colores, leer `chartColorAt(index)` para respetar la paleta tematica.
2. Si encapsula una libreria pesada, exportar mediante `React.lazy` desde la seccion que lo consume. Recharts ya esta en un chunk separado (`vendor-charts`) gracias al `manualChunks` de Vite, por lo que widgets adicionales basados en Recharts NO incrementan el bundle inicial.
3. Reutilizar antes de crear: muchas distribuciones encajan en `BarChartCard` o `DonutChartCard` con datos `{ label, value }`.

**Lineamientos transversales**
- Las queries de TanStack Query SIEMPRE deben tener queryKeys estables: `["reports", "<feature>", ...params].`
- Refresh manual: llamar `useReportsRefresh()` que invalida todo el keyspace `['reports']`. Para invalidaciones quirurgicas usar `queryClient.invalidateQueries({ queryKey: ['reports', '<feature>'] })`.
- Filtros y rangos sensibles a fechas pasan por `assertReportRange` (max 90 dias) o por la validacion local de `HistoricalTrendsSection` (max 365 dias). Toda RPC debe replicar la validacion en SQL (no confiar en el cliente).
- Para series con > 90 dias, los datos SIEMPRE vienen de `report_snapshots`. Si una nueva pestana lo necesita, agregar la metrica al job nocturno (receta A) antes de tocar UI.

### 12. AI Assistant (`ai`)
Modulo cliente que se integra con un servicio externo independiente (`emr-ai-service`, repo separado) para ofrecer **resumenes clinicos** de HC y EM, y **conversaciones de seguimiento** (chat con streaming SSE token a token). Toda la comunicacion respeta dos reglas no negociables: a) los datos enviados al LLM **estan anonimizados en cliente** (sin nombres, cedula, telefono, email, direccion) y el servidor aplica una segunda capa de sanitizacion como red de seguridad; b) la autenticacion combina `X-Api-Key` propio del tenant + JWT del Supabase del usuario.

- Domain (`src/domain/modules/ai`):
  - Modelos: `AiSummary`, `AiSummaryKind` (`medical_record` | `evolution`), `AiModelPreference` (`auto` | `deepseek`), `AiProviderName` (`deepseek` | `openrouter` | `mock`), `AiConversation`, `AiMessage`, `AiConversationWithMessages`.
  - Repositorio: `AiServiceRepository` con `generateSummary`, `getLatestSummary`, `createConversation`, `listConversations`, `getConversation`, `deleteConversation`, `streamChatMessage(events, signal)`. Los eventos SSE estan tipados (`SseChatEvents`: `onConversation`, `onDelta`, `onDone`, `onCompleted`, `onError`).
- Application (`src/application/modules/ai/use-cases/`):
  - `GenerateAiSummaryUseCase`, `GetLatestAiSummaryUseCase`, `StartAiConversationUseCase`, `ListAiConversationsUseCase`, `GetAiConversationUseCase`, `DeleteAiConversationUseCase`, `StreamAiChatMessageUseCase` (valida 1-4000 chars y trim).
- Infrastructure (`src/infrastructure/modules/ai/`):
  - `AiApiClient`: cliente HTTP que adjunta `X-Api-Key` desde `VITE_AI_SERVICE_API_KEY` y `Authorization: Bearer` leyendo el access_token vivo desde `supabase.auth.getSession()` en cada request. Lanza `AiApiError` con `code`, `status` y `details` cuando el backend responde error. Expone `openSseStream` que devuelve un `ReadableStreamDefaultReader<Uint8Array>` listo para consumir.
  - `sseParser.ts`: `consumeSse(reader, onEvent, signal)` parsea el flujo SSE respetando la spec (eventos separados por `\n\n`, soporta `event:` + multiples `data:`, ignora comentarios `:` y heartbeats), maneja abort y vuelca el buffer parcial al cerrar.
  - `HttpAiServiceRepository`: implementa `AiServiceRepository` traduciendo cada metodo al endpoint correspondiente y, en `streamChatMessage`, despacha cada evento SSE al handler tipado adecuado.
  - `config.ts`: composition root del modulo. Exporta `aiServiceConfigured` (boolean) que es `false` si falta cualquiera de `VITE_AI_SERVICE_URL` o `VITE_AI_SERVICE_API_KEY`; los hooks consultan este flag para deshabilitarse limpiamente sin romper la app si el servicio no esta desplegado.
- Presentation (`src/presentation/modules/ai/`):
  - Pages: ninguna nueva (el modulo solo aporta modales). El asistente se invoca desde otras paginas.
  - Components:
    - `AiAssistantModal`: el modal principal. Muestra el resumen mas reciente (o accion para generarlo), el selector de modelo, y -cuando el resumen existe- un panel de chat con composer + lista de mensajes + stream en vivo.
    - `AiAssistantTrigger`: boton reusable (`WcButton`) que abre el modal seteando el target en el store.
    - `MedicalRecordAiAssistant` y `EvolutionAiAssistant`: wrappers que cargan datos via hooks existentes (`useMedicalRecordByPatient`, `usePatient`, `useEvolutionsByMedicalRecord`, `useEvolution`), arman el payload anonimizado con la funcion correspondiente y montan el trigger + modal.
    - `ChatBubble`: burbuja del mensaje. Para `role=assistant` renderiza con `MarkdownRenderer`; para `role=user` muestra texto plano. Incluye indicador animado de stream cuando `isStreaming`.
    - `MarkdownRenderer`: renderer minimalista (sin dependencias) que soporta `#`/`##`/`###`, listas `-`/`*`, `**negrita**`, `*cursiva*` y `` `codigo` ``. Suficiente para los resumenes estructurados que produce el servicio.
    - `ModelPreferenceSelector`: radio-group accesible para alternar entre `auto` (OpenRouter rotando modelos) y `deepseek` (modelo fijo).
  - Hooks:
    - `useLatestAiSummary(kind, entityId)`: `useQuery` con `staleTime: 5 min`, deshabilitado si `aiServiceConfigured` es `false`.
    - `useGenerateAiSummary()`: `useMutation` que actualiza directamente el cache de `useLatestAiSummary` en `onSuccess`.
    - `useAiConversations`, `useAiConversation`, `useStartAiConversation`, `useDeleteAiConversation`: capa CRUD de conversaciones contra TanStack Query.
    - `useStreamAiChat(conversationId)`: hook especializado para el streaming. Gestiona `AbortController`, escribe los chunks del LLM en el store y, al recibir el evento `completed`, agrega `userMessage` y `assistantMessage` al cache de `useAiConversation` deduplicando por `id`. Cancela limpiamente en unmount.
  - Store: `useAiAssistantStore` (Zustand sin `persist`). Mantiene `isOpen`, `target` (`{ kind, entityId, label }`), `preference`, `activeConversationId`, `streamingDraft`, `isStreaming`. Expone `open`, `close`, `setPreference`, `setActiveConversation`, `appendStreamingChunk`, `resetStreaming`, `setStreaming`, `reset` (este ultimo se invoca desde `useAuth` en el logout).
  - Schemas: `ai.schema.ts` con `aiChatMessageSchema` (Zod, 1-4000 chars trim).
  - Utils:
    - `anonymizePatient(patient)`: convierte `Patient` en `AnonymizedPatient`. Calcula `ageYears` a partir de `birthDate`, conserva `gender`, `bloodType`, `maritalStatus`, `culturalGroup`, `educationLevel`, `occupation.name`, ubicacion (`province`, `canton`, `parish`) y antecedentes clinicos completos con CIE-10. **No envia** `firstName`, `lastName`, `idNumber`, `email`, `phone`, `homeAddress`, `birthDate`, `emergencyContacts`, ni cualquier campo de empresa con datos personales.
    - `anonymizeEvolution(evolution)`: convierte `MedicalEvolution` en `AnonymizedEvolution`. Conserva signos vitales, examen fisico, lesiones, diagnosticos CIE-10, plan, descargas, datos obstetricos (cuando aplica). **No envia** `informationSource`, `referringPerson`, `contactNumber`, `eventAddress`, `referralFacility` ni nada que pueda identificar al paciente o a terceros.
    - `anonymizeMedicalRecord(record, patient, evolutions)`: combina las dos anteriores para el resumen de HC, agregando `evolutionCount`, `createdAt`, `updatedAt`. El servidor recibe la HC anonimizada con TODAS sus EM anonimizadas.

#### Integracion en las paginas existentes
- `MedicalRecordPage`: monta `<MedicalRecordAiAssistant patientId={patientId} />` cuando el medical record existe. El boton aparece sobre la lista de evoluciones, alineado a la derecha.
- `EvolutionWorkspacePage`: monta `<EvolutionAiAssistant evolutionId={evolution.id} />` debajo del banner del paciente, antes de los tabs. El asistente trabaja con la EM cargada por `useEvolution`.

#### Variables de entorno (`.env.example`)
```
VITE_AI_SERVICE_URL=https://ai.tudominio.com
VITE_AI_SERVICE_API_KEY=eai_xxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
Ambas son opcionales: si faltan, los botones siguen visibles pero el modal informa "Configuracion incompleta" en lugar de fallar. Permite que el repo principal compile y funcione sin el servicio desplegado.

#### Receta: agregar el asistente IA a una nueva entidad clinica
Si en el futuro se desea sumar resumenes para una nueva entidad (ej. una "consulta especializada"):
1. **Crear el anonymizer** en `src/presentation/modules/ai/utils/anonymize<Entity>.ts`. Solo campos clinicos + IDs internos; nunca PII.
2. **Crear un wrapper** `<Entity>AiAssistant.tsx` siguiendo el patron de `MedicalRecordAiAssistant` o `EvolutionAiAssistant`: usar los hooks de datos existentes y construir el payload con el nuevo anonymizer.
3. **Montar** el wrapper en la pagina destino. Si el `target.kind` ya esta cubierto por backend (`medical_record` o `evolution`), no se requieren cambios en el AI service. Si la entidad es nueva, hace falta extender el enum en `emr-ai-service` y agregar el prompt versionado correspondiente.
4. **Cero PII**: ningun anonymizer puede leer `firstName`, `lastName`, `idNumber`, `email`, `phone`, `address`, ni campos de contactos de emergencia. Si se requiere referenciar a un tercero (ej. medico tratante), usar su `id` o `role`, nunca su nombre.

#### Conversaciones generales (`kind = 'general'`)
Ademas de las conversaciones atadas a HC/EM, el modulo soporta consultas medicas libres ("dudas medicas del medico" sin paciente especifico). Estas viven en la pagina dedicada `/asistente-ia` y se accionan con el boton "Nueva" del sidebar de conversaciones.

- Backend (`emr-ai-service`): el enum `ConversationKind` extiende `SummaryKind` con `general`. Para `kind=general` el AI service exige `entityId=null` y `summaryId=null`, y aplica el prompt versionado `general-chat-v1` que incluye el bloque `MEDICAL_DOMAIN_GUARDRAIL`: si el usuario consulta algo NO medico, el asistente responde EXACTAMENTE con la frase de rechazo "Soy un asistente clinico especializado y solo puedo responder consultas relacionadas con medicina y salud..." y nada mas. Ese bloque tambien refuerza el prompt `chat-system-v1` de conversaciones HC/EM.
- Domain frontend: `AiConversationKind = AiSummaryKind | 'general'`. `AiConversation.entityId` y `AiConversation.summaryId` ambos `string | null`. `AiAssistantTarget.kind` usa el tipo extendido.
- Pagina `AiAssistantPage` (`/asistente-ia`):
  - Layout 2-paneles: sidebar con `AiConversationList` (agrupa por kind: "Consultas generales" -> "Historias clinicas" -> "Evoluciones") + main con `ChatPanel`.
  - Boton "Nueva" arriba del sidebar: crea una conversacion `kind=general` con `entityId=null` y abre el chat vacio.
  - Cada item del sidebar tiene icono segun kind, titulo, etiqueta del kind y tiempo relativo. Click selecciona; boton trash con confirm dialog elimina.
  - Deep link: la URL refleja `?c=<conversationId>` y se actualiza al cambiar de conversacion.
  - Banner permanente con el aviso de dominio medico y la recordacion explicita de no enviar datos identificables.

#### ChatPanel reutilizable y persistencia de borradores
- `ChatPanel.tsx` aisla la UI del chat (lista de mensajes + composer + indicador de streaming). Se usa tanto dentro del `AiAssistantModal` (flujo HC/EM con resumen previo) como en la pagina dedicada `/asistente-ia`. Solo recibe `conversationId` (string | null) y un `emptyHint` opcional.
- Borradores del composer cifrados en localStorage via `useAiMessageDraft(conversationId)`:
  - Reusa la infraestructura existente `infrastructure/core/draftCache` (AES-GCM con clave derivada del access_token, prefix registrado para que `clearAllDrafts()` los borre en logout).
  - Prefix dedicado: `emr:ai-chat-draft:<conversationId>`.
  - Hook expone `{ draft, setDraft, clear, isHydrating }`. `setDraft` hace debounce de 500ms antes de cifrar y guardar. Al enviar el mensaje se llama `clear()` que purga la entrada.
  - Al cambiar de `conversationId` la hidratacion es transparente (solicita el borrador del nuevo id, descarta el anterior si el componente sigue montado).


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

