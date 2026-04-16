# Desenvolvimento e Inovação

Aplicação web para acompanhamento de projetos e cronogramas do Departamento de Desenvolvimento e Inovação.

## Como executar o projeto

### Requisitos

- Node.js & npm instalados - [instalar com nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Passos para executar

```sh
# Passo 1: Instalar as dependências
npm i

# Passo 2: Iniciar o servidor de desenvolvimento
npm run dev
```

O projeto estará disponível em `http://localhost:8080`

## Tecnologias utilizadas

Este projeto foi construído com:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Scripts disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a build de produção
- `npm run preview` - Visualiza a build de produção
- `npm run lint` - Executa o linter

## Estrutura do projeto

- `src/components/` - Componentes React reutilizáveis
- `src/pages/` - Páginas da aplicação
- `src/data/` - Dados dos projetos (JSON)
- `src/types/` - Definições de tipos TypeScript

## Sincronização via Google Sheets

O app pode carregar conteúdo da planilha em vez do JSON local.

- `VITE_GOOGLE_SHEETS_ID`: ID da planilha (publicada ou compartilhada publicamente)
- `VITE_GOOGLE_SHEETS_SCRIPTS_GID`: obrigatório quando `VITE_GOOGLE_SHEETS_ID` for de publicação (`2PACX-...`) para buscar a aba de scripts
- `VITE_GOOGLE_SHEETS_DOCS_GID`: obrigatório quando `VITE_GOOGLE_SHEETS_ID` for de publicação (`2PACX-...`) para buscar a aba de documentação por projeto

### Aba de projetos (`roadmap`)

Colunas esperadas:

- `project_id`
- `project_name`
- `status`
- `next_step`
- `year`
- `item`
- `item_status` (`Concluído`, `Em andamento`, `Planejado`)
- `documentation_content` (opcional, fallback de texto simples no próprio roadmap)
- `kind` (opcional, usar `scripts` para o item especial de scripts)

### Aba de documentação de projetos (`project_docs`)

Modelo recomendado para documentação maior, sem usar um único campo:

- `project_id`
- `order` (número para ordenar blocos)
- `title` (opcional)
- `content`

Cada linha vira um bloco de documentação do projeto. Ao clicar no `+`, a timeline é substituída por essa documentação.

### Aba de scripts (`scripts`)

Colunas esperadas:

- `id`
- `name`
- `summary`
- `how_it_works`
- `usage`
- `link` (opcional)
