CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    profissional_id VARCHAR(100),
    nome VARCHAR(100) NOT NULL,
    numeroConselho VARCHAR(100),
    cpf VARCHAR(100) NOT NULL
);

INSERT INTO usuarios (nome, cpf) VALUES 
('Igor Dev', '00000000000');
