# Orça Fácil — Frontend

Frontend React + TypeScript (Vite) da API Orça Fácil (Spring Boot). Autenticação via Supabase Auth; os dados vêm da API, que valida o JWT do Supabase.

## Configuração

1. Instale as dependências:

   ```bash
   pnpm install
   ```

2. Copie `.env.example` para `.env.local` e preencha com a URL e a chave **pública** (anon/publishable) do projeto Supabase. Nunca use a chave `service_role` no frontend.

3. No painel do Supabase (Authentication → URL Configuration), adicione às _Redirect URLs_:
   - `http://localhost:5173` (confirmação de cadastro)
   - `http://localhost:5173/redefinir-senha` (recuperação de senha)

## Desenvolvimento

Suba a API em `http://localhost:8080` e rode:

```bash
pnpm dev
```

O Vite repassa as chamadas `/api/*` para a API (veja `vite.config.ts`), então não é preciso configurar CORS no backend em desenvolvimento. Em produção, sirva o frontend e a API sob o mesmo domínio (ou configure CORS na API).

## Scripts

- `pnpm dev` — servidor de desenvolvimento
- `pnpm build` — checagem de tipos e build de produção
- `pnpm lint` — ESLint

## Estrutura

```
src/
  App.tsx              sessão do Supabase e rotas (públicas x autenticadas)
  components/          layout autenticado e campos de endereço compartilhados
  features/
    auth/              login, cadastro, recuperação e redefinição de senha
    business/          cadastro inicial e edição do negócio
    customers/         listagem, cadastro, edição e desativação de clientes
    quotes/            orçamentos, itens, status, preview e PDF
  lib/                 cliente Supabase e cliente HTTP da API
  types/ utils/        tipos compartilhados, formatação e validação
```
