-- =========================================================
-- VLMB Metais — Esquema completo do banco (Supabase)
-- Execute no Supabase: SQL Editor > New query > cole e clique em Run
-- =========================================================

-- ---------- TABELA PROFILES ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- ---------- TABELA VENDAS ----------
create table if not exists public.vendas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  material text not null check (material in ('ouro', 'prata')),
  quantidade_original numeric(14,3) not null check (quantidade_original > 0),
  unidade text not null check (unidade in ('g', 'kg')),
  quantidade_gramas numeric(16,3) not null check (quantidade_gramas > 0),
  created_at timestamptz not null default now()
);

create index if not exists vendas_user_id_idx on public.vendas(user_id);
create index if not exists vendas_material_idx on public.vendas(material);
create index if not exists vendas_created_at_idx on public.vendas(created_at desc);

-- ---------- FUNÇÃO: é admin? (security definer evita recursão no RLS) ----------
create or replace function public.is_admin(_uid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = _uid and role = 'admin');
$$;

-- ---------- TRIGGER: cria profile ao cadastrar ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email, role)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'nome', ''), split_part(new.email, '@', 1)), new.email, 'user');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- TRIGGER: conversão automática para gramas (garantia no banco) ----------
create or replace function public.calcular_gramas()
returns trigger
language plpgsql
as $$
begin
  new.quantidade_gramas := case when new.unidade = 'kg' then new.quantidade_original * 1000 else new.quantidade_original end;
  return new;
end;
$$;

drop trigger if exists vendas_calcular_gramas on public.vendas;
create trigger vendas_calcular_gramas
  before insert or update on public.vendas
  for each row execute function public.calcular_gramas();

-- ---------- TRIGGER: impede usuário comum de alterar role ----------
create or replace function public.proteger_role()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin(auth.uid()) then
    raise exception 'Somente administradores podem alterar o role.';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_proteger_role on public.profiles;
create trigger profiles_proteger_role
  before update on public.profiles
  for each row execute function public.proteger_role();

-- ---------- PERMISSÕES ----------
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.vendas to authenticated;
grant all on public.profiles, public.vendas to service_role;
revoke all on public.profiles, public.vendas from anon;

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.vendas enable row level security;

-- PROFILES
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin(auth.uid()))
  with check (id = auth.uid() or public.is_admin(auth.uid()));

-- VENDAS
drop policy if exists "vendas_select_own_or_admin" on public.vendas;
create policy "vendas_select_own_or_admin" on public.vendas
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "vendas_insert_own" on public.vendas;
create policy "vendas_insert_own" on public.vendas
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "vendas_update_admin" on public.vendas;
create policy "vendas_update_admin" on public.vendas
  for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "vendas_delete_admin" on public.vendas;
create policy "vendas_delete_admin" on public.vendas
  for delete to authenticated
  using (public.is_admin(auth.uid()));

-- ---------- CRIAR O PRIMEIRO ADMIN ----------
-- 1) Cadastre-se normalmente pelo site com o e-mail da administradora.
-- 2) Rode o comando abaixo trocando o e-mail:
-- update public.profiles set role = 'admin' where email = 'email-da-administradora@exemplo.com';
