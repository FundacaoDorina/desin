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
- `api/` - Funções serverless (acesso e leitura da planilha privada)
- `apps-script/` - Script que entrega a planilha ao servidor
- `src/types/` - Definições de tipos TypeScript

## Acesso e dados

- **Quem está na rede da Fundação** entra direto, sem senha (IPs em `ALLOWED_IPS`).
- **Quem está fora** usa uma frase-senha (`ACCESS_PASSWORD`). A sessão dura 8 horas.
- **Os dados** continuam na planilha `desin` do Google, que fica **privada**. O navegador nunca acessa a planilha: ele pede os dados às funções em `api/`, que os buscam num App da Web do Apps Script com uma chave secreta. Sem Google Cloud.

### Variáveis de ambiente (Vercel → Settings → Environment Variables)

| Variável | O que é |
|---|---|
| `ALLOWED_IPS` | IPs públicos da Fundação (ou faixas CIDR), separados por vírgula. Vazio = todos precisam da senha. |
| `ACCESS_PASSWORD` | Frase-senha para quem está fora. Vazio = acesso só pela rede da Fundação. |
| `ACCESS_TOKEN_SECRET` | Segredo que assina as sessões (48+ caracteres aleatórios). |
| `APPS_SCRIPT_URL` | URL do App da Web (`https://script.google.com/macros/s/…/exec`). |
| `APPS_SCRIPT_KEY` | Chave gerada no Apps Script por `plataformaGerarChave`. |

Nenhuma dessas variáveis pode ter o prefixo `VITE_`: tudo que começa com `VITE_` é embutido no JavaScript público.

### 1. Apps Script (uns 10 minutos, uma vez só)

Use o mesmo projeto `DesIn` do script.google.com que já escreve na planilha (agenda-desin). Ele já tem acesso a ela.

1. Abra o projeto `DesIn` em script.google.com.
2. **Arquivos → + → Script**, nome `plataforma`. Cole todo o conteúdo de [`apps-script/plataforma.gs`](apps-script/plataforma.gs) e salve. O `desin.gs` não muda.
3. No menu ao lado de **Executar**, escolha `plataformaGerarChave` e clique **Executar**. Em **Registro de execução** aparece a chave: copie para `APPS_SCRIPT_KEY` na Vercel.
4. **Implantar → Nova implantação →** engrenagem **→ App da Web**:
   - Descrição: `plataforma`
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa** (quem não tem a chave não recebe nada)
5. **Implantar**, autorize se pedir, e copie a **URL do app da Web** (termina em `/exec`) para `APPS_SCRIPT_URL` na Vercel.

Se um dia alterar o `plataforma.gs`, use **Implantar → Gerenciar implantações → editar → Nova versão** para manter a mesma URL.

Para trocar a chave: rode `plataformaGerarChave` de novo e atualize `APPS_SCRIPT_KEY` na Vercel.

### 2. Rede da Fundação

Peça ao TI o **IP público fixo** da Fundação (IPv4 e, se houver, a faixa IPv6) e coloque em `ALLOWED_IPS`. Para conferir, acesse de dentro da Fundação um site como ifconfig.me. Se a Fundação não tiver IP fixo, deixe vazio e todos usam a frase-senha.

### 3. Frase-senha

Quatro palavras comuns soltas (ex.: `janela-pipoca-trilho-azul`) são fáceis de lembrar e difíceis de adivinhar. Não use nome da Fundação, do departamento nem do ano.

`/api/auth` bloqueia um IP após 10 senhas erradas em 15 minutos, mas esse contador fica na memória de cada instância. Para um limite que vale em todas as instâncias, crie no painel da Vercel (Firewall → Rules) uma regra de **rate limit** para `POST /api/auth` (por exemplo, 10 requisições por minuto por IP).

Trocar `ACCESS_PASSWORD` encerra todas as sessões abertas.

### 4. Ordem para colocar no ar

1. Apps Script (passo 1) e variáveis na Vercel.
2. Deploy. Confirme que o site carrega os dados, de dentro e de fora da Fundação.
3. Só então feche a planilha:
   - **Arquivo → Compartilhar → Publicar na Web → Interromper publicação**.
   - **Compartilhar**: confira que a conta que roda o Apps Script (e quem edita) aparece pelo nome, como Editor. Depois mude "Acesso geral" para **Restrito**.

### Desenvolvimento local

Copie `.env.example` para `.env` e preencha. `npm run dev` executa as mesmas funções de `api/` usadas na Vercel.

### Aba de projetos (`roadmap`)

Pode ter ou não uma linha de cabeçalho. Sem cabeçalho (como a automação do agenda-desin escreve), as colunas são lidas pela posição, de A a I, na ordem abaixo.

Colunas esperadas:

- `project_id`
- `project_name`
- `status` (texto livre; use `Encerrado` ou `Suspenso` para marcar o projeto como finalizado)
- `next_step`
- `year`
- `item`
- `item_status` (`Concluído`, `Em andamento`, `Planejado`, `Suspenso`, `Encerrado`)

Quando o `status` do projeto ou qualquer `item_status` for `Encerrado`/`Suspenso`, o progresso exibe 100% e o status mostrado fica Encerrado ou Suspenso, mesmo com itens pendentes.
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

### Aba de correções em beta (`testes_beta`)

Usada na área **correções em beta** da Plataforma Braille. A primeira linha deve ser o cabeçalho.

Colunas esperadas (os nomes da planilha atual também são aceitos):

- `CORREÇÃO` (ou `correcao`)
- `STATUS` (`Não iniciado`, `Em correção`, `Finalizado`)
- `PRIORIDADE (1>5)` (ou `prioridade`, número de 1 a 5)
- `EM BETA` (`SIM` / `NÃO`)
- `DIFICULDADE` (recomendado, porque a cor da célula não vem no CSV): `fácil` / `verde`, `médio` / `amarelo`, `médio difícil` / `amarelo escuro`, `difícil` / `vermelho`. Também aceita o formato combinado da planilha, como `fácil/verde`.
- `project_id` (opcional; padrão `plataforma-braille`)
- `id` (opcional)

A cor da coluna Correção no site segue a dificuldade. Sem a coluna `DIFICULDADE`, a correção aparece sem cor de dificuldade.

### Aba de correções linear (`correcoes_linear`)

Usada na área **correções linear** do projeto Linear (também acessível pelo botão ao lado de **correções em beta** na Plataforma Braille). Mesma estrutura da aba `testes_beta`.

- `project_id` (opcional; padrão `linear`)
