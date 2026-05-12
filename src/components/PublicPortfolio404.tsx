import logo from '@/assets/logo.png';

/**
 * Public-only 404 used by /portfolio/:username and /c/:username/:slug.
 *
 * SECURITY: This page is intentionally ISOLATED from the internal app.
 * It MUST NOT link to "/", the acervo, prompts, dashboard or any internal
 * surface. Visitors who arrive here are external clients of a portfolio
 * owner — they have no business seeing the prompt database.
 */
export default function PublicPortfolio404() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
      <img src={logo} alt="" className="h-10 w-auto opacity-70 mb-8" />
      <h1 className="font-display text-4xl md:text-5xl tracking-wider mb-3">
        Portfólio não encontrado
      </h1>
      <p className="text-muted-foreground max-w-md">
        Este link não está disponível. Verifique o endereço com a pessoa que
        compartilhou ou peça um link atualizado.
      </p>
      <a
        href="https://ensaioimpossivel.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        Ensaio Impossível →
      </a>
    </div>
  );
}
