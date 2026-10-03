"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import AdminRoute from "@/components/AdminRoute";
import Loading from "@/components/Loading";
import Alert from "@/components/Alert";
import Ranking from "@/components/Ranking";
import VendaForm from "@/components/VendaForm";
import { supabase } from "@/lib/supabase";
import { MATERIAIS, formatarData, formatarPeso, paraGramas } from "@/lib/format";

function montarRanking(vendas, material) {
  const mapa = {};
  vendas.filter((v) => v.material === material).forEach((v) => {
    const id = v.user_id;
    if (!mapa[id]) mapa[id] = { user_id: id, nome: v.profiles?.nome || v.profiles?.email || "—", total_gramas: 0 };
    mapa[id].total_gramas += Number(v.quantidade_gramas);
  });
  return Object.values(mapa).sort((a, b) => b.total_gramas - a.total_gramas);
}

function Painel() {
  const [vendas, setVendas] = useState([]);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [msg, setMsg] = useState("");
  const [busca, setBusca] = useState("");
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroMaterial, setFiltroMaterial] = useState("todos");
  const [ordem, setOrdem] = useState("desc");
  const [editando, setEditando] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    const [vRes, pRes] = await Promise.all([
      supabase.from("vendas").select("id, user_id, material, quantidade_original, unidade, quantidade_gramas, created_at, profiles(nome, email)"),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);
    if (vRes.error || pRes.error) setErro("Erro ao carregar dados administrativos.");
    setVendas(vRes.data || []);
    setTotalUsuarios(pRes.count || 0);
    setCarregando(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const totais = useMemo(() => ({
    ouro: vendas.filter((v) => v.material === "ouro").reduce((s, v) => s + Number(v.quantidade_gramas), 0),
    prata: vendas.filter((v) => v.material === "prata").reduce((s, v) => s + Number(v.quantidade_gramas), 0),
  }), [vendas]);

  const rankingOuro = useMemo(() => montarRanking(vendas, "ouro"), [vendas]);
  const rankingPrata = useMemo(() => montarRanking(vendas, "prata"), [vendas]);
  const nomes = useMemo(() => [...new Set(vendas.map((v) => v.profiles?.nome).filter(Boolean))].sort(), [vendas]);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return vendas
      .filter((v) => filtroMaterial === "todos" || v.material === filtroMaterial)
      .filter((v) => !filtroNome || v.profiles?.nome === filtroNome)
      .filter((v) => !termo || `${v.profiles?.nome} ${v.profiles?.email} ${v.material}`.toLowerCase().includes(termo))
      .sort((a, b) => (ordem === "desc" ? -1 : 1) * (new Date(a.created_at) - new Date(b.created_at)));
  }, [vendas, busca, filtroNome, filtroMaterial, ordem]);

  const excluir = async (venda) => {
    if (!confirm(`Excluir a venda de ${venda.profiles?.nome}?`)) return;
    const { error } = await supabase.from("vendas").delete().eq("id", venda.id);
    if (error) return setErro("Não foi possível excluir o registro.");
    setMsg("Registro excluído.");
    carregar();
  };

  const salvarEdicao = async ({ material, quantidade, unidade }) => {
    const { error } = await supabase.from("vendas").update({
      material, quantidade_original: quantidade, unidade, quantidade_gramas: paraGramas(quantidade, unidade),
    }).eq("id", editando.id);
    if (error) throw new Error("Não foi possível salvar a edição.");
    setEditando(null);
    setMsg("Registro atualizado.");
    carregar();
  };

  if (carregando && vendas.length === 0) return <Loading texto="Carregando painel..." />;

  return (
    <section className="section">
      <div className="container">
        <p className="eyebrow">Administração</p>
        <h1>Painel administrativo</h1>
        <Alert>{erro}</Alert>
        <Alert tipo="sucesso">{msg}</Alert>

        <div className="grid-4 stats">
          <div className="card stat"><span className="muted">Total de Ouro</span><strong>{formatarPeso(totais.ouro)}</strong></div>
          <div className="card stat"><span className="muted">Total de Prata</span><strong>{formatarPeso(totais.prata)}</strong></div>
          <div className="card stat"><span className="muted">Negociações</span><strong>{vendas.length}</strong></div>
          <div className="card stat"><span className="muted">Usuários</span><strong>{totalUsuarios}</strong></div>
        </div>

        <div className="grid-2">
          <Ranking titulo="Ranking Ouro" itens={rankingOuro} material="ouro" />
          <Ranking titulo="Ranking Prata" itens={rankingPrata} material="prata" />
        </div>

        <h2 className="mt">Todas as negociações</h2>
        <div className="filters">
          <input placeholder="Buscar por nome, e-mail..." value={busca} onChange={(e) => setBusca(e.target.value)} />
          <select value={filtroNome} onChange={(e) => setFiltroNome(e.target.value)}>
            <option value="">Todos os nomes</option>
            {nomes.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <select value={filtroMaterial} onChange={(e) => setFiltroMaterial(e.target.value)}>
            <option value="todos">Todos os materiais</option>
            <option value="ouro">Ouro</option>
            <option value="prata">Prata</option>
          </select>
          <select value={ordem} onChange={(e) => setOrdem(e.target.value)}>
            <option value="desc">Mais recentes</option>
            <option value="asc">Mais antigas</option>
          </select>
        </div>

        <div className="table-wrap card">
          <table>
            <thead><tr><th>Nome</th><th>E-mail</th><th>Material</th><th>Qtd.</th><th>Unid.</th><th>Data</th><th></th></tr></thead>
            <tbody>
              {filtradas.length === 0 && <tr><td colSpan="7" className="center muted">Nenhum registro encontrado.</td></tr>}
              {filtradas.map((v) => (
                <tr key={v.id}>
                  <td>{v.profiles?.nome || "—"}</td>
                  <td className="muted">{v.profiles?.email}</td>
                  <td><span className={`tag tag-${v.material}`}>{MATERIAIS[v.material]}</span></td>
                  <td>{Number(v.quantidade_original).toLocaleString("pt-BR")}</td>
                  <td>{v.unidade}</td>
                  <td>{formatarData(v.created_at)}</td>
                  <td className="nowrap">
                    <button className="btn btn-outline btn-sm" onClick={() => { setMsg(""); setEditando(v); }}>Editar</button>{" "}
                    <button className="btn btn-danger btn-sm" onClick={() => excluir(v)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editando && (
        <div className="modal" onClick={() => setEditando(null)}>
          <div className="card modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Editar venda — {editando.profiles?.nome}</h3>
            <VendaForm inicial={editando} onSubmit={salvarEdicao} textoBotao="Salvar alterações" onCancel={() => setEditando(null)} />
          </div>
        </div>
      )}
    </section>
  );
}

export default function Page() {
  return <AdminRoute><Painel /></AdminRoute>;
}
