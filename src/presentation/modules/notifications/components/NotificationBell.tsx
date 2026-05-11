import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationsList, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/presentation/modules/notifications/hooks/useNotifications';
import { describeNotification } from '@/presentation/modules/notifications/registry/notificationRegistry';
import WcButtonIcon from '@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon';
import { Icon } from '@/presentation/modules/shared/components/Sidebar/icons/Icon';
import type { Notification } from '@/domain/modules/notifications/models/Notification';

interface NotificationBellProps {
  userId: string | undefined;
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
                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--color-border)',
                      background: notification.isRead ? 'transparent' : 'var(--color-primary-light)',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease',
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
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--color-surface-hover)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-primary)',
                      }}
                    >
                      <Icon name={descriptor.icon} size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: '0 0 4px 0',
                        fontSize: '14px',
                        color: 'var(--color-text)',
                        fontWeight: notification.isRead ? 'normal' : '500'
                      }}>
                        {descriptor.getMessage(notification, userId)}
                      </p>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        {new Date(notification.createdAt).toLocaleDateString()} a las {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
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
            width: 320px;
            max-height: 400px;
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
              max-height: 70vh;
              border-radius: var(--radius-lg) var(--radius-lg) 0 0;
            }
          }
        `}
      </style>
    </div>
  );
}
