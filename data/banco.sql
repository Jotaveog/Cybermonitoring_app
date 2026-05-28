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