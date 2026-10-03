"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import Alert from "@/components/Alert";

export default function Login() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (user) router.replace("/registrar-venda");
  }, [user, router]);

  const entrar = async (e) => {
    e.preventDefault();
    setErro("");
    if (!email || !senha) return setErro("Preencha e-mail e senha.");
    setEnviando(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    setEnviando(false);
    if (error) return setErro(error.message === "Invalid login credentials" ? "E-mail ou senha inválidos." : error.message);
    router.replace("/registrar-venda");
  };

  return (
    <section className="section auth">
      <form className="card form fade-up" onSubmit={entrar}>
        <h1>Entrar</h1>
        <p className="muted">Acesse sua conta VLMB Metais.</p>
        <Alert>{erro}</Alert>
        <label>E-mail<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></label>
        <label>Senha<input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" required /></label>
        <button className="btn btn-gold full" disabled={enviando}>{enviando ? "Entrando..." : "Entrar"}</button>
        <p className="muted small center">Não tem conta? <Link href="/cadastro" className="link">Cadastre-se</Link></p>
      </form>
    </section>
  );
}
