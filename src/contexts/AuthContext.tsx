import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  nome: string;
  tipo: 'dono' | 'master';
  bloqueado: boolean;
  dispositivos_permitidos: number;
  cor_app: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (email: string) => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();
    
    if (!error && data) {
      setUserProfile(data);
      return data;
    }
    return null;
  };

  const signIn = async (email: string, password: string) => {
    const perfil = await fetchProfile(email);
    
    if (!perfil) {
      return { error: new Error('Usuário não encontrado') };
    }

    if (perfil.password !== password) {
      return { error: new Error('Senha incorreta') };
    }

    if (perfil.bloqueado) {
      return { error: new Error('Usuário bloqueado') };
    }

    setUser({ id: perfil.id, email: perfil.email } as User);
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    setUserProfile(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;
    
    const { error } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', userProfile.id);
    
    if (!error) {
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}