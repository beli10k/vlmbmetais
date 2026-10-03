export const MATERIAIS = { ouro: "Ouro", prata: "Prata" };

export function paraGramas(quantidade, unidade) {
  const q = Number(quantidade);
  return unidade === "kg" ? q * 1000 : q;
}

export function formatarPeso(gramas) {
  const g = Number(gramas) || 0;
  if (g >= 1000) return `${(g / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 3 })} kg`;
  return `${g.toLocaleString("pt-BR", { maximumFractionDigits: 3 })} g`;
}

export function formatarData(iso) {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export const WHATSAPP_URL =
  "https://wa.me/5511949104529?text=" +
  encodeURIComponent("Olá! Vim pelo site da VLMB Metais e gostaria de realizar uma avaliação.");
