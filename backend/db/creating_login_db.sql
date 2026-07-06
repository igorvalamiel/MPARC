-- =============================================================
-- MANCHESTER - Sistema de Classificação de Risco
-- Banco de dados: inicialização
-- =============================================================

-- Extensão para geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- ENUM: tipos de perfil de usuário
-- =============================================================
CREATE TYPE role_tipo AS ENUM ('usuario', 'admin', 'desenvolvedor');

-- =============================================================
-- TABELA: usuarios
-- =============================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    nome          VARCHAR(150)  NOT NULL,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    senha_hash    TEXT          NOT NULL,
    role          role_tipo     NOT NULL DEFAULT 'usuario',
    id_apimed     VARCHAR(50)   NULL,         -- exclusivo para usuario e admin, opcional
    ativo         BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_por    UUID          NULL REFERENCES usuarios(id) ON DELETE SET NULL,
    criado_em     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    ultimo_acesso TIMESTAMPTZ   NULL
);

-- Índices para buscas frequentes
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_role  ON usuarios(role);

-- =============================================================
-- TABELA: sessoes
-- =============================================================
CREATE TABLE IF NOT EXISTS sessoes (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id  UUID        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token       TEXT        NOT NULL UNIQUE,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expira_em   TIMESTAMPTZ NOT NULL
);

-- Índice para validação rápida de token
CREATE INDEX IF NOT EXISTS idx_sessoes_token      ON sessoes(token);
CREATE INDEX IF NOT EXISTS idx_sessoes_usuario_id ON sessoes(usuario_id);

-- =============================================================
-- USUÁRIO INICIAL: desenvolvedor
-- Senha padrão: trocar no primeiro acesso
-- Hash de 'senha_dev_inicial' gerado com bcrypt
-- =============================================================
INSERT INTO usuarios (nome, email, senha_hash, role)
VALUES (
    'Desenvolvedor',
    'dev@manchester.local',
    '$2a$12$placeholder_troque_essa_hash_antes_de_usar',
    'desenvolvedor'
)
ON CONFLICT (email) DO NOTHING;