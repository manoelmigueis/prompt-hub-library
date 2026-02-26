

# Redesign Visual e Novos Recursos - "O Ensaio Impossivel"

## Analise da Imagem de Referencia

A imagem mostra um layout com estas caracteristicas visuais e recursos:

1. **Header com navegacao horizontal** - Links como "Categorias", "Novos Prompts", "Favoritos", "Login" vissiveis no topo
2. **Hero com titulo "O ENSAIO IMPOSSIVEL"** em vermelho grande, com subtitulo descritivo e contadores (ensaios, tags, categorias)
3. **Barra de busca** centralizada com botao "Buscar"
4. **Filtros de categoria** como chips/pills horizontais scrollaveis
5. **Grid de cards 4 colunas** no desktop com:
   - Imagens ocupando a maior parte do card
   - Badge do autor (com avatar) no topo esquerdo da imagem
   - Badge "Novo" ou "Atualizado" no topo direito  
   - Titulo abaixo da imagem
   - Descricao SEO truncada
   - Botao "Copiar Prompt" vermelho e botao "Compartilhar"
6. **Secao "Todos os Prompts"** com titulo e toggle de visualizacao (grid/lista)
7. **Design dark mode puro** - fundo escuro, cards escuros, acentos em vermelho

## Plano de Implementacao

### 1. Forcar Dark Mode como padrao
- Adicionar classe `dark` ao `<html>` no `index.html` ou via ThemeProvider
- Garantir que o tema escuro esta ativo por padrao

### 2. Atualizar Header (Header.tsx)
- Adicionar links de navegacao horizontais: "Categorias", "Novos Prompts", "Favoritos"
- Manter botoes de acao (Enviar, Painel Admin, Avatar) a direita
- Tornar o header scrollavel horizontalmente no mobile

### 3. Redesenhar HeroSection (HeroSection.tsx)
- Titulo "O ENSAIO IMPOSSIVEL" grande em vermelho
- Subtitulo descritivo abaixo
- Adicionar contadores estatisticos (total ensaios, total categorias, total tags)
- Manter barra de busca

### 4. Redesenhar PromptCard (PromptCard.tsx) - Layout do Screenshot
- Badge do autor com mini avatar no topo esquerdo sobre a imagem
- Badge "Novo" no topo direito para posts recentes
- Imagem como foco principal do card
- Titulo e descricao abaixo da imagem
- Botao "Copiar Prompt" vermelho e botao "Compartilhar" na parte inferior
- Botoes sempre visiveis (nao apenas no hover)

### 5. Atualizar PromptGrid (PromptGrid.tsx)
- Grid de 4 colunas no desktop (lg:grid-cols-4)
- Adicionar titulo de secao "Todos os Prompts"
- Adicionar toggle de visualizacao grid/lista (UI apenas)

### 6. Atualizar CategoryFilter (CategoryFilter.tsx)
- Chips scrollaveis horizontalmente no mobile
- Adicionar mais categorias visiveis na referencia: "Retrato Realista", "Foto Artistica", "Moda & Estilo", "Cenarios Naturais", "Video Effect", "Body Painting", "Fotografia", "Arte Digital"
- Adicionar novas categorias ao types/prompt.ts

### 7. Mais categorias (types/prompt.ts)
- Adicionar categorias como: `retrato-realista`, `foto-artistica`, `moda-estilo`, `cenarios`, `video-effect`, `body-art`, `fotografia`, `arte-digital`

### 8. Ajustes CSS (index.css)
- Melhorar estilos dos cards para dark mode
- Botoes de acao sempre visiveis nos cards
- Responsividade: 1 coluna mobile, 2 tablet, 4 desktop
- Estilos para badges de autor sobrepostos na imagem

## Detalhes Tecnicos

### Arquivos a modificar:
1. **index.html** - Adicionar classe `dark` ao html
2. **src/types/prompt.ts** - Novas categorias
3. **src/components/Header.tsx** - Nav links horizontais, responsivo
4. **src/components/HeroSection.tsx** - Novo layout com contadores
5. **src/components/PromptCard.tsx** - Redesign completo conforme referencia
6. **src/components/PromptGrid.tsx** - 4 colunas, titulo de secao, toggle view
7. **src/components/CategoryFilter.tsx** - Scroll horizontal, novas categorias
8. **src/index.css** - Novos estilos para o redesign

### Responsividade:
- Mobile (< 640px): 1 coluna, header compacto, categorias scrollaveis
- Tablet (640-1024px): 2 colunas
- Desktop (> 1024px): 4 colunas

### Nenhuma alteracao em:
- Logica de autenticacao
- Logica de prompts/hooks
- Backend/banco de dados
- Modais existentes (Submit, Admin, Profile)
