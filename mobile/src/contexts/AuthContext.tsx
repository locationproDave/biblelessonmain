// Authentication Context with Biometric Support
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { api } from '../lib/api';
import { secureStorage, storage } from '../lib/storage';
import type { User, Session } from '../lib/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  biometricAvailable: boolean;
  biometricEnabled: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithBiometric: () => Promise<boolean>;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
    checkExistingSession();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(compatible && enrolled);
      
      if (compatible && enrolled) {
        const enabled = await secureStorage.getBiometricEnabled();
        setBiometricEnabled(enabled);
      }
    } catch (error) {
      console.error('Biometric check error:', error);
      setBiometricAvailable(false);
    }
  };

  const checkExistingSession = async () => {
    try {
      const session = await api.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('[AuthContext] Starting login process...');
      const session = await api.auth.login(email, password);
      console.log('[AuthContext] Login successful, setting user:', session.user?.name);
      setUser(session.user);
    } catch (error: any) {
      console.error('[AuthContext] Login failed:', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const session = await api.auth.register(email, password, name);
      setUser(session.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.auth.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithBiometric = async (): Promise<boolean> => {
    if (!biometricAvailable || !biometricEnabled) {
      return false;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Sign in to Bible Lesson Planner',
        fallbackLabel: 'Use password',
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Restore session from storage
        const session = await api.auth.getSession();
        if (session) {
          setUser(session.user);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Biometric login error:', error);
      return false;
    }
  };

  const enableBiometric = async () => {
    if (!biometricAvailable) return;

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Enable biometric sign-in',
        fallbackLabel: 'Cancel',
      });

      if (result.success) {
        await secureStorage.setBiometricEnabled(true);
        setBiometricEnabled(true);
      }
    } catch (error) {
      console.error('Enable biometric error:', error);
    }
  };

  const disableBiometric = async () => {
    await secureStorage.setBiometricEnabled(false);
    setBiometricEnabled(false);
  };

  const refreshSession = async () => {
    try {
      const session = await api.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    } catch (error) {
      console.error('Refresh session error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        biometricAvailable,
        biometricEnabled,
        login,
        register,
        logout,
        loginWithBiometric,
        enableBiometric,
        disableBiometric,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
