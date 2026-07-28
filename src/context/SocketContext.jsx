// frontend/src/context/SocketContext.jsx
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { accessToken, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!accessToken || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Get the base URL without any path
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    // Remove any trailing /api/v1 or paths
    const baseUrl = API_URL.replace(/\/api\/v1.*$/, '').replace(/\/$/, '');
    
    console.log('🔌 Connecting to Socket.IO at:', baseUrl);

    const socketInstance = io(baseUrl, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('🔌 Socket.IO connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Socket.IO disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      setIsConnected(false);
    });

    // Listen for new notifications
    socketInstance.on('new-notification', (notification) => {
      console.log('📨 New notification received:', notification);
      setUnreadCount(prev => prev + 1);
      
      // Dispatch event for components
      window.dispatchEvent(new CustomEvent('new-notification', { 
        detail: notification 
      }));
    });

    // Listen for unread count updates
    socketInstance.on('unread-count', (data) => {
      console.log('📊 Unread count updated:', data.count);
      setUnreadCount(data.count);
    });

    // Get initial unread count
    socketInstance.emit('get-unread-count');

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [accessToken, user]);

  const emit = (event, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    }
  };

  const markAsRead = (notificationId) => {
    emit('mark-read', notificationId);
  };

  const markAllAsRead = () => {
    emit('mark-all-read');
  };

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      unreadCount,
      setUnreadCount,
      emit,
      markAsRead,
      markAllAsRead
    }}>
      {children}
    </SocketContext.Provider>
  );
};