import { useEffect } from 'react';
import type { Notification } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Subscribes to the backend's live notification feed (GET /api/v1/notifications/stream)
// via Server-Sent Events and forwards each newly created notification to the caller.
export const useNotificationStream = (onNotification: (notification: Notification) => void) => {
  useEffect(() => {
    const source = new EventSource(`${API_BASE}/api/v1/notifications/stream`);

    source.addEventListener('notification', (event: MessageEvent) => {
      try {
        const notification: Notification = JSON.parse(event.data);
        onNotification(notification);
      } catch (err) {
        console.error('Gagal memproses notifikasi SSE:', err);
      }
    });

    source.onerror = () => {
      // EventSource retries automatically; nothing to do beyond logging for visibility.
      console.warn('Koneksi SSE notifikasi terputus, mencoba menyambung ulang...');
    };

    return () => source.close();
  }, [onNotification]);
};
