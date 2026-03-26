

## Correção: Reload ao Trocar de Aba (Window Focus Bug)

### Causa Raiz

Dois problemas identificados:

1. **React Query `refetchOnWindowFocus` está habilitado por padrão** — O `QueryClient` em `App.tsx` (linha 12) é criado sem configuração, então todas as queries refazem fetch ao voltar para a aba.

2. **`useAuth` dispara `setLoading(true)` no `onAuthStateChange`** (linha 84) — Quando o Supabase detecta foco da janela e re-emite o evento de auth, o hook seta `loading = true`, o que mostra a tela de "Carregando..." e esconde todo o conteúdo, causando o "piscar".

### Plano de Correção

**Arquivo 1: `src/App.tsx`**
- Configurar o `QueryClient` com `defaultOptions.queries.refetchOnWindowFocus: false` para impedir refetches automáticos ao voltar para a aba.

**Arquivo 2: `src/hooks/useAuth.ts`**
- No callback `onAuthStateChange`: só chamar `setLoading(true)` e `fetchUserData` quando o evento for `SIGNED_IN` ou `SIGNED_OUT` (eventos reais de mudança). Ignorar eventos como `TOKEN_REFRESHED` ou `USER_UPDATED` que ocorrem em background e não devem resetar o loading.
- Isso evita que um token refresh silencioso (disparado pelo foco da janela) cause um flash de loading.

**Arquivo 3: `src/hooks/usePrompts.ts`**
- No `fetchPrompts`: só setar `setLoading(true)` se `prompts` estiver vazio (primeira carga). Isso evita loader de tela cheia em background refetches.

### Resumo das Alterações
- 3 arquivos editados, nenhum arquivo criado
- Nenhuma alteração visual ou de layout
- Lógica do Invite Gate preservada intacta

