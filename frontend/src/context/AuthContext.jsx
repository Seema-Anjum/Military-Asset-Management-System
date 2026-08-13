import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('mams_token');
    const storedUser = localStorage.getItem('mams_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const loginUser = (tokenData, userData) => {
    localStorage.setItem('mams_token', tokenData);
    localStorage.setItem('mams_user', JSON.stringify(userData));
    setToken(tokenData);
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem('mams_token');
    localStorage.removeItem('mams_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginUser, logoutUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);