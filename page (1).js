"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Alert from "@/components/Alert";

export default function Cadastro() {
  const router = useRouter();
  const [form, setForm] = useState({ nome: "", email: "", senha: "", confirmar: "" });
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [enviando, setEnviando] = useState(false);

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const cadastrar = async (e) => {
    e.preventDefault();
    setErro(""); setSucesso("");
    if (form.nome.trim().length < 2) return setErro("Informe seu nome.");
    if (form.senha.length < 6) return setErro("A senha deve ter pelo menos 6 caracteres.");
    if (form.senha !== form.confirmar) return setErro("As senhas não conferem.");
    setEnviando(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.senha,
      options: { data: { nome: form.nome.trim() }, emailRedirectTo: `${window.location.origin}/login` },
    });
    setEnviando(false);
    if (error) return setErro(error.message);
    if (data.session) return router.replace("/registrar-venda");
    setSucesso("Conta criada! Verifique seu e-mail para confirmar o cadastro e depois faça login.");
  };

  return (
    <section className="section auth">
      <form className="card form fade-up" onSubmit={cadastrar}>
        <h1>Criar conta</h1>
        <p className="muted">Cadastre-se para registrar suas negociações.</p>
        <Alert>{erro}</Alert>
        <Alert tipo="sucesso">{sucesso}</Alert>
        <label>Nome<input value={form.nome} onChange={set("nome")} required /></label>
        <label>E-mail<input type="email" value={form.email} onChange={set("email")} autoComplete="email" required /></label>
        <label>Senha<input type="password" value={form.senha} onChange={set("senha")} autoComplete="new-password" required /></label>
        <label>Confirmar senha<input type="password" value={form.confirmar} onChange={set("confirmar")} autoComplete="new-password" required /></label>
        <button className="btn btn-gold full" disabled={enviando}>{enviando ? "Criando..." : "Cadastrar"}</button>
        <p className="muted small center">Já tem conta? <Link href="/login" className="link">Entrar</Link></p>
      </form>
    </section>
  );
}
