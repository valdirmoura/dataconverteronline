import './App.css'
import { Glossary } from './Glossary'
import { SuggestionForm } from './SuggestionForm'
import { UnifiedConverter } from './UnifiedConverter'

function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Vira — início">
        <span className="brand-mark" aria-hidden="true">V/</span>
        <span>Vira</span>
      </a>
      <nav className="header-nav" aria-label="Navegação principal">
        <a href="/glossario">Glossário</a>
        <span className="privacy-note"><span aria-hidden="true">●</span> Seus arquivos não saem do navegador</span>
      </nav>
    </header>
  )
}

function Footer() {
  return (
    <footer>
      <span>Vira · Versão beta</span>
      <span><a href="/glossario">Glossário de formatos</a> · Conversão local</span>
    </footer>
  )
}

function App() {
  const isGlossaryPage = window.location.pathname.replace(/\/+$/, '') === '/glossario'

  return (
    <div className="app-shell">
      <Header />
      {isGlossaryPage ? (
        <main id="top" className="glossary-page"><Glossary /></main>
      ) : (
        <main id="top">
          <section className="hero-copy" aria-labelledby="page-title">
            <p className="eyebrow">UTILIDADE DIGITAL · ACESSO ABERTO</p>
            <h1 id="page-title">Seus dados, no formato que você precisa.</h1>
            <p className="lede">Transforme um arquivo que você já possui em um formato realmente útil — sem assinatura extra e sem precisar programar.</p>
          </section>

          <UnifiedConverter />

          <section className="manifesto" aria-labelledby="manifesto-title">
            <p className="eyebrow">POR QUE EXISTE</p>
            <div>
              <h2 id="manifesto-title">A tecnologia deve devolver autonomia, não criar mais uma barreira.</h2>
              <p>Este projeto nasceu quando um arquivo legítimo só podia ser exportado em JSON no plano gratuito de uma plataforma. A IA tornou viável criar uma ferramenta simples para transformar esses dados — e compartilhar esse acesso com outras pessoas.</p>
            </div>
          </section>

          <SuggestionForm />
        </main>
      )}
      <Footer />
    </div>
  )
}

export default App