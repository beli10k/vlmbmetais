"use client";
import { useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import VendaForm from "@/components/VendaForm";
import Alert from "@/components/Alert";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { paraGramas, formatarPeso, MATERIAIS } from "@/lib/format";

function RegistrarVenda() {
  const { user, profile } = useAuth();
  const [sucesso, setSucesso] = useState("");

  const salvar = async ({ material, quantidade, unidade }) => {
    setSucesso("");
    const gramas = paraGramas(quantidade, unidade);
    const { error } = await supabase.from("vendas").insert({
      user_id: user.id,
      material,
      quantidade_original: quantidade,
      unidade,
      quantidade_gramas: gramas,
    });
    if (error) throw new Error("Erro ao registrar a venda. Tente novamente.");
    setSucesso(`Venda registrada: ${formatarPeso(gramas)} de ${MATERIAIS[material]}.`);
  };

  return (
    <section className="section auth">
      <div className="card fade-up wide-form">
        <h1>Registrar venda</h1>
        <p className="muted">Olá, {profile?.nome || "cliente"}. Informe os dados da negociação.</p>
        <Alert tipo="sucesso">{sucesso}</Alert>
        <VendaForm onSubmit={salvar} />
        <p className="small center"><Link href="/historico" className="link">Ver meu histórico →</Link></p>
      </div>
    </section>
  );
}

export default function Page() {
  return <ProtectedRoute><RegistrarVenda /></ProtectedRoute>;
}
