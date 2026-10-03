import Link from "next/link";
export default function NotFound() {
  return (
    <section className="section center">
      <h1>Página não encontrada</h1>
      <p className="muted">O endereço acessado não existe.</p>
      <Link href="/" className="btn btn-gold">Voltar ao início</Link>
    </section>
  );
}
