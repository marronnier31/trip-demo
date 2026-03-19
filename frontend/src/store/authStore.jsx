import { useEffect, useState } from 'react';
import { AuthContext } from './authContext';

const AUTH_STORAGE_KEY = 'tripzone-auth-user';

function readStoredUser() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);
  const updateCurrentUser = (data) => setUser(prev => prev ? { ...prev, ...data } : null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      if (user) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // Ignore storage failures and keep in-memory auth as fallback.
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}
