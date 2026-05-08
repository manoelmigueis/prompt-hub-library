# Plano de Execução — Portfólio / Loja / Admin

O escopo enviado tem 14 fases e é grande demais para uma única iteração segura. Proponho dividir em **4 ondas** entregues em sequência, validando cada uma no preview antes de avançar. Isso evita regressões nas áreas já estáveis (auth, acervo, busca multilíngue).

---

## Onda 1 — Correções Críticas de UX (alta prioridade, baixo risco)

Foco em desbloquear o uso imediato.

1. **Fase 1 — Crop/Upload da foto de perfil**
   - Investigar erro real em `ProfileModal.tsx` (Blob → File, contentType, path do bucket `avatars`).
   - Adicionar logs `[ProfileUpload]`, retry, toast de erro real, preview instantâneo via update otimista do `avatar_url`.
2. **Fase 3 — Remover ícones duplicados Loja/Portfólio do dropdown do perfil** (manter no header).
3. **Fase 4 — Esconder tags/chips das fotos no portfólio público** (`PortfolioPublic.tsx`); manter no editor admin.
4. **Fase 5 — Fechar Preview do Portfólio**: botão X fixo, ESC, clique fora, "Voltar para edição".
5. **Fase 6 — Limite 20 → 40 fotos** (constante + mensagens de UI).
6. **Fase 14 — Floating button**: varredura final por `Floating*`, `FAB`, `fixed bottom-*` em portfolio e remover de vez.

Critério: foto de perfil salva sem erro, preview fecha, sem ícones duplicados, limite 40.

---

## Onda 2 — Loja & Pedidos (operacional)

7. **Fase 8 — Notificação Realtime na Loja**
   - Subscription Supabase Realtime em `portfolio_orders` por `owner_user_id`.
   - Badge no botão "Loja" do header + toast + som opcional (`new-order.mp3` em `public/sounds/`) com toggle mute persistido em `localStorage`.
8. **Fase 9 — Gestão de pedidos**
   - Adicionar coluna `status` com enum: `novo | em_producao | concluido | arquivado` (já existe `status text`, expandir uso).
   - Ações: marcar concluído, arquivar, excluir (RLS DELETE para owner).
   - Clicar imagem do pedido abre o `PromptModal` original.
9. **Fase 10 — Checkbox de baixa por imagem do pedido**
   - Nova coluna `delivered_image_urls text[]` em `portfolio_orders`.
10. **Fase 11 — Links rápidos** (`tel:`, `mailto:`, `https://wa.me/<numero>`) no `PortfolioShopModal`.

---

## Onda 3 — Admin & Busca

11. **Fase 13 — Admin real de usuários**
    - Já existe edge function `admin-users` e aba "Contas". Auditar: listar, promover/rebaixar admin/moderator, suspender, banir, deletar.
    - Garantir guarda backend (apenas role `admin`).
12. **Fase 2 — Busca real no acervo**
    - Confirmar que a grid renderiza `filteredImages` (não `images`); aplicar debounce 250ms; estado vazio elegante.
    - Buscar em `title`, `description`, `tags`, `category` usando o `searchTranslations.ts` existente.

---

## Onda 4 — Features Premium (maior escopo, requer migração nova)

13. **Fase 7 — Ensaios/Pacotes prontos (templates)**
    - Nova tabela `portfolio_presets` (user_id, name, description, cover_url, slug, category) + `portfolio_preset_items` (prompt_id, position).
    - UI estilo "folders": listar, duplicar, editar, copiar link público `/portfolio/:username/:slug`.
14. **Fase 12 — CRM/Leads**
    - Nova tabela `customers` (owner_user_id, name, email, phone, whatsapp, source, notes).
    - Trigger: ao inserir `portfolio_orders`, upsert em `customers` por `(owner_user_id, email|whatsapp)`.
    - Painel "Clientes" no `PortfolioShopModal` (ou nova aba).

---

## Detalhes Técnicos Relevantes

- **Migrações Supabase necessárias** (em ondas separadas):
  - Onda 2: ALTER `portfolio_orders` (delivered_image_urls, RLS DELETE), índice em `(owner_user_id, status)`, ALTER PUBLICATION supabase_realtime ADD TABLE `portfolio_orders`.
  - Onda 4: criar `portfolio_presets`, `portfolio_preset_items`, `customers` + RLS + trigger.
- **Storage**: bucket `avatars` já existe e é público; verificar limite atual (deve estar em 20MB conforme migração anterior).
- **Realtime**: usar canal `orders:${userId}` com filtro `owner_user_id=eq.<id>`.
- **Som**: precarregar `Audio` uma vez; tocar com `play().catch(()=>{})` para evitar erros de autoplay.
- **Logs**: prefixos `[ProfileUpload] [Portfolio] [Orders] [AdminUsers]` em todos os fluxos novos.

---

## Pergunta antes de começar

Confirma essa divisão em 4 ondas e quer que eu comece pela **Onda 1** agora? Ou prefere reordenar prioridades (ex.: Loja antes de UX)?

Também preciso saber:
- **Som de notificação**: posso gerar um som curto programaticamente (WebAudio beep premium) ou você vai enviar um `.mp3`?
- **Slug público dos ensaios** (Fase 7): formato `/portfolio/:username/:slug` está OK?
