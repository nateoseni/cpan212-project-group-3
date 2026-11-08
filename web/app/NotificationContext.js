'use client';

import { createContext, useContext, useState, useCallback } from 'react';

//the context will hold the notification state and functions to update it
const NotificationContext = createContext(null);

//the provider holds the state and shares it with everything inside it
export function NotificationProvider({ children }) {
    const [message, setMessage] = useState('');

    const notify = useCallback((text) => setMessage(text), []);
    const clear = useCallback(() => setMessage(''), []);

    return (
        <NotificationContext.Provider value={{ message, notify, clear }}>
            {children}
        </NotificationContext.Provider>
    );
}

//small helper so components can write useNotification() instead of useContext(NotificationContext)
export function useNotification() {
    const ctx = useContext(NotificationContext);
    if (!ctx) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return ctx;
}