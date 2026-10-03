export default function Loading({ texto = "Carregando..." }) {
  return (
    <div className="loading">
      <span className="spinner" />
      <p>{texto}</p>
    </div>
  );
}
