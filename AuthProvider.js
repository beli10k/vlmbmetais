"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (user) => {
    if (!user) return setProfile(null);
    const { data } = await supabase.from("profiles").select("id, nome, email, role").eq("id", user.id).single();
    setProfile(data || null);
  }, []);

  useEffect(() => {
    // Recuperação de sessão ao abrir o site
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await loadProfile(data.session?.user);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setTimeout(() => loadProfile(newSession?.user), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, profile, isAdmin: profile?.role === "admin", loading, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
