"use client";
import { useState } from "react";
import Alert from "./Alert";

// Formulário reutilizado em "Registrar venda" e na edição do painel admin
export default function VendaForm({ inicial, onSubmit, textoBotao = "Registrar venda", onCancel }) {
  const [material, setMaterial] = useState(inicial?.material || "ouro");
  const [quantidade, setQuantidade] = useState(inicial?.quantidade_original ?? "");
  const [unidade, setUnidade] = useState(inicial?.unidade || "g");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setErro("");
    const q = Number(String(quantidade).replace(",", "."));
    if (!["ouro", "prata"].includes(material)) return setErro("Selecione o material.");
    if (!["g", "kg"].includes(unidade)) return setErro("Selecione a unidade.");
    if (!q || q <= 0 || !isFinite(q)) return setErro("Informe uma quantidade maior que zero.");
    setEnviando(true);
    try {
      await onSubmit({ material, quantidade: q, unidade });
      if (!inicial) setQuantidade("");
    } catch (err) {
      setErro(err.message || "Não foi possível salvar.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className="form" onSubmit={enviar}>
      <Alert>{erro}</Alert>
      <label>Material
        <select value={material} onChange={(e) => setMaterial(e.target.value)}>
          <option value="ouro">Ouro</option>
          <option value="prata">Prata</option>
        </select>
      </label>
      <div className="row">
        <label className="grow">Quantidade
          <input type="number" step="0.001" min="0" inputMode="decimal" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} required />
        </label>
        <label>Unidade
          <select value={unidade} onChange={(e) => setUnidade(e.target.value)}>
            <option value="g">g</option>
            <option value="kg">kg</option>
          </select>
        </label>
      </div>
      <div className="row">
        <button className="btn btn-gold grow" disabled={enviando}>{enviando ? "Salvando..." : textoBotao}</button>
        {onCancel && <button type="button" className="btn btn-outline" onClick={onCancel}>Cancelar</button>}
      </div>
    </form>
  );
}
