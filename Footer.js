export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p className="brand">VLMB <span>Metais</span></p>
        <p className="muted">Confiança, transparência e compromisso em cada negociação.</p>
        <p className="muted small">© {new Date().getFullYear()} VLMB Metais. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
