import { useEffect } from 'react'
import './App.css'
import { Glossary } from './Glossary'
import { SuggestionForm } from './SuggestionForm'
import { UnifiedConverter } from './UnifiedConverter'

type NavigationProps = { isGlossaryPage: boolean }

function Header({ isGlossaryPage }: NavigationProps) {
  const destination = isGlossaryPage ? '/' : '/glossario'
  const label = isGlossaryPage ? 'CONVERSOR' : 'GLOSSÁRIO'
  const suggestionTarget = isGlossaryPage ? '/#sugestoes' : '#sugestoes'

  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Vira — início">
        <span className="brand-mark" aria-hidden="true">V/</span>
        <span>Vira</span>
      </a>
      <nav className="header-nav" aria-label="Navegação principal">
        <a href={destination}>{label}</a>
        <span className="nav-divider" aria-hidden="true">|</span>
        <a href={suggestionTarget}>INDIQUE UMA CONVERSÃO</a>
      </nav>
    </header>
  )
}

function Footer() {
  return (
    <footer>
      <span>Vira · Versão beta</span>
      <span aria-hidden="true">|</span>
      <span>© 2026</span>
      <span aria-hidden="true">|</span>
      <span>Conversão local</span>
      <span aria-hidden="true">|</span>
      <span>feito por <a href="https://anmaru.com/" target="_blank" rel="noreferrer">anmarū</a></span>
    </footer>
  )
}

function App() {
  const isGlossaryPage = window.location.pathname.replace(/\/+$/, '') === '/glossario'

  useEffect(() => {
    if (isGlossaryPage || window.location.hash !== '#sugestoes') return
    const timer = window.setTimeout(() => {
      document.getElementById('sugestoes')?.scrollIntoView({ behavior: 'smooth' })
    }, 0)
    return () => window.clearTimeout(timer)
  }, [isGlossaryPage])

  return (
    <div className="app-shell">
      <Header isGlossaryPage={isGlossaryPage} />
      {isGlossaryPage ? (
        <main id="top" className="glossary-page"><Glossary /></main>
      ) : (
        <main id="top">
          <section className="hero-copy" aria-labelledby="page-title">
            <p className="eyebrow">SEUS ARQUIVOS NÃO SAEM DO NAVEGADOR</p>
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