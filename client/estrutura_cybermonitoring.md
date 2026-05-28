A partir do projeto completo fornecido (Troca_App), incluindo estrutura de pastas, código backend (Node.js), frontend (EJS), rotas, controllers, models e banco de dados, realize uma adaptação completa para um novo sistema denominado CYBERMONITORING.

O objetivo é transformar totalmente o sistema original (baseado em troca de produtos/itens) em um sistema de monitoramento de computadores em ambiente institucional (SENAI).

A adaptação deve manter a estrutura técnica do projeto (arquitetura MVC, organização de pastas, padrões de código), porém substituir completamente a lógica de negócio.

========================================
📌 CONTEXTO DO NOVO SISTEMA
========================================

O CYBERMONITORING é um sistema de apoio à gestão de TI, responsável por centralizar, organizar e apresentar dados de monitoramento de computadores provenientes de ferramentas externas.

O sistema NÃO realiza coleta direta, apenas consome dados de fontes externas (API, CSV, JSON ou banco intermediário).

========================================
🎯 OBJETIVO DO SISTEMA
========================================

Transformar dados técnicos em informações visuais e estratégicas por meio de:
- dashboards
- gráficos
- relatórios
- histórico de funcionamento

========================================
👥 USUÁRIOS
========================================

- Administrador de TI
- Técnico de suporte

========================================
⚙️ BANCO DE DADOS (OBRIGATÓRIO USAR)
========================================

O sistema deve ser adaptado para utilizar o seguinte modelo:

Tabelas:
- perfis
- usuarios
- ativos (CRUD principal)
- monitoramentos
- historico_status
- relatorios
- logs_sistema

Relacionamentos:
- usuarios → perfis
- monitoramentos → ativos
- historico_status → ativos
- relatorios → usuarios
- logs → usuarios

========================================
🔁 ADAPTAÇÕES OBRIGATÓRIAS NO CÓDIGO
========================================

1. ENTIDADES
Substituir:
- Produto / Item → Ativo (computador)
- Trocas → Monitoramentos

2. MODELS
Renomear e adaptar:
- produtoModel.js → ativoModel.js
- usuarioModel.js → ajustar para perfis

Criar:
- monitoramentoModel.js
- historicoModel.js (opcional)

3. CONTROLLERS
Renomear e adaptar:
- produtoController.js → ativoController.js

Criar:
- dashboardController.js
- monitoramentoController.js (opcional)

Remover qualquer lógica de troca/negociação.

4. ROTAS
Substituir rotas antigas por:

/auth/login
/auth/cadastro

/ativos
/ativos/:id

/dashboard/admin
/dashboard/tecnico

/monitoramentos
/integracao/sincronizar

5. LÓGICA DE NEGÓCIO
Remover:
- troca de itens
- negociação
- ofertas

Implementar:
- status do ativo (NORMAL, ATENCAO, CRITICO)
- filtros por setor, período e status
- visualização de histórico

6. AUTENTICAÇÃO
Após login:
- verificar id_perfil

Se:
- Administrador → dashboard admin
- Técnico → dashboard técnico

========================================
🎨 ADAPTAÇÃO DO FRONTEND (EJS)
========================================

Substituir completamente:

Telas antigas:
- produtos
- trocas

Novas telas:

auth/
- login.ejs
- cadastro.ejs

dashboard/
- admin.ejs
- tecnico.ejs

ativos/
- listar.ejs
- cadastrar.ejs
- editar.ejs
- detalhes.ejs

Funcionalidades:
- listar ativos
- visualizar status com cores
- exibir histórico
- filtros
- gráficos simples

========================================
📊 REGRAS DE NEGÓCIO
========================================

- Um ativo deve possuir identificador único
- Não permitir duplicidade de ativos
- Status deve seguir critérios:
  NORMAL / ATENCAO / CRITICO
- Apenas admin pode gerenciar usuários
- Técnico apenas consulta e analisa

========================================
⚠️ IMPORTANTE
========================================

- NÃO apenas trocar nomes (produto → ativo)
- Adaptar a lógica real do sistema
- Remover completamente qualquer vestígio de “troca de itens”
- Garantir coerência com sistema de monitoramento
- Código deve continuar funcional
- Manter padrão MVC

========================================
📦 SAÍDA ESPERADA
========================================

- Código totalmente adaptado
- Novas entidades funcionando
- Rotas atualizadas
- Views EJS adaptadas
- Integração com banco correta
- Explicação das principais mudanças realizadas

O resultado deve parecer um sistema original de monitoramento de TI, e não uma adaptação superficial do Troca_App.