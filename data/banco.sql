CREATE DATABASE IF NOT EXISTS cybermonitoring;
USE cybermonitoring;

-- PERFIS (controle de acesso)
CREATE TABLE IF NOT EXISTS perfis (
    id_perfil INT AUTO_INCREMENT PRIMARY KEY,
    nome_perfil VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO perfis (id_perfil, nome_perfil)
VALUES
    (1, 'Administrador'),
    (2, 'Tecnico')
ON DUPLICATE KEY UPDATE nome_perfil = VALUES(nome_perfil);

--  USUÁRIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    status ENUM('ATIVO', 'INATIVO') DEFAULT 'ATIVO',
    ultimo_acesso DATETIME,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_perfil INT NOT NULL,
    FOREIGN KEY (id_perfil) REFERENCES perfis(id_perfil)
);

-- ATIVOS (CRUD PRINCIPAL)
CREATE TABLE IF NOT EXISTS ativos (
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
CREATE TABLE IF NOT EXISTS monitoramentos (
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
CREATE TABLE IF NOT EXISTS historico_status (
    id_historico INT AUTO_INCREMENT PRIMARY KEY,
    id_ativo INT NOT NULL,
    status_anterior ENUM('NORMAL', 'ATENCAO', 'CRITICO'),
    status_novo ENUM('NORMAL', 'ATENCAO', 'CRITICO') NOT NULL,
    data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    observacao TEXT,
    FOREIGN KEY (id_ativo) REFERENCES ativos(id_ativo)
);

--  RELATÓRIOS
CREATE TABLE IF NOT EXISTS relatorios (
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
CREATE TABLE IF NOT EXISTS logs_sistema (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    acao VARCHAR(100) NOT NULL,
    descricao TEXT,
    data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_origem VARCHAR(45),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

INSERT INTO ativos (nome_maquina, patrimonio, numero_serie, ip, mac_address, setor, laboratorio, sistema_operacional, status_cadastro) VALUES
('CISCO-0001', 'CISCO-0001', 'SN-CISCO-001', '10.1.0.11', '00:1A:2B:3C:4D:10', 'CISCO', 'Rack A1', 'Windows 11', 'ATIVO'),
('CISCO-0002', 'CISCO-0002', 'SN-CISCO-002', '10.1.0.12', '00:1A:2B:3C:4D:11', 'CISCO', 'Rack A1', 'Windows 11', 'ATIVO'),
('CISCO-0003', 'CISCO-0003', 'SN-CISCO-003', '10.1.0.13', '00:1A:2B:3C:4D:12', 'CISCO', 'Rack A1', 'Windows 10', 'ATIVO'),
('CISCO-0004', 'CISCO-0004', 'SN-CISCO-004', '10.1.0.14', '00:1A:2B:3C:4D:13', 'CISCO', 'Rack A2', 'Ubuntu 24.04', 'ATIVO'),
('CISCO-0005', 'CISCO-0005', 'SN-CISCO-005', '10.1.0.15', '00:1A:2B:3C:4D:14', 'CISCO', 'Rack A2', 'Windows 11', 'ATIVO'),
('CISCO-0006', 'CISCO-0006', 'SN-CISCO-006', '10.1.0.16', '00:1A:2B:3C:4D:15', 'CISCO', 'Rack A2', 'Windows 10', 'ATIVO'),
('CISCO-0007', 'CISCO-0007', 'SN-CISCO-007', '10.1.0.17', '00:1A:2B:3C:4D:16', 'CISCO', 'Rack A3', 'Windows 11', 'ATIVO'),
('CISCO-0008', 'CISCO-0008', 'SN-CISCO-008', '10.1.0.18', '00:1A:2B:3C:4D:17', 'CISCO', 'Rack A3', 'Ubuntu 24.04', 'ATIVO'),
('CISCO-0009', 'CISCO-0009', 'SN-CISCO-009', '10.1.0.19', '00:1A:2B:3C:4D:18', 'CISCO', 'Rack A3', 'Windows 10', 'ATIVO'),
('CISCO-0010', 'CISCO-0010', 'SN-CISCO-010', '10.1.0.20', '00:1A:2B:3C:4D:19', 'CISCO', 'Rack A4', 'Windows 11', 'ATIVO'),
('CISCO-0011', 'CISCO-0011', 'SN-CISCO-011', '10.1.0.21', '00:1A:2B:3C:4D:1A', 'CISCO', 'Rack A4', 'Ubuntu 24.04', 'ATIVO'),
('CISCO-0012', 'CISCO-0012', 'SN-CISCO-012', '10.1.0.22', '00:1A:2B:3C:4D:1B', 'CISCO', 'Rack A4', 'Windows 11', 'ATIVO'),
('CISCO-0013', 'CISCO-0013', 'SN-CISCO-013', '10.1.0.23', '00:1A:2B:3C:4D:1C', 'CISCO', 'Rack A5', 'Windows 10', 'ATIVO'),
('CISCO-0014', 'CISCO-0014', 'SN-CISCO-014', '10.1.0.24', '00:1A:2B:3C:4D:1D', 'CISCO', 'Rack A5', 'Windows 11', 'ATIVO'),
('CISCO-0015', 'CISCO-0015', 'SN-CISCO-015', '10.1.0.25', '00:1A:2B:3C:4D:1E', 'CISCO', 'Rack A5', 'Ubuntu 24.04', 'ATIVO'),
('CISCO-0016', 'CISCO-0016', 'SN-CISCO-016', '10.1.0.26', '00:1A:2B:3C:4D:1F', 'CISCO', 'Rack A6', 'Windows 11', 'ATIVO'),
('CISCO-0017', 'CISCO-0017', 'SN-CISCO-017', '10.1.0.27', '00:1A:2B:3C:4D:20', 'CISCO', 'Rack A6', 'Windows 10', 'ATIVO'),
('CISCO-0018', 'CISCO-0018', 'SN-CISCO-018', '10.1.0.28', '00:1A:2B:3C:4D:21', 'CISCO', 'Rack A6', 'Windows 11', 'ATIVO'),
('CISCO-0019', 'CISCO-0019', 'SN-CISCO-019', '10.1.0.29', '00:1A:2B:3C:4D:22', 'CISCO', 'Rack A7', 'Ubuntu 24.04', 'ATIVO'),
('CISCO-0020', 'CISCO-0020', 'SN-CISCO-020', '10.1.0.30', '00:1A:2B:3C:4D:23', 'CISCO', 'Rack A7', 'Windows 10', 'ATIVO'),
('CISCO-0021', 'CISCO-0021', 'SN-CISCO-021', '10.1.0.31', '00:1A:2B:3C:4D:24', 'CISCO', 'Rack A8', 'Windows 11', 'ATIVO'),
('CISCO-0022', 'CISCO-0022', 'SN-CISCO-022', '10.1.0.32', '00:1A:2B:3C:4D:25', 'CISCO', 'Rack A8', 'Windows 10', 'ATIVO'),
('CISCO-0023', 'CISCO-0023', 'SN-CISCO-023', '10.1.0.33', '00:1A:2B:3C:4D:26', 'CISCO', 'Rack A8', 'Ubuntu 24.04', 'ATIVO'),
('CISCO-0024', 'CISCO-0024', 'SN-CISCO-024', '10.1.0.34', '00:1A:2B:3C:4D:27', 'CISCO', 'Rack A9', 'Windows 11', 'ATIVO'),
('CISCO-0025', 'CISCO-0025', 'SN-CISCO-025', '10.1.0.35', '00:1A:2B:3C:4D:28', 'CISCO', 'Rack A9', 'Windows 10', 'ATIVO'),
('CISCO-0026', 'CISCO-0026', 'SN-CISCO-026', '10.1.0.36','00:1A:2B:3C:4D:29',  'CISCO', 'Rack A9', 'Ubuntu 24.04', 'ATIVO'),
('CISCO-0027', 'CISCO-0027', 'SN-CISCO-027', '10.1.0.37', '00:1A:2B:3C:4D:2A', 'CISCO', 'Rack B1', 'Windows 11', 'ATIVO'),
('CISCO-0028', 'CISCO-0028', 'SN-CISCO-028', '10.1.0.38', '00:1A:2B:3C:4D:2B', 'CISCO', 'Rack B1', 'Windows 10', 'ATIVO'),
('CISCO-0029', 'CISCO-0029', 'SN-CISCO-029', '10.1.0.39', '00:1A:2B:3C:4D:2C', 'CISCO', 'Rack B1', 'Ubuntu 24.04', 'ATIVO'),
('CISCO-0030', 'CISCO-0030', 'SN-CISCO-030', '10.1.0.40', '00:1A:2B:3C:4D:2D', 'CISCO', 'Rack B2', 'Windows 11', 'ATIVO'),
('CAC-0001', 'CAC-0001', 'SN-CAC-001', '10.2.0.11', '00:1A:2B:3C:4D:30', 'CAC', 'Lab CAC 1', 'Windows 11', 'ATIVO'),
('CAC-0002', 'CAC-0002', 'SN-CAC-002', '10.2.0.12', '00:1A:2B:3C:4D:31', 'CAC', 'Lab CAC 1', 'Windows 10', 'ATIVO'),
('CAC-0003', 'CAC-0003', 'SN-CAC-003', '10.2.0.13', '00:1A:2B:3C:4D:32', 'CAC', 'Lab CAC 2', 'Ubuntu 24.04', 'ATIVO'),
('CAC-0004', 'CAC-0004', 'SN-CAC-004', '10.2.0.14', '00:1A:2B:3C:4D:33', 'CAC', 'Lab CAC 2', 'Windows 11', 'ATIVO'),
('CAC-0005', 'CAC-0005', 'SN-CAC-005', '10.2.0.15', '00:1A:2B:3C:4D:34', 'CAC', 'Lab CAC 2', 'Windows 10', 'ATIVO'),
('HTC-DDS-3-23-01', 'HTC-DDS-3-23-01', 'SN-HTC-001', '10.3.0.11', '00:1A:2B:3C:4D:40', 'HTC-DDS-3-23', 'Lab HTC 1', 'Windows 11', 'ATIVO'),
('HTC-DDS-3-23-02', 'HTC-DDS-3-23-02', 'SN-HTC-002', '10.3.0.12', '00:1A:2B:3C:4D:41', 'HTC-DDS-3-23', 'Lab HTC 1', 'Windows 10', 'ATIVO'),
('HTC-DDS-3-23-03', 'HTC-DDS-3-23-03', 'SN-HTC-003', '10.3.0.13', '00:1A:2B:3C:4D:42', 'HTC-DDS-3-23', 'Lab HTC 2', 'Ubuntu 24.04', 'ATIVO'),
('HTC-DDS-3-23-04', 'HTC-DDS-3-23-04', 'SN-HTC-004', '10.3.0.14', '00:1A:2B:3C:4D:43', 'HTC-DDS-3-23', 'Lab HTC 2', 'Windows 11', 'ATIVO')
ON DUPLICATE KEY UPDATE
  nome_maquina = VALUES(nome_maquina),
  numero_serie = VALUES(numero_serie),
  ip = VALUES(ip),
  mac_address = VALUES(mac_address),
  setor = VALUES(setor),
  laboratorio = VALUES(laboratorio),
  sistema_operacional = VALUES(sistema_operacional),
  status_cadastro = VALUES(status_cadastro);

INSERT INTO monitoramentos (id_ativo, uso_cpu, uso_memoria, uso_disco, temperatura, disponibilidade, status_monitoramento, origem_dado, data_coleta) VALUES
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0001'), 14.2, 43.1, 37.5, 42.0, 1, 'NORMAL', 'Sync automático', '2026-06-17 09:10:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0002'), 26.8, 59.3, 48.5, 45.0, 1, 'NORMAL', 'Sync automático', '2026-06-17 09:12:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0003'), 72.4, 81.2, 79.0, 68.2, 1, 'ATENCAO', 'Sync automático', '2026-06-17 09:14:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0004'), 89.9, 93.5, 84.1, 76.9, 0, 'CRITICO', 'Sync automático', '2026-06-17 09:16:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0005'), 33.6, 62.2, 29.4, 48.1, 1, 'NORMAL', 'Sync automático', '2026-06-17 09:18:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0006'), 48.5, 72.0, 58.3, 55.4, 1, 'ATENCAO', 'Sync automático', '2026-06-17 09:20:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0007'), 95.3, 94.8, 88.7, 78.9, 0, 'CRITICO', 'Sync automático', '2026-06-17 09:22:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0008'), 12.5, 31.0, 26.8, 40.2, 1, 'NORMAL', 'Sync automático', '2026-06-17 09:24:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0009'), 54.1, 71.8, 64.2, 57.3, 1, 'ATENCAO', 'Sync automático', '2026-06-17 09:26:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0010'), 14.7, 48.3, 39.7, 43.5, 1, 'NORMAL', 'Sync automático', '2026-06-17 09:28:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0011'), 88.2, 89.5, 90.1, 75.0, 0, 'CRITICO', 'Sync automático', '2026-06-17 09:30:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0012'), 37.4, 55.0, 44.2, 52.6, 1, 'NORMAL', 'Sync automático', '2026-06-17 09:32:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0013'), 61.8, 77.5, 69.9, 60.8, 1, 'ATENCAO', 'Sync automático', '2026-06-17 09:34:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0014'), 23.0, 47.1, 33.8, 46.2, 1, 'NORMAL', 'Sync automático', '2026-06-17 09:36:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0015'), 82.5, 90.3, 84.6, 77.1, 0, 'CRITICO', 'Sync automático', '2026-06-17 09:38:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0016'), 49.1, 63.2, 52.7, 54.8, 1, 'ATENCAO', 'Sync automático', '2026-06-17 09:40:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0017'), 18.6, 41.5, 32.2, 44.3, 1, 'NORMAL', 'Sync automático', '2026-06-17 09:42:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0018'), 79.2, 85.1, 74.8, 69.4, 0, 'CRITICO', 'Sync automático', '2026-06-17 09:44:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0019'), 39.7, 58.6, 48.0, 50.0, 1, 'ATENCAO', 'Sync automático', '2026-06-17 09:46:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0020'), 26.3, 52.0, 40.1, 47.8, 1, 'NORMAL', 'Sync automático', '2026-06-17 09:48:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0021'), 64.0, 79.5, 71.3, 61.5, 1, 'ATENCAO', 'Sync automático', '2026-06-17 09:50:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0022'), 16.8, 40.5, 33.7, 43.2, 1, 'NORMAL', 'Sync automático', '2026-06-17 09:52:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0023'), 91.4, 95.0, 87.2, 79.1, 0, 'CRITICO', 'Sync automático', '2026-06-17 09:54:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0024'), 21.2, 44.0, 36.1, 45.5, 1, 'NORMAL', 'Sync automático', '2026-06-17 09:56:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0025'), 53.5, 69.2, 59.0, 56.8, 1, 'ATENCAO', 'Sync automático', '2026-06-17 09:58:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0026'), 12.1, 34.7, 28.3, 41.5, 1, 'NORMAL', 'Sync automático', '2026-06-17 10:00:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0027'), 67.8, 82.1, 74.0, 63.9, 1, 'ATENCAO', 'Sync automático', '2026-06-17 10:02:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0028'), 29.4, 50.8, 41.9, 48.9, 1, 'NORMAL', 'Sync automático', '2026-06-17 10:04:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0029'), 46.2, 67.0, 55.5, 54.1, 1, 'ATENCAO', 'Sync automático', '2026-06-17 10:06:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0030'), 83.7, 91.6, 80.8, 76.2, 0, 'CRITICO', 'Sync automático', '2026-06-17 10:08:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CAC-0001'), 19.3, 39.5, 31.8, 44.8, 1, 'NORMAL', 'Sync automático', '2026-06-17 10:10:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CAC-0002'), 58.9, 72.3, 66.7, 58.4, 1, 'ATENCAO', 'Sync automático', '2026-06-17 10:12:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CAC-0003'), 87.5, 90.8, 85.2, 74.5, 0, 'CRITICO', 'Sync automático', '2026-06-17 10:14:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CAC-0004'), 27.4, 50.1, 42.6, 49.7, 1, 'NORMAL', 'Sync automático', '2026-06-17 10:16:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CAC-0005'), 45.8, 63.4, 54.9, 53.2, 1, 'ATENCAO', 'Sync automático', '2026-06-17 10:18:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'HTC-DDS-3-23-01'), 94.2, 96.7, 89.9, 80.4, 0, 'CRITICO', 'Sync automático', '2026-06-17 10:20:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'HTC-DDS-3-23-02'), 56.1, 70.0, 61.8, 59.5, 1, 'ATENCAO', 'Sync automático', '2026-06-17 10:22:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'HTC-DDS-3-23-03'), 31.7, 54.2, 45.0, 50.8, 1, 'NORMAL', 'Sync automático', '2026-06-17 10:24:00'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'HTC-DDS-3-23-04'), 78.9, 84.3, 72.5, 67.9, 0, 'CRITICO', 'Sync automático', '2026-06-17 10:26:00');

INSERT INTO historico_status (id_ativo, status_anterior, status_novo, observacao) VALUES
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0004'), 'ATENCAO', 'CRITICO', 'Carga alta no servidor de rede'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0015'), 'NORMAL', 'ATENCAO', 'Uso de memória acima do normal'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CISCO-0023'), 'ATENCAO', 'CRITICO', 'Processo travado em CPU alta'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'CAC-0003'), 'ATENCAO', 'CRITICO', 'Perda de rede intermitente'),
((SELECT id_ativo FROM ativos WHERE patrimonio = 'HTC-DDS-3-23-01'), 'ATENCAO', 'CRITICO', 'Servidor HTC com falha de ventilação');
