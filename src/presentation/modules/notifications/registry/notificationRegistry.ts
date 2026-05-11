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

function asString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function actorLabel(notification: Notification, fallbackName = 'Otro usuario'): string {
  return asString(notification.metadata.actorName) ?? asString(notification.actorName) ?? fallbackName;
}

function patientLabel(notification: Notification): string | null {
  const name = asString(notification.metadata.patientName);
  const idNumber = asString(notification.metadata.patientIdNumber);
  if (name && idNumber) return `${name} (${idNumber})`;
  return name ?? idNumber;
}

const NOTIFICATION_REGISTRY: Record<string, NotificationDescriptor> = {
  NEW_USER: {
    icon: 'icon-user-plus',
    toastVariant: 'info',
    toastTitle: 'Nuevo usuario registrado',
    getMessage: (n, uid) => {
      const subject = asString(n.metadata.subjectName);
      const role = asString(n.metadata.subjectRole);
      const roleSuffix = role ? ` con el rol ${role}` : '';
      if (isSelfActor(n, uid)) {
        return subject
          ? `Has registrado a ${subject}${roleSuffix}.`
          : 'Has registrado un nuevo usuario.';
      }
      const actor = actorLabel(n, 'Un administrador');
      return subject
        ? `${actor} registró a ${subject}${roleSuffix}.`
        : `${actor} registró un nuevo usuario.`;
    },
    getRoute: () => '/admin/users',
  },
  NEW_PATIENT: {
    icon: 'icon-patient',
    toastVariant: 'success',
    toastTitle: 'Nuevo paciente registrado',
    getMessage: (n, uid) => {
      const patient = patientLabel(n);
      if (isSelfActor(n, uid)) {
        return patient
          ? `Has registrado al paciente ${patient}.`
          : 'Has registrado un nuevo paciente.';
      }
      const actor = actorLabel(n);
      return patient
        ? `${actor} registró al paciente ${patient}.`
        : `${actor} registró un nuevo paciente.`;
    },
    getRoute: () => '/pacientes',
  },
  NEW_MEDICAL_RECORD: {
    icon: 'icon-clinical-history',
    toastVariant: 'success',
    toastTitle: 'Nueva historia clínica',
    getMessage: (n, uid) => {
      const patient = patientLabel(n);
      if (isSelfActor(n, uid)) {
        return patient
          ? `Has creado la historia clínica de ${patient}.`
          : 'Has creado una nueva historia clínica.';
      }
      const actor = actorLabel(n);
      return patient
        ? `${actor} creó la historia clínica de ${patient}.`
        : `${actor} creó una nueva historia clínica.`;
    },
    getRoute: () => '/historias-clinicas',
  },
  NEW_EVOLUTION: {
    icon: 'icon-medical-evolution',
    toastVariant: 'success',
    toastTitle: 'Nueva evolución médica',
    getMessage: (n, uid) => {
      const patient = patientLabel(n);
      const status = asString(n.metadata.evolutionStatus);
      const statusSuffix = status ? ` (${status})` : '';
      if (isSelfActor(n, uid)) {
        return patient
          ? `Has registrado una evolución para ${patient}${statusSuffix}.`
          : 'Has registrado una nueva evolución médica.';
      }
      const actor = actorLabel(n);
      return patient
        ? `${actor} registró una evolución para ${patient}${statusSuffix}.`
        : `${actor} registró una nueva evolución médica.`;
    },
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
