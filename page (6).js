"use client";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { WHATSAPP_URL } from "@/lib/format";

const passos = [
  ["Entre em contato", "Fale com nossa equipe pelo WhatsApp e tire suas dúvidas."],
  ["Realize sua avaliação", "Avaliação responsável, com clareza em cada etapa."],
  ["Registre sua negociação", "Registre a venda na sua conta em poucos cliques."],
  ["Acompanhe seu histórico", "Consulte todas as suas negociações quando quiser."],
];

export default function Home() {
  const { user } = useAuth();
  return (
    <>
      <section className="hero">
        <div className="container hero-inner fade-up">
          <p className="eyebrow">VLMB Metais · Ouro & Prata</p>
          <h1>Transforme seus metais em <em>valor.</em></h1>
          <p className="lead">Avaliação segura, atendimento transparente e confiança construída ao longo de 4 anos.</p>
          <div className="actions">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-gold">Solicitar avaliação</a>
            <Link href={user ? "/registrar-venda" : "/login"} className="btn btn-outline">
              {user ? "Registrar venda" : "Entrar / Cadastrar"}
            </Link>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="section">
        <div className="container">
          <p className="eyebrow center">Processo</p>
          <h2 className="center">Como funciona</h2>
          <div className="grid-4">
            {passos.map(([titulo, texto], i) => (
              <div key={titulo} className="card step fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="step-num">0{i + 1}</span>
                <h3>{titulo}</h3>
                <p className="muted">{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container card cta">
          <h2>4 anos de confiança</h2>
          <p className="muted">Atendimento próximo e avaliação responsável para negociar seus metais com segurança.</p>
          <Link href="/sobre" className="btn btn-outline">Conheça a VLMB</Link>
        </div>
      </section>
    </>
  );
}
