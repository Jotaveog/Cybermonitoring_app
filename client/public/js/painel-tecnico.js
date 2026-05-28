// ===== ROTA DO PAINEL TÉCNICO =====
// Adicionar no arquivo de rotas do técnico (ex: server/routes/tecnico.js)
 
router.get('/painel', autenticar, async (req, res) => {
    try {
        // Substitua as queries abaixo pelas suas consultas reais ao banco
        
        // Exemplo com MySQL/mysql2:
        // const [ativos] = await db.query('SELECT * FROM computadores');
        // const [eventos] = await db.query('SELECT * FROM eventos ORDER BY data DESC LIMIT 20');
 
        // Dados de exemplo (remova quando conectar ao banco)
        const totalAtivos = 4;
 
        const status = {
            online: 1,
            atencao: 2,
            critico: 1,
        };
 
        const setores = [
            { nome: 'DDS',   quantidade: 3 },
            { nome: 'IPI',   quantidade: 1 },
            { nome: 'CISCO', quantidade: 0 },
        ];
 
        const eventos = [
            { data: '2026-04-08 10:00:01', hostname: 'DESKTOP-A8OBPPL', disco: '27,5 GB Livre(s) de 110 GB', corClasse: 'atencao' },
            { data: '2026-04-08 09:08:12', hostname: 'DESKTOP-A8OBPPO', disco: '20,1 GB Livre(s) de 110 GB', corClasse: 'atencao' },
            { data: '2026-04-08 09:09:15', hostname: 'DESKTOP-A8OBPPA', disco: '54,2 GB Livre(s) de 110 GB', corClasse: 'ok'      },
            { data: '2026-04-08 09:10:15', hostname: 'DESKTOP-A8OBPPA', disco: '1,2 GB Livre(s) de 110 GB',  corClasse: 'critico' },
        ];
 
        res.render('tecnico/index', {
            usuario: req.session.usuario,
            totalAtivos,
            status,
            setores,
            eventos,
        });
 
    } catch (err) {
        console.error(err);
        res.render('erro', { mensagem: 'Erro ao carregar o painel.' });
    }
});