import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';

const AuthContext = createContext(null);

export const useOtpProvider = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  );
};
