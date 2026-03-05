import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface AuthCtx {
  username: string | null;
  token: string | null;
  login: (token: string, username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ws-token'));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('ws-username'));

  const login = (t: string, u: string) => {
    setToken(t);
    setUsername(u);
    localStorage.setItem('ws-token', t);
    localStorage.setItem('ws-username', u);
  };

  const logout = () => {
    setToken(null);
    setUsername(null);
    localStorage.removeItem('ws-token');
    localStorage.removeItem('ws-username');
  };

  return <AuthContext.Provider value={{ username, token, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
