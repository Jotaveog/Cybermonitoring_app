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