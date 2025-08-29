import { createContext, useContext, useMemo } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ user, setUser, children }) {
  // αποσύνδεση χρήστη
  function logout() {
    try {
      localStorage.removeItem("access_token");
    } catch {}
    if (setUser) setUser(null);
  }

  const value = useMemo(() => ({
    user,
    setUser,
    logout,
    hasRole: (r) => user?.roles?.includes(r),
    can: (p) => user?.permissions?.includes(p),
    isLoggedIn: !!user,
  }), [user, setUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context ?? { 
    user: null, 
    setUser: () => {}, 
    logout: () => {}, 
    hasRole: () => false, 
    can: () => false, 
    isLoggedIn: false 
  };
}
