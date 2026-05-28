CREATE DATABASE cybermonitoring;
USE cybermonitoring;

-- PERFIS (controle de acesso)
CREATE TABLE perfis (
    id_perfil INT AUTO_INCREMENT PRIMARY KEY,
    nome_perfil VARCHAR(50) NOT NULL UNIQUE
);

--  USUÁRIOS
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    login VARCHAR(50) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    status ENUM('ATIVO', 'INATIVO') DEFAULT 'ATIVO',
    ultimo_acesso DATETIME,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_perfil INT NOT NULL,
    FOREIGN KEY (id_perfil) REFERENCES perfis(id_perfil)
);

-- ATIVOS (CRUD PRINCIPAL)
CREATE TABLE ativos (
    id_ativo INT AUTO_INCREMENT PRIMARY KEY,
    nome_maquina VARCHAR(100) NOT NULL,
    patrimonio VARCHAR(50) UNIQUE,
    numero_serie VARCHAR(80),
    ip VARCHAR(45),
    mac_address VARCHAR(30),
    setor VARCHAR(80),
    laboratorio VARCHAR(80),
    sistema_operacional VARCHAR(100),
    status_cadastro ENUM('ATIVO', 'INATIVO') DEFAULT 'ATIVO',
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

--  MONITORAMENTO (dados coletados)
CREATE TABLE monitoramentos (
    id_monitoramento INT AUTO_INCREMENT PRIMARY KEY,
    id_ativo INT NOT NULL,
    uso_cpu DECIMAL(5,2),
    uso_memoria DECIMAL(5,2),
    uso_disco DECIMAL(5,2),
    temperatura DECIMAL(5,2),
    disponibilidade BOOLEAN,
    status_monitoramento ENUM('NORMAL', 'ATENCAO', 'CRITICO') NOT NULL,
    data_coleta DATETIME DEFAULT CURRENT_TIMESTAMP,
    origem_dado VARCHAR(100),
    FOREIGN KEY (id_ativo) REFERENCES ativos(id_ativo)
);

--  HISTÓRICO DE STATUS
CREATE TABLE historico_status (
    id_historico INT AUTO_INCREMENT PRIMARY KEY,
    id_ativo INT NOT NULL,
    status_anterior ENUM('NORMAL', 'ATENCAO', 'CRITICO'),
    status_novo ENUM('NORMAL', 'ATENCAO', 'CRITICO') NOT NULL,
    data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    observacao TEXT,
    FOREIGN KEY (id_ativo) REFERENCES ativos(id_ativo)
);

--  RELATÓRIOS
CREATE TABLE relatorios (
    id_relatorio INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    tipo VARCHAR(80),
    filtro_aplicado TEXT,
    formato_exportacao ENUM('PDF', 'EXCEL') NOT NULL,
    data_geracao DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

--  LOGS DO SISTEMA
CREATE TABLE logs_sistema (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    acao VARCHAR(100) NOT NULL,
    descricao TEXT,
    data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_origem VARCHAR(45),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

--  DADOS INICIAIS
INSERT INTO perfis (nome_perfil) VALUES
('Administrador'),
('Tecnico');

INSERT INTO usuarios (nome, email, login, senha_hash, id_perfil) VALUES
('Administrador TI', 'admin@senai.edu.br', 'admin', '$2b$10$8KyW5hYBt3ySxuSMmTG2OeGh9RVrMAyXO9JEDggAQwMn2dRShNkHy', 1),
('Técnico Suporte', 'tecnico@senai.edu.br', 'tecnico', '$2b$10$8KyW5hYBt3ySxuSMmTG2OeGh9RVrMAyXO9JEDggAQwMn2dRShNkHy', 2);

INSERT INTO ativos (nome_maquina, patrimonio, numero_serie, ip, mac_address, setor, laboratorio, sistema_operacional, status_cadastro) VALUES
('Laboratório 01', 'PC-1001', 'SN-2024-001', '10.0.0.11', '00:1A:2B:3C:4D:5E', 'TI', 'Lab A', 'Windows 11', 'ATIVO'),
('Laboratório 02', 'PC-1002', 'SN-2024-002', '10.0.0.12', '00:1A:2B:3C:4D:5F', 'Administração', 'Lab B', 'Ubuntu 24.04', 'ATIVO'),
('Laboratório 03', 'PC-1003', 'SN-2024-003', '10.0.0.13', '00:1A:2B:3C:4D:60', 'Secretaria', 'Lab C', 'Windows 10', 'ATIVO');

INSERT INTO monitoramentos (id_ativo, uso_cpu, uso_memoria, uso_disco, temperatura, disponibilidade, status_monitoramento, origem_dado, data_coleta) VALUES
(1, 22.5, 55.2, 43.8, 42.3, 1, 'NORMAL', 'API externa', '2026-05-20 10:30:00'),
(2, 84.1, 91.0, 77.5, 75.9, 0, 'CRITICO', 'CSV importado', '2026-05-20 10:35:00'),
(3, 58.7, 72.4, 66.2, 63.8, 1, 'ATENCAO', 'JSON importado', '2026-05-20 10:40:00');

INSERT INTO historico_status (id_ativo, status_anterior, status_novo, observacao) VALUES
(2, 'ATENCAO', 'CRITICO', 'Alerta crítico detectado na última coleta');