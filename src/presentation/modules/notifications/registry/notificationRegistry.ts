import type { Notification, NotificationType } from '@/domain/modules/notifications/models/Notification';

export type NotificationToastVariant = 'success' | 'info' | 'warning';

export interface NotificationDescriptor {
  icon: string;
  toastVariant: NotificationToastVariant;
  toastTitle: string;
  getMessage: (notification: Notification, currentUserId?: string | null) => string;
  getRoute?: (notification: Notification) => string | undefined;
}

const fallbackDescriptor: NotificationDescriptor = {
  icon: 'icon-bell',
  toastVariant: 'info',
  toastTitle: 'Nueva notificación',
  getMessage: () => 'Tienes una nueva notificación en el sistema.',
};

const isSelfActor = (notification: Notification, currentUserId?: string | null) =>
  Boolean(currentUserId) && notification.actorId === currentUserId;

const actorLabel = (notification: Notification, fallbackName = 'Otro usuario') =>
  notification.actorName?.trim() || fallbackName;

const NOTIFICATION_REGISTRY: Record<string, NotificationDescriptor> = {
  NEW_USER: {
    icon: 'icon-user-plus',
    toastVariant: 'info',
    toastTitle: 'Nuevo usuario registrado',
    getMessage: (n, uid) =>
      isSelfActor(n, uid)
        ? 'Has registrado un nuevo usuario en el sistema.'
        : `${actorLabel(n, 'Un administrador')} registró un nuevo usuario.`,
    getRoute: () => '/admin/users',
  },
  NEW_PATIENT: {
    icon: 'icon-patient',
    toastVariant: 'success',
    toastTitle: 'Nuevo paciente registrado',
    getMessage: (n, uid) =>
      isSelfActor(n, uid)
        ? 'Has registrado un nuevo paciente.'
        : `${actorLabel(n)} registró un nuevo paciente.`,
    getRoute: () => '/pacientes',
  },
  NEW_MEDICAL_RECORD: {
    icon: 'icon-clinical-history',
    toastVariant: 'success',
    toastTitle: 'Nueva historia clínica',
    getMessage: (n, uid) =>
      isSelfActor(n, uid)
        ? 'Has creado una nueva historia clínica.'
        : `${actorLabel(n)} creó una nueva historia clínica.`,
    getRoute: () => '/historias-clinicas',
  },
  NEW_EVOLUTION: {
    icon: 'icon-medical-evolution',
    toastVariant: 'success',
    toastTitle: 'Nueva evolución médica',
    getMessage: (n, uid) =>
      isSelfActor(n, uid)
        ? 'Has registrado una nueva evolución médica.'
        : `${actorLabel(n)} registró una nueva evolución médica.`,
    getRoute: () => '/evoluciones',
  },
  TASK_ASSIGNED: {
    icon: 'icon-user-voice',
    toastVariant: 'info',
    toastTitle: 'Tarea asignada',
    getMessage: (n, uid) =>
      isSelfActor(n, uid)
        ? 'Te has asignado una nueva tarea.'
        : `${actorLabel(n)} te asignó una nueva tarea.`,
  },
  SYSTEM_ALERT: {
    icon: 'icon-alert-triangle',
    toastVariant: 'warning',
    toastTitle: 'Alerta del sistema',
    getMessage: () => 'Se ha emitido una alerta del sistema. Revísala cuanto antes.',
  },
};

export function describeNotification(type: NotificationType): NotificationDescriptor {
  return NOTIFICATION_REGISTRY[type] ?? fallbackDescriptor;
}

export function registerNotificationDescriptor(type: string, descriptor: NotificationDescriptor): void {
  NOTIFICATION_REGISTRY[type] = descriptor;
}
