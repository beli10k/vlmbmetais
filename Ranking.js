import { formatarPeso } from "@/lib/format";

export default function Ranking({ titulo, itens, material }) {
  return (
    <div className="card">
      <h3 className={`rank-title rank-${material}`}>{titulo}</h3>
      {itens.length === 0 ? <p className="muted">Sem registros.</p> : (
        <ol className="ranking">
          {itens.map((item, i) => (
            <li key={item.user_id}>
              <span className="pos">{i + 1}º</span>
              <span className="grow">{item.nome}</span>
              <strong>{formatarPeso(item.total_gramas)}</strong>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
