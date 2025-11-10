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
