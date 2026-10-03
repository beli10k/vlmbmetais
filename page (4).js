export const metadata = { title: "Sobre nós — VLMB Metais" };

export default function Sobre() {
  return (
    <section className="section">
      <div className="container narrow fade-up">
        <p className="eyebrow">Sobre nós</p>
        <h1>Confiança construída em cada negociação.</h1>
        <div className="prose">
          <p>
            A VLMB Metais atua há 4 anos no mercado, construindo relações baseadas em confiança, transparência e
            compromisso em cada negociação.
          </p>
          <p>
            Nosso objetivo é oferecer um atendimento próximo e uma avaliação responsável para quem deseja negociar
            seus metais com segurança.
          </p>
          <p>
            Valorizamos a clareza durante todo o processo, o atendimento personalizado e as relações duradouras com
            nossos clientes.
          </p>
        </div>
        <div className="grid-3 values">
          {["Confiança", "Transparência", "Compromisso"].map((v) => (
            <div key={v} className="card center"><h3>{v}</h3></div>
          ))}
        </div>
      </div>
    </section>
  );
}
