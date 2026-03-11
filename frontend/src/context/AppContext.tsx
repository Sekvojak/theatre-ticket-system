import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '../api/types';

const USER_KEY = 'theatreX-user';

interface AppContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => void;
  cartCount: number;
  setCartCount: (n: number) => void;
  loginModalOpen: boolean;
  registerModalOpen: boolean;
  openLoginModal: () => void;
  openRegisterModal: () => void;
  closeModals: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });

  const [cartCount, setCartCount] = useState(0);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const setUser = (u: User | null) => {
    setUserState(u);
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  };

  const logout = () => setUser(null);

  const openLoginModal = () => {
    setLoginModalOpen(true);
    setRegisterModalOpen(false);
  };
  const openRegisterModal = () => {
    setRegisterModalOpen(true);
    setLoginModalOpen(false);
  };
  const closeModals = () => {
    setLoginModalOpen(false);
    setRegisterModalOpen(false);
  };

  return (
    <AppContext.Provider
      value={{
        user, setUser, logout,
        cartCount, setCartCount,
        loginModalOpen, registerModalOpen,
        openLoginModal, openRegisterModal, closeModals,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
