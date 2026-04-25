-- Script para criar as tabelas no Supabase
-- Execute este SQL no editor SQL do Supabase

-- Tabela de usuários (perfis)
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  password TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('dono', 'master')),
  bloqueado BOOLEAN DEFAULT false,
  dispositivos_permitidos INTEGER DEFAULT 1,
  cor_app TEXT DEFAULT '#22c55e',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  endereco TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de produtos/serviços
CREATE TABLE IF NOT EXISTS public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco NUMERIC(10,2) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('produto', 'servico')),
  estoque INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS public.vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  cliente_id UUID,
  total NUMERIC(10,2) NOT NULL,
  itens JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);