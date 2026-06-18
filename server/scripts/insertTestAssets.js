const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../config/db');

const statuses = ['NORMAL', 'ATENCAO', 'CRITICO'];

function randomStatus() {
  const roll = Math.random();
  if (roll < 0.55) return 'NORMAL';
  if (roll < 0.85) return 'ATENCAO';
  return 'CRITICO';
}

function randomUsage() {
  return Number((Math.random() * 90 + 5).toFixed(1));
}

function randomTemp() {
  return Number((Math.random() * 25 + 35).toFixed(1));
}

function formatMac(octet) {
  return `00:1A:2B:3C:4D:${octet.toString(16).padStart(2, '0').toUpperCase()}`;
}

async function run() {
  try {
    const assets = [];

    for (let i = 1; i <= 30; i += 1) {
      assets.push({
        nome_maquina: `CISCO-${i.toString().padStart(4, '0')}`,
        patrimonio: `CISCO-${i.toString().padStart(4, '0')}`,
        numero_serie: `SN-CISCO-${i.toString().padStart(4, '0')}`,
        ip: `10.1.0.${10 + i}`,
        mac_address: formatMac(0x10 + i),
        setor: 'CISCO',
        laboratorio: `Rack ${Math.ceil(i / 5)}`,
        sistema_operacional: ['Windows 11', 'Windows 10', 'Ubuntu 24.04'][i % 3],
        status_cadastro: 'ATIVO'
      });
    }

    for (let i = 1; i <= 5; i += 1) {
      assets.push({
        nome_maquina: `CAC-${i.toString().padStart(4, '0')}`,
        patrimonio: `CAC-${i.toString().padStart(4, '0')}`,
        numero_serie: `SN-CAC-${i.toString().padStart(4, '0')}`,
        ip: `10.2.0.${10 + i}`,
        mac_address: formatMac(0 + i),
        setor: 'CAC',
        laboratorio: `Lab CAC ${Math.ceil(i / 2)}`,
        sistema_operacional: ['Windows 11', 'Windows 10', 'Ubuntu 24.04'][i % 3],
        status_cadastro: 'ATIVO'
      });
    }

    for (let i = 1; i <= 4; i += 1) {
      assets.push({
        nome_maquina: `HTC-DDS-3-23-${i.toString().padStart(2, '0')}`,
        patrimonio: `HTC-DDS-3-23-${i.toString().padStart(2, '0')}`,
        numero_serie: `SN-HTC-${i.toString().padStart(3, '0')}`,
        ip: `10.3.0.${10 + i}`,
        mac_address: formatMac(0x30 + i),
        setor: 'HTC-DDS-3-23',
        laboratorio: `Lab HTC ${Math.ceil(i / 2)}`,
        sistema_operacional: ['Windows 11', 'Windows 10', 'Ubuntu 24.04'][i % 3],
        status_cadastro: 'ATIVO'
      });
    }

    const insertSql = `INSERT INTO ativos
      (nome_maquina, patrimonio, numero_serie, ip, mac_address, setor, laboratorio, sistema_operacional, status_cadastro)
      VALUES ${assets.map(() => '(?,?,?,?,?,?,?,?,?)').join(',')}
      ON DUPLICATE KEY UPDATE
        nome_maquina = VALUES(nome_maquina),
        numero_serie = VALUES(numero_serie),
        ip = VALUES(ip),
        mac_address = VALUES(mac_address),
        setor = VALUES(setor),
        laboratorio = VALUES(laboratorio),
        sistema_operacional = VALUES(sistema_operacional),
        status_cadastro = VALUES(status_cadastro)`;

    const insertParams = assets.flatMap(a => [
      a.nome_maquina,
      a.patrimonio,
      a.numero_serie,
      a.ip,
      a.mac_address,
      a.setor,
      a.laboratorio,
      a.sistema_operacional,
      a.status_cadastro
    ]);

    await db.execute(insertSql, insertParams);
    console.log('Ativos CISCO/CAC/HTC inseridos/atualizados.');

    const patrimonios = assets.map(a => a.patrimonio);
    const patrimoniosPlaceholders = patrimonios.map(() => '?').join(',');

    const [rows] = await db.execute(
      `SELECT id_ativo, patrimonio FROM ativos WHERE patrimonio IN (${patrimoniosPlaceholders});`,
      patrimonios
    );

    const assetMap = new Map(rows.map(row => [row.patrimonio, row.id_ativo]));
    const ativoIds = Array.from(assetMap.values());

    if (ativoIds.length === 0) {
      throw new Error('Nenhum ativo encontrado após a inserção. Verifique os valores de patrimônio.');
    }

    const idPlaceholders = ativoIds.map(() => '?').join(',');
    await db.execute(`DELETE m FROM monitoramentos m WHERE m.id_ativo IN (${idPlaceholders});`, ativoIds);

    const monitorParams = assets.flatMap(asset => {
      const status = randomStatus();
      const disponibilidade = status === 'CRITICO' ? 0 : 1;
      return [
        assetMap.get(asset.patrimonio),
        status,
        randomUsage(),
        randomUsage(),
        randomUsage(),
        randomTemp(),
        disponibilidade,
        'Sync automático'
      ];
    });

    await db.execute(
      `INSERT INTO monitoramentos (id_ativo, status_monitoramento, uso_cpu, uso_memoria, uso_disco, temperatura, disponibilidade, origem_dado, data_coleta)
       VALUES ${assets.map(() => '(?,?,?,?,?,?,?,?,NOW())').join(',')}`,
      monitorParams
    );

    await db.execute(`DELETE h FROM historico_status h WHERE h.id_ativo IN (${idPlaceholders});`, ativoIds);

    const historyRows = [
      { patrimonio: 'CISCO-0004', anterior: 'ATENCAO', novo: 'CRITICO', observacao: 'Carga alta no servidor de rede' },
      { patrimonio: 'CISCO-0015', anterior: 'NORMAL', novo: 'ATENCAO', observacao: 'Uso de memória acima do normal' },
      { patrimonio: 'CISCO-0023', anterior: 'ATENCAO', novo: 'CRITICO', observacao: 'Processo travado em CPU alta' },
      { patrimonio: 'CAC-0003', anterior: 'ATENCAO', novo: 'CRITICO', observacao: 'Perda de rede intermitente' },
      { patrimonio: 'HTC-DDS-3-23-01', anterior: 'ATENCAO', novo: 'CRITICO', observacao: 'Servidor HTC com falha de ventilação' }
    ];

    await db.execute(
      `INSERT INTO historico_status (id_ativo, status_anterior, status_novo, observacao)
       VALUES ${historyRows.map(() => '(?,?,?,?)').join(',')}`,
      historyRows.flatMap(row => [assetMap.get(row.patrimonio), row.anterior, row.novo, row.observacao])
    );

    console.log('Histórico de status de teste inserido.');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao inserir ativos de teste:', error);
    process.exit(1);
  }
}

run();
