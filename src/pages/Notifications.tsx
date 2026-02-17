import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { useModal } from '../components/ModalProvider';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
  link?: string;
}

const Notifications: React.FC = () => {
  const { toast } = useModal();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Student Registration',
      message: 'A new student has been registered in Basic 1',
      type: 'info',
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      link: '/students/all'
    },
    {
      id: '2',
      title: 'Payment Received',
      message: 'Payment of GHS 500.00 received from John Doe',
      type: 'success',
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      link: '/fee-collection/record-single'
    },
    {
      id: '3',
      title: 'Bill Reminder Sent',
      message: 'Bill reminders sent to 25 parents',
      type: 'info',
      read: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      link: '/reminders/bill-reminder'
    },
    {
      id: '4',
      title: 'Staff Meeting Scheduled',
      message: 'Staff meeting scheduled for tomorrow at 2:00 PM',
      type: 'warning',
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    },
    {
      id: '5',
      title: 'System Backup Completed',
      message: 'Daily system backup completed successfully',
      type: 'success',
      read: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' ? true : !n.read
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string): void => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = (): void => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.showSuccess('All notifications marked as read');
  };

  const deleteNotification = (id: string): void => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.showSuccess('Notification deleted');
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'success': return 'fa-check-circle text-green-500';
      case 'warning': return 'fa-exclamation-triangle text-yellow-500';
      case 'error': return 'fa-times-circle text-red-500';
      default: return 'fa-info-circle text-blue-500';
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Notifications</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Notifications</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  filter === 'all' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors relative ${
                  filter === 'unread' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Unread
                {unreadCount > 0 && (
                  <span className="ml-1.5 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <i className="fas fa-bell-slash text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">No notifications found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    notification.type === 'success' ? 'bg-green-100' :
                    notification.type === 'warning' ? 'bg-yellow-100' :
                    notification.type === 'error' ? 'bg-red-100' :
                    'bg-blue-100'
                  }`}>
                    <i className={`fas ${getTypeIcon(notification.type)}`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className={`text-sm font-semibold text-gray-900 mb-1 ${
                          !notification.read ? 'font-bold' : ''
                        }`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">
                            <i className="far fa-clock mr-1"></i>
                            {formatTime(notification.timestamp)}
                          </span>
                          {notification.link && (
                            <Link
                              to={notification.link}
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-primary-600 hover:text-primary-700 hover:underline"
                            >
                              View details
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors"
                            title="Mark as read"
                          >
                            <i className="fas fa-circle text-[8px]"></i>
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <i className="fas fa-trash text-sm"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;

