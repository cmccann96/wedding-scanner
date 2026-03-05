import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface User { id: number; email: string; }
interface AuthCtx {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ws-token'));
  const [user, setUser] = useState<User | null>(() => {
    const u = localStorage.getItem('ws-user');
    return u ? JSON.parse(u) : null;
  });

  const login = (t: string, u: User) => {
    setToken(t);
    setUser(u);
    localStorage.setItem('ws-token', t);
    localStorage.setItem('ws-user', JSON.stringify(u));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ws-token');
    localStorage.removeItem('ws-user');
  };

  return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
