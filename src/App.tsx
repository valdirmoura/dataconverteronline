import './App.css'
import { UnifiedConverter } from './UnifiedConverter'
import { Glossary } from './Glossary'

function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Vira — início">
          <span className="brand-mark" aria-hidden="true">V/</span>
          <span>Vira</span>
        </a>
        <span className="privacy-note"><span aria-hidden="true">●</span> Seus dados não saem do navegador</span>
      </header>

      <main id="top">
        <section className="hero-copy" aria-labelledby="page-title">
          <p className="eyebrow">UTILIDADE DIGITAL · ACESSO ABERTO</p>
          <h1 id="page-title">Seus dados, no formato que você precisa.</h1>
          <p className="lede">
            Transforme um arquivo que você já possui em um formato realmente útil —
            sem assinatura extra e sem precisar programar.
          </p>
        </section>

        <UnifiedConverter />

        <Glossary />

        <section className="manifesto" aria-labelledby="manifesto-title">
          <p className="eyebrow">POR QUE EXISTE</p>
          <div>
            <h2 id="manifesto-title">A tecnologia deve devolver autonomia, não criar mais uma barreira.</h2>
            <p>
              Este projeto nasceu quando um arquivo legítimo só podia ser exportado em JSON
              no plano gratuito de uma plataforma. A IA tornou viável criar uma ferramenta
              simples para transformar esses dados — e compartilhar esse acesso com outras pessoas.
            </p>
          </div>
        </section>
      </main>

      <footer>
        <span>Vira · Versão beta</span>
        <span>Conversão local · nenhum upload para servidor</span>
      </footer>
    </div>
  )
}

export default App