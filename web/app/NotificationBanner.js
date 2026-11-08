'use client';

import { useNotification } from './NotificationContext';

export default function NotificationBanner() {
  const { message, clear } = useNotification();

  if (!message) return null;   //nothing to show

  return (
    <div className="notice" role="status">
      {message} <button onClick={clear}>Dismiss</button>
    </div>
  );
}