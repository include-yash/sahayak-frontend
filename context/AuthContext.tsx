"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface User {
  name: string;
  email: string;
  age?: number;
  religion?: string;
  emergency_contact?: string;
  [key: string]: any; // for any extra fields you might add
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => void;
  continueAsGuest: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = "http://127.0.0.1:8000"; // Change this in production

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      fetchUser(storedToken); // 🔥 Load full user info from /me
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      const userResponse = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(userResponse.data);
    } catch (err) {
      console.error("Failed to fetch user", err);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const { access_token } = response.data;

      setToken(access_token);
      setIsAuthenticated(true);
      localStorage.setItem("token", access_token);
      await fetchUser(access_token); // ✅ Load full user data on login
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Login failed");
    }
  };

  const signup = async (userData: any) => {
    try {
      const response = await axios.post(`${API_URL}/signup`, userData);
      const { access_token } = response.data;

      setToken(access_token);
      setIsAuthenticated(true);
      localStorage.setItem("token", access_token);
      await fetchUser(access_token); // ✅ Load full user data on signup
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Signup failed");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
  };

  const continueAsGuest = () => {
    logout();
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, signup, logout, continueAsGuest, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
