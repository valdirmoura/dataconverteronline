export function SuggestionForm() {
  return (
    <section className="suggestion" aria-labelledby="suggestion-title">
      <div className="suggestion-copy">
        <p className="eyebrow">PRÓXIMOS FORMATOS</p>
        <h2 id="suggestion-title">Não encontrou o conversor que precisava?</h2>
        <p>Conte qual conversão faria diferença no seu trabalho. As sugestões ajudam a definir as próximas ferramentas do Vira.</p>
      </div>
      <form action="https://formsubmit.co/valdirfmoura@gmail.com" method="POST" target="_blank" className="suggestion-form">
        <input type="hidden" name="_subject" value="Nova sugestão para o Vira" />
        <input type="hidden" name="_template" value="table" />
        <input type="text" name="_honey" className="visually-hidden" tabIndex={-1} autoComplete="off" />
        <label>
          Seu e-mail <span>(opcional)</span>
          <input type="email" name="email" autoComplete="email" placeholder="voce@exemplo.com" />
        </label>
        <label>
          Qual conversão você procura?
          <textarea name="sugestao" required minLength={10} placeholder="Ex.: transformar um arquivo ODT em PDF preservando a formatação." />
        </label>
        <button className="primary-button" type="submit">Enviar sugestão <span aria-hidden="true">→</span></button>
        <p className="form-note">A sugestão será encaminhada para o Vira por e-mail. Seus arquivos nunca são enviados por este formulário.</p>
      </form>
    </section>
  )
}