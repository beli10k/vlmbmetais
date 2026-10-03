"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import Loading from "./Loading";

// Proteção visual. A proteção real dos dados é feita pelas políticas RLS no Supabase.
export default function AdminRoute({ children }) {
  const { user, profile, isAdmin, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (profile && !isAdmin) router.replace("/");
  }, [loading, user, profile, isAdmin, router]);
  if (loading || !user || !profile || !isAdmin) return <Loading />;
  return children;
}
