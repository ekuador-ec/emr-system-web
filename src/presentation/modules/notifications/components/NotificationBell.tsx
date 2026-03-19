import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationsList, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/presentation/modules/notifications/hooks/useNotifications';
import { Icon } from '@/presentation/modules/shared/components/Sidebar/icons/Icon';
import type { Notification } from '@/domain/modules/notifications/models/Notification';

interface NotificationBellProps {
  userId: string | undefined;
}

function getNotificationMessage(notification: Notification, currentUserId: string | undefined): string {
  const isSelf = currentUserId && notification.actorId === currentUserId;

  switch (notification.type) {
    case 'NEW_USER':
      return isSelf
        ? 'Has registrado un nuevo usuario exitosamente'
        : `${notification.actorName || 'Un administrador'} ha registrado un nuevo usuario`;
    default:
      return isSelf
        ? 'Has realizado una acci\u00f3n en el sistema'
        : `${notification.actorName || 'Alguien'} ha realizado una acci\u00f3n`;
  }
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: notifications = [], isLoading } = useNotificationsList(userId);
  const { mutate: markAsRead } = useMarkNotificationRead();
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

    if (notification.type === 'NEW_USER') {
      navigate('/users');
    }
    setIsOpen(false);
  };

  const handleMarkAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllAsRead();
  };

  return (
    <div style={{ position: 'relative' }} ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-ghost"
        style={{
          position: 'relative',
          padding: '8px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: 'none',
          background: isOpen ? 'var(--color-surface-hover)' : 'transparent',
        }}
      >
        <span style={{ color: 'var(--color-text-secondary)', display: 'flex' }}>
          <Icon name="icon-bell" size={20} />
        </span>
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
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
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

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
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--color-border)',
                    background: notification.isRead ? 'transparent' : 'var(--color-primary-light)',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (notification.isRead) e.currentTarget.style.background = 'var(--color-surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = notification.isRead ? 'transparent' : 'var(--color-primary-light)';
                  }}
                >
                  <p style={{ 
                    margin: '0 0 4px 0', 
                    fontSize: '14px', 
                    color: 'var(--color-text)',
                    fontWeight: notification.isRead ? 'normal' : '500' 
                  }}>
                    {getNotificationMessage(notification, userId)}
                  </p>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {new Date(notification.createdAt).toLocaleDateString()} a las {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
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
