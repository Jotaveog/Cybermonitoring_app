document.addEventListener('DOMContentLoaded', () => {

    const inputFoto = document.getElementById('foto') 
    const previewBox = document.getElementById('preview-box') 
    const previewImg = document.getElementById('preview-img') 

    if(inputFoto && previewBox && previewImg){
        if(!previewImg.getAttribute('src') || previewImg.getAttribute('src') === "..." || previewImg.getAttribute('src') === ""){
            previewImg.src = '/img/sem-foto.png'
            previewBox.style.display = 'block'
        }
        // Seleciona uma imagem
        inputFoto.addEventListener('change', function(evento) {
            // Guarda as informações da imagem
            const arquivo = evento.target.files[0]

            // Se tiver um arquivo silecionado
            if(arquivo){
                // Usa o filerador para o navegador ler arquivos do PC
                const leitorDeArquivo = new FileReader()

                // Quando a imagem for carregada na memória, substitui o sem foto para a imagem selecionada
                leitorDeArquivo.onload = function(e){
                    previewImg.src = e.target.result
                    previewBox.style.display = 'block'
                }
                // Converte a imagem para Base64 para o html ler a imagem como texto
                leitorDeArquivo.readAsDataURL(arquivo)
            }
            // Se cancelar o envio, volta a foto padrão
            else{
                previewImg.src = '/img/sem-foto.png'
                previewBox.style.display = 'block'
            }
        })
    }
})

// Dashboard pie rendering
document.addEventListener('DOMContentLoaded', () => {
    const pie = document.getElementById('dashboardPie')
    if(!pie) return

    const good = Number(pie.dataset.good || 0)
    const warn = Number(pie.dataset.warning || 0)
    const crit = Number(pie.dataset.critical || 0)
    const total = good + warn + crit || 1

    const pGood = Math.round((good / total) * 100)
    const pWarn = Math.round((warn / total) * 100)
    const pCrit = 100 - pGood - pWarn

    pie.style.background = `conic-gradient(#f2e76b 0 ${pGood}%, #2ecc71 ${pGood}% ${pGood + pWarn}%, #e74c3c ${pGood + pWarn}% 100%)`

    // Atualiza contadores (se existirem)
    const gEl = document.getElementById('countGood')
    const wEl = document.getElementById('countWarn')
    const cEl = document.getElementById('countCrit')
    if(gEl) gEl.textContent = good
    if(wEl) wEl.textContent = warn
    if(cEl) cEl.textContent = crit
})

// Logout handler
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.querySelector('.logout')
    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault()
            fetch('/usuarios/logout')
                .then(() => window.location.href = '/login')
                .catch(err => console.error('Erro:', err))
        })
    }
})

// Gerenciar Ativos (CRUD) - conecta a UI com as rotas /ativos
document.addEventListener('DOMContentLoaded', () => {
    // Detecta se estamos na página de gerenciar computadores
    const form = document.getElementById('formAativo')
    const tableBody = document.querySelector('.card-list table tbody')
    const filterSetor = document.getElementById('filterSetor')
    const filterStatus = document.getElementById('filterStatus')

    if (!form || !tableBody) return

    let editId = null

    async function loadAtivos() {
        try {
            const res = await fetch('/ativos')
            const json = await res.json()
            if (!json.sucesso) throw new Error(json.mensagem || 'Erro ao carregar')

            renderTable(json.dados || [])
        } catch (err) {
            console.error('Erro ao carregar ativos:', err)
            tableBody.innerHTML = '<tr><td colspan="6">Erro ao carregar ativos</td></tr>'
        }
    }

    function renderTable(ativos) {
        // Aplicar filtros
        const setor = filterSetor ? filterSetor.value : ''
        const status = filterStatus ? filterStatus.value : ''

        const rows = ativos.filter(a => {
            if (setor && a.setor !== setor) return false
            if (status) {
                const s = (a.status_cadastro || '').toLowerCase()
                if (status === 'ativo' && s !== 'ativo') return false
                if (status === 'inativo' && s !== 'inativo') return false
            }
            return true
        }).map(a => {
            return `
                <tr data-id="${a.id_ativo}">
                    <td>${a.id_ativo || a.nome_maquina}</td>
                    <td>${a.nome_maquina || ''}<br><small>${a.ip || ''}</small></td>
                    <td>${a.mac || a.mac_address || ''}</td>
                    <td>${a.setor || ''}</td>
                    <td>${a.so || ''}</td>
                    <td>
                        <button class="btn btn-sm btn-warning btn-edit">Editar</button>
                        <button class="btn btn-sm btn-danger btn-delete">Apagar</button>
                    </td>
                </tr>
            `
        }).join('')

        tableBody.innerHTML = rows || '<tr><td colspan="6" class="text-center">Nenhum ativo encontrado</td></tr>'

        // Bind actions
        tableBody.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const tr = e.target.closest('tr')
                const id = tr.dataset.id
                if (!confirm('Confirmar exclusão do ativo?')) return
                try {
                    const resp = await fetch('/ativos/' + id, { method: 'DELETE' })
                    const j = await resp.json()
                    if (!j.sucesso) throw new Error(j.mensagem || 'Erro')
                    loadAtivos()
                } catch (err) {
                    console.error('Erro ao deletar ativo:', err)
                    alert('Erro ao deletar ativo')
                }
            })
        })

        tableBody.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const tr = e.target.closest('tr')
                const id = tr.dataset.id
                try {
                    const resp = await fetch('/ativos/' + id)
                    const j = await resp.json()
                    if (!j.sucesso) throw new Error(j.mensagem || 'Erro')
                    populateForm(j.dados)
                } catch (err) {
                    console.error('Erro ao obter ativo:', err)
                    alert('Erro ao obter ativo para edição')
                }
            })
        })
    }

    function populateForm(a) {
        editId = a.id_ativo
        form.querySelector('[name="ip"]').value = a.ip || ''
        form.querySelector('[name="nomeMaquina"]').value = a.nome_maquina || ''
        form.querySelector('[name="setor"]').value = a.setor || ''
        form.querySelector('[name="laboratorio"]').value = a.tipo || ''
        form.querySelector('[name="so"]').value = a.so || ''
        form.querySelector('[name="observacoes"]').value = a.descricao || ''
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        const data = new FormData(form)
        const payload = {
            nome_maquina: data.get('nomeMaquina'),
            ip: data.get('ip'),
            setor: data.get('setor'),
            tipo: data.get('laboratorio') || data.get('patrimonio') || null,
            so: data.get('so'),
            descricao: data.get('observacoes')
        }

        try {
            let resp
            if (editId) {
                resp = await fetch('/ativos/' + editId, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            } else {
                resp = await fetch('/ativos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            }

            const j = await resp.json()
            if (!j.sucesso) throw new Error(j.mensagem || 'Erro')
            // reset form
            editId = null
            form.reset()
            loadAtivos()
            alert(j.mensagem || 'Operação realizada com sucesso')
        } catch (err) {
            console.error('Erro ao salvar ativo:', err)
            alert('Erro ao salvar ativo')
        }
    })

    // filtros
    if (filterSetor) filterSetor.addEventListener('change', loadAtivos)
    if (filterStatus) filterStatus.addEventListener('change', loadAtivos)

    // inicial
    loadAtivos()
})

// --- Gerenciar Usuários (básico) ---
document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('userForm')
    const usersTable = document.getElementById('usersTable')

    if (!userForm) return

    window.clearUserForm = function() {
        userForm.reset()
    }

    window.saveUser = async function(e) {
        e.preventDefault()
        const nome = document.getElementById('userNameInput').value.trim()
        const email = document.getElementById('userEmailInput').value.trim()
        const senha = document.getElementById('userPasswordInput').value || ''
        const role = document.getElementById('userRoleSelect').value

        if (!nome || !email) {
            alert('Nome e email são obrigatórios')
            return
        }

        try {
            const fd = new FormData()
            fd.append('nome', nome)
            fd.append('email', email)
            fd.append('senha', senha)
            // mapping basic role to perfil id if needed
            fd.append('id_perfil', role === 'admin' ? '1' : '2')

            const res = await fetch('/usuarios/cadastrar', { method: 'POST', body: fd })
            if (res.ok) return window.location.reload()
            const txt = await res.text()
            console.error('Erro salvar usuário', res.status, txt)
            alert('Erro ao salvar usuário')
        } catch (err) {
            console.error(err)
            alert('Erro ao salvar usuário')
        }
    }

    // optional: attempt to populate usersTable if an API exists
    async function loadUsers() {
        if (!usersTable) return
        try {
            const r = await fetch('/api/usuarios')
            if (!r.ok) return
            const j = await r.json()
            const rows = (j.usuarios || []).map(u => `
                <tr data-id="${u.id_usuario}">
                    <td>${u.nome}</td>
                    <td>${u.email}</td>
                    <td>${u.nome_perfil || ''}</td>
                    <td>${u.status || ''}</td>
                    <td style="text-align:center">
                        <a href="/usuarios/${u.id_usuario}/editar" class="btn btn-sm btn-warning">Editar</a>
                    </td>
                </tr>
            `).join('')
            usersTable.querySelector('tbody').innerHTML = rows || '<tr><td colspan="5" class="text-center">Nenhum usuário</td></tr>'
        } catch (_) {
            // ignore
        }
    }

    loadUsers()
})

// Relatórios Admin - renderização e exportação de dados
function fillSetorOptions() {
    const select = document.getElementById('reportSetor')
    if (!select || !Array.isArray(window.reportSetores)) return

    const existing = Array.from(select.options).map(opt => opt.value)
    window.reportSetores.forEach(setor => {
        if (!setor || existing.includes(setor.nome)) return
        const option = document.createElement('option')
        option.value = setor.nome
        option.textContent = setor.nome
        select.appendChild(option)
    })
}

function renderReport() {
    const setor = document.getElementById('reportSetor')?.value || ''
    const status = document.getElementById('reportStatus')?.value || ''
    const query = (document.getElementById('searchReport')?.value || '').toLowerCase()
    const tbody = document.querySelector('#reportTable tbody')
    if (!tbody) return

    const rows = Array.from(tbody.querySelectorAll('tr')).filter(row => row.dataset.fallback !== 'true')
    let visibleCount = 0

    rows.forEach(row => {
        const rowSetor = (row.dataset.setor || '').toLowerCase()
        const rowStatus = (row.dataset.status || '').toLowerCase()
        const rowNome = (row.dataset.nome || '').toLowerCase()
        const rowIp = (row.dataset.ip || '').toLowerCase()

        const matchesSetor = !setor || rowSetor === setor.toLowerCase()
        const matchesStatus = !status || rowStatus === status.toLowerCase()
        const matchesQuery = !query || rowNome.includes(query) || rowIp.includes(query)

        const visible = matchesSetor && matchesStatus && matchesQuery
        row.style.display = visible ? '' : 'none'
        if (visible) visibleCount++
    })

    let fallbackRow = tbody.querySelector('tr[data-fallback="true"]')
    if (!fallbackRow) {
        fallbackRow = document.createElement('tr')
        fallbackRow.dataset.fallback = 'true'
        fallbackRow.innerHTML = '<td colspan="7" style="text-align:center; color:#999;">Nenhum ativo encontrado</td>'
        tbody.appendChild(fallbackRow)
    }

    fallbackRow.style.display = visibleCount === 0 ? '' : 'none'
}

function renderHistory() {
    const search = (document.getElementById('historySearch')?.value || '').toLowerCase()
    const start = document.getElementById('historyDateStart')?.value
    const end = document.getElementById('historyDateEnd')?.value
    const tbody = document.querySelector('#historyTable tbody')
    if (!tbody) return

    const rows = Array.from(tbody.querySelectorAll('tr')).filter(row => row.dataset.fallback !== 'true')
    let visibleCount = 0

    rows.forEach(row => {
        const rowAtivo = (row.dataset.ativo || '').toLowerCase()
        const rowData = row.dataset.data || ''

        const matchesText = !search || rowAtivo.includes(search)
        const matchesStart = !start || rowData >= start
        const matchesEnd = !end || rowData <= end

        const visible = matchesText && matchesStart && matchesEnd
        row.style.display = visible ? '' : 'none'
        if (visible) visibleCount++
    })

    let fallbackRow = tbody.querySelector('tr[data-fallback="true"]')
    if (!fallbackRow) {
        fallbackRow = document.createElement('tr')
        fallbackRow.dataset.fallback = 'true'
        fallbackRow.innerHTML = '<td colspan="5" style="text-align:center; color:#999;">Nenhum evento encontrado</td>'
        tbody.appendChild(fallbackRow)
    }
    fallbackRow.style.display = visibleCount === 0 ? '' : 'none'
}

function exportHTMLTableAsCSV(tableId, filename) {
    const table = document.getElementById(tableId)
    if (!table) return

    const rows = Array.from(table.querySelectorAll('tbody tr'))
        .filter(row => row.style.display !== 'none' && row.dataset.fallback !== 'true')

    if (!rows.length) {
        alert('Nenhum registro disponível para exportar.')
        return
    }

    const csv = [
        Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim()).join(','),
        ...rows.map(row => Array.from(row.querySelectorAll('td')).map(cell => `"${cell.textContent.trim().replace(/"/g, '""')}"`).join(','))
    ].join('\r\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
}

function exportTableToPDF(tableId, title) {
    const table = document.getElementById(tableId)
    if (!table) return

    const clone = table.cloneNode(true)
    clone.querySelectorAll('tr').forEach(row => {
        if (row.style.display === 'none' || row.dataset.fallback === 'true') {
            row.remove()
        }
    })

    const html = `
        <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                    th { background: #f4f4f4; }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                ${clone.outerHTML}
            </body>
        </html>`

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
        alert('Não foi possível abrir a janela de impressão. Verifique as configurações do navegador.')
        return
    }
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 500)
}

function exportWord() {
    const table = document.getElementById('reportTable')
    if (!table) return

    const clone = table.cloneNode(true)
    clone.querySelectorAll('tr').forEach(row => {
        if (row.style.display === 'none' || row.dataset.fallback === 'true') {
            row.remove()
        }
    })

    const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="utf-8">
                <title>Relatório de Ativos</title>
            </head>
            <body>
                <h1>Relatório de Ativos</h1>
                ${clone.outerHTML}
            </body>
        </html>`

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'relatorio_ativos.doc'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
}

function printReport() {
    window.print()
}

function exportPDF() {
    exportTableToPDF('reportTable', 'Relatório de Ativos')
}

function exportExcel() {
    exportHTMLTableAsCSV('reportTable', 'relatorio_ativos.csv')
}

function exportHistoryPDF() {
    exportTableToPDF('historyTable', 'Histórico de Eventos')
}

function exportHistoryExcel() {
    exportHTMLTableAsCSV('historyTable', 'historico_eventos.csv')
}

async function clearHistory() {
    if (!confirm('Deseja limpar todo o histórico de eventos? Esta ação não pode ser desfeita.')) return

    try {
        const res = await fetch('/admin/relatorios/limpar-historico', { method: 'POST' })
        const json = await res.json()
        if (!json.sucesso) throw new Error(json.mensagem || 'Erro ao limpar histórico')
        window.location.reload()
    } catch (erro) {
        console.error('Erro ao limpar histórico:', erro)
        alert('Não foi possível limpar o histórico.')
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const reportsSection = document.getElementById('reportsSection')
    if (!reportsSection) return

    fillSetorOptions()
    renderReport()
    renderHistory()

    document.getElementById('reportSetor')?.addEventListener('change', renderReport)
    document.getElementById('reportStatus')?.addEventListener('change', renderReport)
    document.getElementById('searchReport')?.addEventListener('input', renderReport)
    document.getElementById('historySearch')?.addEventListener('input', renderHistory)
    document.getElementById('historyDateStart')?.addEventListener('change', renderHistory)
    document.getElementById('historyDateEnd')?.addEventListener('change', renderHistory)
})