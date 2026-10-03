# VLMB Metais

Site da VLMB Metais para registro de vendas de ouro e prata, com área do cliente e painel administrativo com rankings.

**Tecnologias:** Next.js 14 (App Router) · React · JavaScript · Supabase (Auth + Database + RLS) · Vercel · GitHub

## Estrutura

```
vlmb-metais/
├── app/                  # Páginas (App Router)
│   ├── layout.js         # Layout com menu, rodapé e botão WhatsApp
│   ├── page.js           # Início
│   ├── login/            # Entrar
│   ├── cadastro/         # Criar conta
│   ├── registrar-venda/  # Registrar venda (logado)
│   ├── historico/        # Histórico do usuário (logado)
│   ├── sobre/            # Sobre nós
│   └── admin/            # Painel administrativo (somente admin)
├── components/           # Navbar, Footer, WhatsAppButton, ProtectedRoute, AdminRoute, AuthProvider, VendaForm, Ranking...
├── lib/                  # supabase.js (cliente) e format.js (conversões e formatação)
├── styles/globals.css    # Identidade visual
├── supabase/schema.sql   # SQL completo: tabelas, constraints, índices, triggers, RLS
├── .env.local.example
└── package.json
```

## Segurança

A proteção não depende só do navegador. As regras estão no banco (RLS):
- Usuário comum só insere e vê as **próprias** vendas; não vê outras pessoas nem rankings (os rankings são calculados a partir de dados que só o admin consegue ler).
- Usuário comum não consegue alterar o próprio `role` (trigger `proteger_role`).
- Somente admin vê todos os usuários/vendas e pode editar ou excluir.
- A conversão kg → g também é garantida no banco (trigger `calcular_gramas`).
- Apenas a chave pública (anon) é usada no frontend. Nunca coloque a `service_role` no código.

## 1. Instalar o Node.js
Baixe a versão LTS (18 ou superior) em https://nodejs.org e instale. Confira no terminal:
```bash
node -v
npm -v
```

## 2. Baixar o projeto
Descompacte o ZIP, ou, se já estiver no GitHub:
```bash
git clone https://github.com/SEU-USUARIO/vlmb-metais.git
cd vlmb-metais
```

## 3. Instalar dependências
```bash
npm install
```

## 4. Criar o projeto no Supabase
1. Acesse https://supabase.com e crie uma conta.
2. Clique em **New project**, dê o nome `vlmb-metais`, defina uma senha do banco e escolha a região (ex.: South America - São Paulo).
3. Aguarde a criação.

## 5. Onde colocar as chaves
1. No Supabase: **Project Settings → API**.
2. Copie **Project URL** e a chave **anon public**.
3. Copie o arquivo de exemplo:
   ```bash
   cp .env.local.example .env.local
   ```
4. Preencha:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
   ```
O `.env.local` está no `.gitignore` e não vai para o GitHub.

## 6. Executar o SQL
1. No Supabase: **SQL Editor → New query**.
2. Cole todo o conteúdo de `supabase/schema.sql`.
3. Clique em **Run**. Deve aparecer "Success".

## 7. Configurar a autenticação
Em **Authentication → URL Configuration**:
- **Site URL**: `http://localhost:3000` (depois troque pelo domínio final).
- **Redirect URLs**: adicione `http://localhost:3000/**` e `https://vlmbmetais.com.br/**`.

Por padrão o Supabase exige confirmação por e-mail. Para testes, você pode desativar em **Authentication → Providers → Email → Confirm email**.

## 8. Executar localmente
```bash
npm run dev
```
Abra http://localhost:3000

## 9. Criar a primeira administradora
1. Cadastre-se pelo site com o e-mail da administradora (e confirme o e-mail, se ativo).
2. No **SQL Editor** do Supabase rode:
   ```sql
   update public.profiles set role = 'admin' where email = 'email-da-administradora@exemplo.com';
   ```
3. Saia e entre novamente no site. O menu mostrará **Painel Administrativo**.

## 10. Testes
**Cadastro:** acesse `/cadastro`, crie uma conta, faça login em `/login`. Confira o usuário em **Supabase → Table Editor → profiles**.

**Vendas:** em `/registrar-venda` registre, por exemplo, 30 kg de prata e depois 5 kg de prata. Em `/historico` aparecem só as suas vendas. Na tabela `vendas`, `quantidade_gramas` deve ser 30000 e 5000.

**Ranking:** crie 2 ou 3 contas, registre vendas em cada uma e entre como admin em `/admin`. O ranking de prata deve mostrar o usuário acima com **35 kg** acumulados. Teste também:
- Com um usuário comum, acesse `/admin` → será redirecionado.
- Edite e exclua uma venda pelo painel.

## 11. Enviar para o GitHub
1. Crie um repositório vazio em https://github.com/new chamado `vlmb-metais`.
2. Na pasta do projeto:
   ```bash
   git init
   git add .
   git commit -m "Primeira versão do site VLMB Metais"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/vlmb-metais.git
   git push -u origin main
   ```

## 12. Publicar na Vercel
1. Acesse https://vercel.com e entre com sua conta do GitHub.
2. **Add New → Project** e importe o repositório `vlmb-metais`.
3. Em **Environment Variables**, adicione `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Clique em **Deploy**. Você receberá um endereço como `vlmb-metais.vercel.app`.
5. No Supabase, adicione esse endereço em **Authentication → URL Configuration → Redirect URLs**.

A cada `git push` na branch `main`, a Vercel publica automaticamente.

## 13. Domínio personalizado (vlmbmetais.com.br)
1. Registre o domínio no https://registro.br (se ainda não tiver).
2. Na Vercel: **Project → Settings → Domains → Add** e digite `vlmbmetais.com.br` (adicione também `www.vlmbmetais.com.br`).
3. A Vercel mostrará os registros DNS. No Registro.br, em **DNS → Editar zona**, crie:
   - Tipo **A**, nome vazio (@), valor `76.76.21.21`
   - Tipo **CNAME**, nome `www`, valor `cname.vercel-dns.com`
   (use sempre os valores exatos que a Vercel exibir).
4. Aguarde a propagação (de minutos a algumas horas). O HTTPS é ativado automaticamente.
5. No Supabase, troque o **Site URL** para `https://vlmbmetais.com.br`.

## Contato no site
Botão flutuante de WhatsApp para Daniela: +55 11 94910-4529.
