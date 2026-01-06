import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { useModal } from '../components/ModalProvider';

interface Message {
  id: string;
  sender: string;
  senderRole: string;
  subject: string;
  message: string;
  read: boolean;
  timestamp: string;
  attachments?: number;
}

const Messages: React.FC = () => {
  const { toast } = useModal();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'John Doe',
      senderRole: 'Parent',
      subject: 'Inquiry about student progress',
      message: 'I would like to know about my child\'s academic progress this term.',
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      attachments: 0
    },
    {
      id: '2',
      sender: 'Jane Smith',
      senderRole: 'Teacher',
      subject: 'Meeting request',
      message: 'Can we schedule a meeting to discuss the upcoming parent-teacher conference?',
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      attachments: 1
    },
    {
      id: '3',
      sender: 'Admin Office',
      senderRole: 'Administrator',
      subject: 'School event reminder',
      message: 'Reminder: Annual sports day is scheduled for next Friday.',
      read: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      attachments: 0
    },
    {
      id: '4',
      sender: 'Mary Johnson',
      senderRole: 'Parent',
      subject: 'Fee payment confirmation',
      message: 'I have made the payment for this term\'s fees. Please confirm receipt.',
      read: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      attachments: 0
    }
  ]);

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [composeOpen, setComposeOpen] = useState<boolean>(false);
  const [composeData, setComposeData] = useState({
    recipient: '',
    subject: '',
    message: ''
  });

  const filteredMessages = messages.filter(m => 
    filter === 'all' ? true : !m.read
  );

  const unreadCount = messages.filter(m => !m.read).length;

  const markAsRead = (id: string): void => {
    setMessages(prev => prev.map(m => 
      m.id === id ? { ...m, read: true } : m
    ));
    if (selectedMessage?.id === id) {
      setSelectedMessage(prev => prev ? { ...prev, read: true } : null);
    }
  };

  const markAllAsRead = (): void => {
    setMessages(prev => prev.map(m => ({ ...m, read: true })));
    toast.showSuccess('All messages marked as read');
  };

  const deleteMessage = (id: string): void => {
    setMessages(prev => prev.filter(m => m.id !== id));
    if (selectedMessage?.id === id) {
      setSelectedMessage(null);
    }
    toast.showSuccess('Message deleted');
  };

  const handleCompose = (): void => {
    setComposeOpen(true);
  };

  const handleSendMessage = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!composeData.recipient || !composeData.subject || !composeData.message) {
      toast.showError('Please fill in all fields');
      return;
    }
    toast.showSuccess('Message sent successfully');
    setComposeOpen(false);
    setComposeData({ recipient: '', subject: '', message: '' });
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    if (selectedMessage && !selectedMessage.read) {
      markAsRead(selectedMessage.id);
    }
  }, [selectedMessage]);

  // Prevent body scroll when compose modal is open
  useEffect(() => {
    if (composeOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [composeOpen]);

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Messages</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Messages</span>
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
            <button
              onClick={handleCompose}
              className="px-4 py-2 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-colors"
            >
              <i className="fas fa-plus mr-2"></i>Compose
            </button>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Messages List */}
        <div className={`lg:col-span-${selectedMessage ? '1' : '3'} bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden`}>
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Inbox</h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">No messages found</p>
              </div>
            ) : (
              filteredMessages.map(message => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`px-4 sm:px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !message.read ? 'bg-blue-50/50' : ''
                  } ${selectedMessage?.id === message.id ? 'bg-primary-50 border-l-4 border-primary-500' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-semibold truncate ${
                          !message.read ? 'text-gray-900 font-bold' : 'text-gray-700'
                        }`}>
                          {message.sender}
                        </span>
                        <span className="text-xs text-gray-500">({message.senderRole})</span>
                      </div>
                      <p className={`text-sm truncate mb-1 ${
                        !message.read ? 'text-gray-900 font-medium' : 'text-gray-600'
                      }`}>
                        {message.subject}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{message.message}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
                        {message.attachments && message.attachments > 0 && (
                          <span className="text-xs text-gray-400">
                            <i className="fas fa-paperclip mr-1"></i>
                            {message.attachments}
                          </span>
                        )}
                      </div>
                    </div>
                    {!message.read && (
                      <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Detail */}
        {selectedMessage && (
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedMessage.subject}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  From: {selectedMessage.sender} ({selectedMessage.senderRole})
                </p>
              </div>
              <button
                onClick={() => deleteMessage(selectedMessage.id)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
            <div className="px-4 sm:px-6 py-4">
              <div className="text-xs text-gray-500 mb-4">
                <i className="far fa-clock mr-1"></i>
                {new Date(selectedMessage.timestamp).toLocaleString()}
              </div>
              <div className="prose max-w-none">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
              {selectedMessage.attachments && selectedMessage.attachments > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <i className="fas fa-paperclip"></i>
                    <span>{selectedMessage.attachments} file(s)</span>
                  </div>
                </div>
              )}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => {
                    setComposeOpen(true);
                    setComposeData({
                      recipient: selectedMessage.sender,
                      subject: `Re: ${selectedMessage.subject}`,
                      message: `\n\n--- Original Message ---\nFrom: ${selectedMessage.sender} (${selectedMessage.senderRole})\nDate: ${new Date(selectedMessage.timestamp).toLocaleString()}\n\n${selectedMessage.message}`
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-600 transition-colors shadow-sm hover:shadow-md"
                >
                  <i className="fas fa-reply mr-2"></i>Reply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {composeOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setComposeOpen(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Compose Message</h3>
              <button
                onClick={() => setComposeOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSendMessage} className="p-6 space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">To</label>
                <input
                  type="text"
                  value={composeData.recipient}
                  onChange={(e) => setComposeData({ ...composeData, recipient: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                  placeholder="Enter recipient name or email"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Subject</label>
                <input
                  type="text"
                  value={composeData.subject}
                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                  placeholder="Enter subject"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Message</label>
                <textarea
                  value={composeData.message}
                  onChange={(e) => setComposeData({ ...composeData, message: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[200px] resize-none"
                  placeholder="Enter your message"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setComposeOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-colors"
                >
                  <i className="fas fa-paper-plane mr-2"></i>Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Messages;

