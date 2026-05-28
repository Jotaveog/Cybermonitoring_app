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