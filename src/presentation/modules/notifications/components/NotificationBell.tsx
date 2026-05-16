import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotificationBell.css';
import { useNotificationsList, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/presentation/modules/notifications/hooks/useNotifications';
import { describeNotification, type NotificationStatusTone } from '@/presentation/modules/notifications/registry/notificationRegistry';
import WcButtonIcon from '@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon';
import { Icon } from '@/presentation/modules/shared/components/Sidebar/icons/Icon';
import {
  announceFloatingPopover,
  onFloatingPopoverOpened,
} from '@/presentation/modules/shared/utils/floatingPopoverBus';
import type { Notification } from '@/domain/modules/notifications/models/Notification';

interface NotificationBellProps {
  userId: string | undefined;
  onOpenChange?: (isOpen: boolean) => void;
}

const STATUS_TONE_STYLES: Record<NotificationStatusTone, { background: string; color: string }> = {
  info:    { background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',  color: 'var(--color-primary)' },
  success: { background: 'color-mix(in srgb, var(--color-success) 12%, transparent)',  color: 'var(--color-success)' },
  warning: { background: 'color-mix(in srgb, var(--color-warning) 15%, transparent)',  color: 'var(--color-warning)' },
  neutral: { background: 'color-mix(in srgb, var(--color-text-secondary) 15%, transparent)', color: 'var(--color-text-secondary)' },
};

function formatRelativeTime(createdAt: Date): string {
  const diffMs = Date.now() - createdAt.getTime();
  if (diffMs < 60_000) return 'hace unos segundos';
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `hace ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `hace ${diffD} d`;
  return createdAt.toLocaleDateString();
}

function groupNotifications(notifications: Notification[]) {
  const groups = {
    today: [] as Notification[],
    yesterday: [] as Notification[],
    thisWeek: [] as Notification[],
    older: [] as Notification[]
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  notifications.forEach(n => {
    const d = new Date(n.createdAt);
    if (d >= todayStart) {
      groups.today.push(n);
    } else if (d >= yesterdayStart && d < todayStart) {
      groups.yesterday.push(n);
    } else if (d >= weekStart && d < yesterdayStart) {
      groups.thisWeek.push(n);
    } else {
      groups.older.push(n);
    }
  });

  return groups;
}

const TYPE_COLORS: Record<string, { base: string, glow: string }> = {
  NEW_PATIENT: { base: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' }, // Blue
  NEW_MEDICAL_RECORD: { base: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' }, // Emerald/Teal
  NEW_EVOLUTION: { base: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)' }, // Violet
  NEW_USER: { base: '#64748b', glow: 'rgba(100, 116, 139, 0.4)' }, // Slate
  NEW_MESSAGE: { base: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)' }, // Cyan
  TASK_ASSIGNED: { base: '#0ea5e9', glow: 'rgba(14, 165, 233, 0.4)' }, // Sky Blue
  SYSTEM_ALERT: { base: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' }, // Red
};

const getVariantStyles = (type: string, isRead: boolean) => {
  if (isRead) {
    return {
      bg: 'transparent',
      border: '1px solid transparent',
      iconBg: 'color-mix(in srgb, var(--color-text-secondary) 12%, transparent)',
      iconColor: 'var(--color-text-secondary)',
      hoverBg: 'color-mix(in srgb, var(--color-text) 4%, transparent)',
      glow: 'transparent',
    };
  }

  const colors = TYPE_COLORS[type] || { base: 'var(--color-primary)', glow: 'color-mix(in srgb, var(--color-primary) 40%, transparent)' };

  return {
    bg: `color-mix(in srgb, ${colors.base} 8%, transparent)`,
    border: `1px solid color-mix(in srgb, ${colors.base} 20%, transparent)`,
    iconBg: colors.base,
    iconColor: '#ffffff',
    hoverBg: `color-mix(in srgb, ${colors.base} 12%, transparent)`,
    glow: colors.glow,
  };
};

export function NotificationBell({ userId, onOpenChange }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: notifications = [], isLoading } = useNotificationsList(userId);
  const { mutate: markAsRead } = useMarkNotificationRead(userId);
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllNotificationsRead(userId);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return onFloatingPopoverOpened("notifications", () => setIsOpen(false));
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    const descriptor = describeNotification(notification.type);
    const route = descriptor.getRoute?.(notification);
    if (route) {
      navigate(route);
    }
    setIsOpen(false);
  };

  const handleMarkAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllAsRead();
  };

  const renderNotificationItem = (notification: Notification) => {
    const descriptor = describeNotification(notification.type);
    const content = descriptor.getContent(notification, userId);
    const isClickable = Boolean(descriptor.getRoute?.(notification));
    const variantStyles = getVariantStyles(notification.type, notification.isRead);

    return (
      <div
        key={notification.id}
        onClick={() => handleNotificationClick(notification)}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        className="notification-item"
        style={{
          padding: '14px 16px',
          borderRadius: '12px',
          background: variantStyles.bg,
          border: variantStyles.border,
          cursor: isClickable ? 'pointer' : 'default',
          display: 'flex',
          gap: '14px',
          alignItems: 'flex-start',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          '--hover-bg': variantStyles.hoverBg,
        } as React.CSSProperties}
      >
        {!notification.isRead && (
          <div style={{
            position: 'absolute',
            top: '-15px',
            left: '-15px',
            width: '60px',
            height: '60px',
            background: variantStyles.glow,
            filter: 'blur(18px)',
            borderRadius: '50%',
            opacity: 0.6,
            pointerEvents: 'none'
          }} />
        )}

        <div
          style={{
            flex: '0 0 auto',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: variantStyles.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: variantStyles.iconColor,
            position: 'relative',
            zIndex: 1,
            boxShadow: notification.isRead ? 'none' : '0 2px 8px color-mix(in srgb, var(--color-surface) 50%, transparent)',
          }}
        >
          <Icon name={descriptor.icon} size={20} />
          {!notification.isRead && (
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: 'var(--color-danger)',
                border: '2px solid var(--color-surface)',
              }}
            />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: notification.isRead ? 500 : 600,
                color: notification.isRead ? 'var(--color-text-secondary)' : 'var(--color-text)',
              }}
            >
              {content.title}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary, #94a3b8)', flexShrink: 0, fontWeight: 500 }}>
              {formatRelativeTime(new Date(notification.createdAt))}
            </span>
          </div>

          {content.description && (
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
              {content.description}
            </span>
          )}

          {content.primary && (
            <span
              style={{
                fontSize: '12px',
                fontWeight: notification.isRead ? 500 : 600,
                color: notification.isRead ? 'var(--color-text-secondary)' : 'var(--color-text)',
                wordBreak: 'break-word',
                marginTop: '2px'
              }}
            >
              {content.primary}
            </span>
          )}

          {content.secondary && (
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
              {content.secondary}
            </span>
          )}

          {content.status && (
            <div style={{ marginTop: '2px' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  letterSpacing: '0.02em',
                  ...STATUS_TONE_STYLES[content.status.tone],
                }}
              >
                {content.status.label}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderGroup = (label: string, list: Notification[]) => {
    if (list.length === 0) return null;
    return (
      <div key={label} style={{ marginBottom: '16px' }}>
        <div style={{
          padding: '0 16px',
          marginBottom: '6px',
          fontSize: '10px',
          fontWeight: 700,
          color: 'var(--color-text-tertiary, #94a3b8)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          {label}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 12px' }}>
          {list.map(renderNotificationItem)}
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: 'relative' }} ref={popoverRef}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <WcButtonIcon
          variant="ghost"
          shape="circle"
          icon="icon-bell"
          onClick={() => {
            const next = !isOpen;
            setIsOpen(next);
            onOpenChange?.(next);
            if (next) announceFloatingPopover("notifications");
          }}
          style={{ background: isOpen ? 'color-mix(in srgb, var(--color-text) 4%, transparent)' : 'transparent' }}
          aria-label="Notificaciones"
        />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              minWidth: '18px',
              height: '18px',
              borderRadius: '9px',
              background: 'var(--color-danger, #EF4444)',
              color: 'white',
              fontSize: '10px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              border: '2px solid var(--color-surface)',
              lineHeight: 1,
              pointerEvents: 'none'
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>

      {isOpen && (
        <div className="notification-popover">
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'color-mix(in srgb, var(--color-surface) 60%, transparent)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderTopLeftRadius: 'inherit',
            borderTopRightRadius: 'inherit',
            zIndex: 2,
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--color-text)' }}>Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                disabled={isMarkingAll}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'color-mix(in srgb, var(--color-primary) 8%, transparent)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                Marcar como leídas
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', flex: 1, padding: '16px 0', position: 'relative', zIndex: 1 }}>
            {isLoading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                Cargando...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                  <Icon name="icon-bell" size={28} />
                </div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text)' }}>No tienes notificaciones pendientes</div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-tertiary, #94a3b8)', maxWidth: '240px' }}>
                  Cuando recibas alertas o actualizaciones, aparecerán aquí.
                </p>
              </div>
            ) : (
              (() => {
                const grouped = groupNotifications(notifications);
                return (
                  <>
                    {renderGroup('Hoy', grouped.today)}
                    {renderGroup('Ayer', grouped.yesterday)}
                    {renderGroup('Semana pasada', grouped.thisWeek)}
                    {renderGroup('Anteriores', grouped.older)}
                  </>
                );
              })()
            )}
          </div>
        </div>
      )}
    </div>
  );
}
