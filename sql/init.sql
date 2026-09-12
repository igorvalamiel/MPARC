CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    profissional_id VARCHAR(100),
    nome VARCHAR(100) NOT NULL,
    numeroConselho VARCHAR(100),
    cpf VARCHAR(100) NOT NULL
);

INSERT INTO usuarios (nome, cpf) VALUES 
('Igor Dev', '00000000000');




CREATE TYPE ClassRisc AS ENUM ('Azul', 'Verde', 'Amarelo', 'Laranja', 'Vermelho');

CREATE TABLE IF NOT EXISTS classificacoes (
    id SERIAL PRIMARY KEY,
    profissional_id VARCHAR(100) NOT NULL,
    boletim_id VARCHAR(100) NOT NULL,
    classificacao ClassRisc NOT NULL,
    caminho VARCHAR(500) NOT NULL
);
