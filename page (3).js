"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loading from "@/components/Loading";
import Alert from "@/components/Alert";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { MATERIAIS, formatarData } from "@/lib/format";

function Historico() {
  const { user } = useAuth();
  const [vendas, setVendas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [recentes, setRecentes] = useState(true);

  useEffect(() => {
    (async () => {
      setCarregando(true);
      const { data, error } = await supabase
        .from("vendas")
        .select("id, material, quantidade_original, unidade, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: !recentes });
      if (error) setErro("Não foi possível carregar seu histórico.");
      setVendas(data || []);
      setCarregando(false);
    })();
  }, [user.id, recentes]);

  return (
    <section className="section">
      <div className="container">
        <div className="head-row">
          <div>
            <p className="eyebrow">Minha conta</p>
            <h1>Meu histórico</h1>
          </div>
          <select value={recentes ? "desc" : "asc"} onChange={(e) => setRecentes(e.target.value === "desc")}>
            <option value="desc">Mais recentes</option>
            <option value="asc">Mais antigas</option>
          </select>
        </div>
        <Alert>{erro}</Alert>
        {carregando ? <Loading /> : vendas.length === 0 ? (
          <div className="card center muted">Você ainda não registrou nenhuma venda.</div>
        ) : (
          <div className="table-wrap card">
            <table>
              <thead><tr><th>Material</th><th>Quantidade</th><th>Unidade</th><th>Data</th></tr></thead>
              <tbody>
                {vendas.map((v) => (
                  <tr key={v.id}>
                    <td><span className={`tag tag-${v.material}`}>{MATERIAIS[v.material]}</span></td>
                    <td>{Number(v.quantidade_original).toLocaleString("pt-BR")}</td>
                    <td>{v.unidade}</td>
                    <td>{formatarData(v.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default function Page() {
  return <ProtectedRoute><Historico /></ProtectedRoute>;
}
