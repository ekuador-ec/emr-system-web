import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationsList, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/presentation/modules/notifications/hooks/useNotifications';
import { describeNotification, type NotificationStatusTone } from '@/presentation/modules/notifications/registry/notificationRegistry';
import WcButtonIcon from '@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon';
import { Icon } from '@/presentation/modules/shared/components/Sidebar/icons/Icon';
import type { Notification } from '@/domain/modules/notifications/models/Notification';

interface NotificationBellProps {
  userId: string | undefined;
}

const STATUS_TONE_STYLES: Record<NotificationStatusTone, { background: string; color: string }> = {
  info:    { background: 'rgba(59, 130, 246, 0.12)',  color: '#1D4ED8' },
  success: { background: 'rgba(16, 185, 129, 0.12)',  color: '#047857' },
  warning: { background: 'rgba(245, 158, 11, 0.15)',  color: '#B45309' },
  neutral: { background: 'rgba(148, 163, 184, 0.15)', color: '#475569' },
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

export function NotificationBell({ userId }: NotificationBellProps) {
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

  return (
    <div style={{ position: 'relative' }} ref={popoverRef}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <WcButtonIcon
          variant="ghost"
          shape="circle"
          icon="icon-bell"
          onClick={() => setIsOpen(!isOpen)}
          style={{ background: isOpen ? 'var(--color-surface-hover)' : 'transparent' }}
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
              background: 'var(--color-error, #EF4444)',
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
            padding: '16px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                disabled={isMarkingAll}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Marcar todas leídas
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {isLoading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                Cargando...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                No tienes notificaciones
              </div>
            ) : (
              notifications.map((notification) => {
                const descriptor = describeNotification(notification.type);
                const content = descriptor.getContent(notification, userId);
                const isClickable = Boolean(descriptor.getRoute?.(notification));
                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    role={isClickable ? 'button' : undefined}
                    tabIndex={isClickable ? 0 : undefined}
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid var(--color-border)',
                      background: notification.isRead ? 'transparent' : 'var(--color-primary-light)',
                      cursor: isClickable ? 'pointer' : 'default',
                      transition: 'background 0.15s ease',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                    }}
                    onMouseEnter={(e) => {
                      if (notification.isRead) e.currentTarget.style.background = 'var(--color-surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = notification.isRead ? 'transparent' : 'var(--color-primary-light)';
                    }}
                  >
                    <div
                      style={{
                        flex: '0 0 auto',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: notification.isRead
                          ? 'var(--color-surface-hover)'
                          : 'rgba(59, 130, 246, 0.18)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-primary)',
                      }}
                    >
                      <Icon name={descriptor.icon} size={18} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: notification.isRead ? 500 : 600,
                            color: 'var(--color-text)',
                          }}
                        >
                          {content.title}
                        </span>
                        {!notification.isRead && (
                          <span
                            aria-label="No leída"
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: 'var(--color-primary)',
                              display: 'inline-block',
                            }}
                          />
                        )}
                      </div>

                      {content.description && (
                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                          {content.description}
                        </span>
                      )}

                      {content.primary && (
                        <span
                          style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: 'var(--color-text)',
                            wordBreak: 'break-word',
                          }}
                        >
                          {content.primary}
                        </span>
                      )}

                      {content.secondary && (
                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                          {content.secondary}
                        </span>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginTop: '2px',
                          flexWrap: 'wrap',
                        }}
                      >
                        {content.status && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '999px',
                              letterSpacing: '0.02em',
                              ...STATUS_TONE_STYLES[content.status.tone],
                            }}
                          >
                            {content.status.label}
                          </span>
                        )}
                        <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary, #94A3B8)' }}>
                          {formatRelativeTime(new Date(notification.createdAt))}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <style>
        {`
          .notification-popover {
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            width: 360px;
            max-height: 480px;
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            z-index: 50;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }

          @media (max-width: 480px) {
            .notification-popover {
              position: fixed;
              top: auto;
              bottom: 0;
              left: 0;
              right: 0;
              width: 100%;
              max-height: 75vh;
              border-radius: var(--radius-lg) var(--radius-lg) 0 0;
            }
          }
        `}
      </style>
    </div>
  );
}
