// Garante que o código só vai rodar após o HTML estar totalmente carregado
document.addEventListener("DOMContentLoaded", () => {
    // Captura os elementos do HTML que criamos na caixa do projeto bônus
    const uploadInput = document.getElementById("upload-png");
    const statusConversao = document.getElementById("status-conversao");
    const btnBaixarPdf = document.getElementById("btn-baixar-pdf");

    // Variável global temporária para armazenar a imagem carregada
    let imagemCarregadaBase64 = null;
    let nomeArquivoOriginal = "documento";

    // 1. Escuta quando o usuário seleciona um arquivo
    uploadInput.addEventListener("change", (evento) => {
        const arquivo = evento.target.files[0];

        // Verifica se o arquivo realmente existe e se é um PNG
        if (!arquivo) {
            return;
        }

        if (arquivo.type !== "image/png") {
            statusConversao.textContent = "❌ Por favor, selecione apenas arquivos no formato .png";
            statusConversao.style.color = "#dc3545";
            btnBaixarPdf.style.display = "none";
            return;
        }

        // Guarda o nome do arquivo original (tirando a extensão) para usar no PDF final
        nomeArquivoOriginal = arquivo.name.replace(/\.[^/.]+$/, "");

        // Atualiza a interface informando que o arquivo está sendo processado
        statusConversao.textContent = `🔄 Processando: ${arquivo.name}...`;
        statusConversao.style.color = "#666";

        // Usa o FileReader para ler a imagem e transformar em uma String Base64
        const reader = new FileReader();
        
        reader.onload = (e) => {
            imagemCarregadaBase64 = e.target.result;
            
            // Atualiza o status indicando sucesso e exibe o botão de download
            statusConversao.textContent = `✅ "${arquivo.name}" pronto para conversão!`;
            statusConversao.style.color = "#28a745";
            btnBaixarPdf.style.display = "inline-block";
        };

        reader.onerror = () => {
            statusConversao.textContent = "❌ Erro ao ler a imagem. Tente novamente.";
            statusConversao.style.color = "#dc3545";
        };

        // Executa a leitura do arquivo como URL de dados (Base64)
        reader.readAsDataURL(arquivo);
    });

    // 2. Escuta o clique no botão de baixar o PDF gerado
    btnBaixarPdf.addEventListener("click", () => {
        if (!imagemCarregadaBase64) {
            alert("Nenhuma imagem foi carregada.");
            return;
        }

        // Acessa o construtor da biblioteca jsPDF que importamos via CDN
        const { jsPDF } = window.jspdf;
        
        // Cria um documento PDF no formato padrão (A4, orientação Retrato 'p', unidade de medida em milímetros 'mm')
        const doc = new jsPDF('p', 'mm', 'a4');

        // Cria um objeto de imagem em segundo plano para capturar a largura e altura reais da imagem
        const img = new Image();
        img.src = imagemCarregadaBase64;

        img.onload = () => {
            // Dimensões de uma folha A4 em milímetros
            const larguraA4 = 210;
            const alturaA4 = 297;
            const margem = 10; // Margem interna de segurança de 10mm

            // Calcula a área máxima disponível para a imagem dentro da folha
            const larguraMax = larguraA4 - (margem * 2);
            const alturaMax = alturaA4 - (margem * 2);

            // Mantém a proporção original da imagem para ela não ficar esticada ou achatada
            let larguraFinal = larguraMax;
            let alturaFinal = (img.height * larguraMax) / img.width;

            // Se mesmo ajustando pela largura a altura passar do limite do A4, ajusta pela altura máxima
            if (alturaFinal > alturaMax) {
                alturaFinal = alturaMax;
                larguraFinal = (img.width * alturaMax) / img.height;
            }

            // Centraliza a imagem na folha caso ela fique menor que a área total disponível
            const posX = margem + (larguraMax - larguraFinal) / 2;
            const posY = margem + (alturaMax - alturaFinal) / 2;

            // Adiciona a imagem tratada ao documento PDF
            doc.addImage(imagemCarregadaBase64, 'PNG', posX, posY, larguraFinal, alturaFinal);

            // Executa o download salvando com o mesmo nome do arquivo original
            doc.save(`${nomeArquivoOriginal}.pdf`);
        };
    });
});