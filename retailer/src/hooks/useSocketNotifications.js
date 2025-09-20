// hooks/useSocketNotifications.js
import { useEffect, useMemo } from 'react'; // ✅ Use useMemo, not useState
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const SOCKET_SERVER = "http://localhost:5000";

export const useSocketNotifications = (onNewNotification) => {
  // ✅ Memoize user shape — CRITICAL FIX
  const user = useSelector(state => {
    const u = state.auth.user;
    if (!u) return null;
    return {
      role: u.role,
      id: u.distributor_id || u.retailer_id, // ✅ Single id field
    };
  }, (prev, next) => {
    // ✅ Deep equality — only recompute if values change
    return prev?.role === next?.role && prev?.id === next?.id;
  });

  useEffect(() => {
    if (!user || !user.role || !user.id) {
      return; // Do nothing if user not ready
    }

    const socket = io(SOCKET_SERVER, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const onConnect = () => {
      console.log(`✅ Connected to notification socket as ${user.role}_${user.id}`);
      socket.emit('joinNotifications', {
        user_id: user.id,
        role: user.role, // ✅ Backend expects role
      });
    };

    const onNotification = (notification) => {
      console.log('🔔 New notification:', notification);
      if (typeof onNewNotification === 'function') {
        onNewNotification(notification);
      }
    };

    socket.on('connect', onConnect);
    socket.on('newNotification', onNotification);

    // ✅ Cleanup on unmount or dependency change
    return () => {
      console.log(`🔌 Disconnecting socket for ${user.role}_${user.id}`);
      socket.off('connect', onConnect);
      socket.off('newNotification', onNotification);
      socket.disconnect();
    };
  }, [user, onNewNotification]); // ✅ Now safe — user is memoized, onNewNotification should be useCallback’d
};