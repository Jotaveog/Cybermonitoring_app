const path=require('path');
const ejs=require('ejs');
const fs=require('fs');
const mysql=require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname,'server','.env') });
(async()=>{
  const conn=await mysql.createConnection({ host:process.env.DB_HOST, user:process.env.DB_USER, password:process.env.DB_PASSWORD, database:process.env.DB_NAME });
  const [ativos]=await conn.execute("SELECT a.*, m.status_monitoramento, m.data_coleta AS ultima_atualizacao FROM ativos a LEFT JOIN monitoramentos m ON m.id_monitoramento=(SELECT id_monitoramento FROM monitoramentos WHERE id_ativo=a.id_ativo ORDER BY data_coleta DESC LIMIT 1) WHERE a.status_cadastro='ATIVO' ORDER BY a.nome_maquina ASC LIMIT 5");
  const [setores]=await conn.execute("SELECT setor as nome, COUNT(*) as quantidade FROM ativos WHERE status_cadastro='ATIVO' AND setor IS NOT NULL GROUP BY setor ORDER BY setor ASC");
  const [statusResumo]=await conn.execute("SELECT COUNT(CASE WHEN m.status_monitoramento = 'NORMAL' THEN 1 END) as normal, COUNT(CASE WHEN m.status_monitoramento = 'ATENCAO' THEN 1 END) as atencao, COUNT(CASE WHEN m.status_monitoramento = 'CRITICO' THEN 1 END) as critico FROM monitoramentos m WHERE m.data_coleta >= DATE_SUB(NOW(), INTERVAL 1 DAY)");
  const html=await ejs.renderFile(path.join(__dirname,'client','views','admin','relatorios.ejs'),{
    ativos, setores, statusResumo: statusResumo[0], totalAtivos: ativos.length, onlineCount: statusResumo[0].normal||0
  }, {rmWhitespace:true, filename:path.join(__dirname,'client','views','admin','relatorios.ejs')});
  console.log('rows:', (html.match(/<tr data-setor=/g)||[]).length);
  console.log('table present?', html.includes('<table class="list-table-extended report-table" id="reportTable">'));
  console.log('script src?', html.includes('<script src="/js/script.js" defer></script>'));
  console.log(html.slice(html.indexOf('<tbody>'), html.indexOf('</tbody>')+8));
  await conn.end();
})();
