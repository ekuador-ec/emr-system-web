import type { Notification, NotificationType } from '@/domain/modules/notifications/models/Notification';

export type NotificationToastVariant = 'success' | 'info' | 'warning';
export type NotificationStatusTone = 'info' | 'success' | 'warning' | 'neutral';

export interface NotificationStatusBadge {
  label: string;
  tone: NotificationStatusTone;
}

export interface NotificationContent {
  title: string;
  description?: string | null;
  primary?: string | null;
  secondary?: string | null;
  status?: NotificationStatusBadge | null;
}

export interface NotificationDescriptor {
  icon: string;
  toastVariant: NotificationToastVariant;
  getContent: (notification: Notification, currentUserId?: string | null) => NotificationContent;
  getRoute?: (notification: Notification) => string | undefined;
}

const fallbackDescriptor: NotificationDescriptor = {
  icon: 'icon-bell',
  toastVariant: 'info',
  getContent: () => ({
    title: 'Nueva notificación',
    description: 'Tienes una nueva notificación en el sistema.',
  }),
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

function evolutionStatusTone(status: string): NotificationStatusTone {
  switch (status) {
    case 'ABIERTA':    return 'info';
    case 'EN_PROCESO': return 'warning';
    case 'CERRADA':    return 'success';
    default:           return 'neutral';
  }
}

function patientIdNumberLabel(notification: Notification): string | null {
  const idNumber = asString(notification.metadata.patientIdNumber);
  return idNumber ? `CI / ID: ${idNumber}` : null;
}

const NOTIFICATION_REGISTRY: Record<string, NotificationDescriptor> = {
  NEW_USER: {
    icon: 'icon-user-plus',
    toastVariant: 'info',
    getContent: (n, uid) => {
      const subject = asString(n.metadata.subjectName);
      const role = asString(n.metadata.subjectRole);
      const email = asString(n.metadata.subjectEmail);
      const secondaryParts = [role, email].filter((part): part is string => Boolean(part));
      const description = isSelfActor(n, uid)
        ? 'Registraste un nuevo usuario:'
        : `${actorLabel(n, 'Un administrador')} registró un nuevo usuario:`;
      return {
        title: 'Nuevo usuario registrado',
        description: subject ? description : null,
        primary: subject ?? (isSelfActor(n, uid) ? 'Has registrado un nuevo usuario.' : `${actorLabel(n, 'Un administrador')} registró un nuevo usuario.`),
        secondary: secondaryParts.length > 0 ? secondaryParts.join(' • ') : null,
      };
    },
    getRoute: () => '/admin/users',
  },

  NEW_PATIENT: {
    icon: 'icon-patient',
    toastVariant: 'success',
    getContent: (n, uid) => {
      const patientName = asString(n.metadata.patientName);
      const description = isSelfActor(n, uid)
        ? 'Registraste un nuevo paciente:'
        : `${actorLabel(n)} registró un nuevo paciente:`;
      return {
        title: 'Nuevo paciente registrado',
        description: patientName ? description : null,
        primary: patientName ?? (isSelfActor(n, uid) ? 'Has registrado un nuevo paciente.' : `${actorLabel(n)} registró un nuevo paciente.`),
        secondary: patientIdNumberLabel(n),
      };
    },
    getRoute: (n) => {
      const patientId = asString(n.metadata.patientId) ?? asString(n.entityId);
      if (patientId) return `/pacientes?openId=${patientId}`;
      const idNumber = asString(n.metadata.patientIdNumber);
      return idNumber ? `/pacientes?search=${encodeURIComponent(idNumber)}` : '/pacientes';
    },
  },

  NEW_MEDICAL_RECORD: {
    icon: 'icon-clinical-history',
    toastVariant: 'success',
    getContent: (n, uid) => {
      const patientName = asString(n.metadata.patientName);
      const description = isSelfActor(n, uid)
        ? 'Creaste una nueva historia clínica para:'
        : `${actorLabel(n)} creó una nueva historia clínica para:`;
      return {
        title: 'Nueva historia clínica',
        description: patientName ? description : null,
        primary: patientName ?? (isSelfActor(n, uid) ? 'Has creado una nueva historia clínica.' : `${actorLabel(n)} creó una nueva historia clínica.`),
        secondary: patientIdNumberLabel(n),
      };
    },
    getRoute: (n) => {
      const patientId = asString(n.metadata.patientId);
      if (patientId) return `/pacientes/${patientId}/historia`;
      return '/historias-clinicas';
    },
  },

  NEW_EVOLUTION: {
    icon: 'icon-medical-document',
    toastVariant: 'success',
    getContent: (n, uid) => {
      const patientName = asString(n.metadata.patientName);
      const status = asString(n.metadata.evolutionStatus);
      const description = isSelfActor(n, uid)
        ? 'Registraste una nueva evolución para:'
        : `${actorLabel(n)} registró una nueva evolución para:`;
      return {
        title: 'Nueva evolución médica',
        description: patientName ? description : null,
        primary: patientName ?? (isSelfActor(n, uid) ? 'Has registrado una nueva evolución.' : `${actorLabel(n)} registró una nueva evolución.`),
        secondary: patientIdNumberLabel(n),
        status: status ? { label: status, tone: evolutionStatusTone(status) } : null,
      };
    },
    getRoute: (n) => {
      const patientId = asString(n.metadata.patientId);
      const evolutionId = asString(n.entityId);
      if (patientId && evolutionId) {
        return `/pacientes/${patientId}/historia/evoluciones/${evolutionId}`;
      }
      return '/evoluciones';
    },
  },

  NEW_FORM005: {
    icon: 'icon-medical-document',
    toastVariant: 'success',
    getContent: (n, uid) => {
      const patientName = asString(n.metadata.patientName);
      const status = asString(n.metadata.documentStatus);
      const description = isSelfActor(n, uid)
        ? 'Registraste un nuevo Formulario 005 para:'
        : `${actorLabel(n)} registró un nuevo Formulario 005 para:`;
      return {
        title: 'Nuevo Formulario 005',
        description: patientName ? description : null,
        primary: patientName ?? (isSelfActor(n, uid) ? 'Has registrado un nuevo Formulario 005.' : `${actorLabel(n)} registró un nuevo Formulario 005.`),
        secondary: patientIdNumberLabel(n),
        status: status ? { label: status, tone: evolutionStatusTone(status) } : null,
      };
    },
    getRoute: (n) => {
      const patientId = asString(n.metadata.patientId);
      const documentId = asString(n.entityId);
      if (patientId && documentId) {
        return `/pacientes/${patientId}/historia/documentos/form005/${documentId}`;
      }
      return '/documentos';
    },
  },

  NEW_MESSAGE: {
    icon: 'icon-messages',
    toastVariant: 'info',
    getContent: (n, uid) => {
      const sender = actorLabel(n, 'Otro usuario');
      const preview = asString(n.metadata.preview);
      const description = isSelfActor(n, uid)
        ? 'Te enviaste un mensaje:'
        : `${sender} te envio un mensaje:`;
      return {
        title: 'Nuevo mensaje',
        description: preview ? description : null,
        primary: preview ?? `${sender} te envio un mensaje.`,
      };
    },
    getRoute: (n) => {
      const conversationId = asString(n.metadata.conversationId);
      return conversationId ? `/mensajes?c=${conversationId}` : '/mensajes';
    },
  },

  TASK_ASSIGNED: {
    icon: 'icon-user-voice',
    toastVariant: 'info',
    getContent: (n, uid) => ({
      title: 'Tarea asignada',
      primary: isSelfActor(n, uid)
        ? 'Te has asignado una nueva tarea.'
        : `${actorLabel(n)} te asignó una nueva tarea.`,
    }),
  },

  SYSTEM_ALERT: {
    icon: 'icon-alert-triangle',
    toastVariant: 'warning',
    getContent: () => ({
      title: 'Alerta del sistema',
      description: 'Se ha emitido una alerta del sistema. Revísala cuanto antes.',
    }),
  },
};

export function describeNotification(type: NotificationType): NotificationDescriptor {
  return NOTIFICATION_REGISTRY[type] ?? fallbackDescriptor;
}

export function registerNotificationDescriptor(type: string, descriptor: NotificationDescriptor): void {
  NOTIFICATION_REGISTRY[type] = descriptor;
}

export function notificationToastMessage(content: NotificationContent): string {
  const parts = [content.title];
  if (content.primary) parts.push(content.primary);
  return parts.join(' — ');
}
