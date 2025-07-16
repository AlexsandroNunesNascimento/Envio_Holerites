// funcionario.js
import { supabase } from './supabase.js';

// --- SELETORES DO DOM ---
const logoutBtn = document.getElementById('logout-btn-func');
const welcomeMessage = document.getElementById('welcome-message');
const holeritesList = document.getElementById('holerites-list');

// --- FUNÇÕES AUXILIARES ---
// Formata uma data no formato 'AAAA-MM-DD' para 'Mês de Ano' em português
const formatarMesReferencia = (dataISO) => {
    const [ano, mes] = dataISO.split('-');
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    return `${meses[parseInt(mes) - 1]} de ${ano}`;
};

// --- LÓGICA PRINCIPAL AO CARREGAR A PÁGINA ---
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar se o usuário está logado
    const funcionarioId = sessionStorage.getItem('funcionarioId');
    if (!funcionarioId) {
        alert('Acesso negado. Por favor, faça o login novamente.');
        window.location.href = 'index.html';
        return;
    }

    // 2. Buscar dados do usuário e do histórico de holerites em paralelo para mais eficiência
    try {
        const [funcionarioPromise, holeritesPromise] = await Promise.all([
            supabase.from('funcionario').select('nome').eq('id', funcionarioId).single(),
            supabase.from('holerites').select('mes_referencia, pdf_path').eq('funcionario_id', funcionarioId).order('mes_referencia', { ascending: false })
        ]);

        const { data: funcionario, error: funcError } = funcionarioPromise;
        const { data: listaHolerites, error: listError } = holeritesPromise;

        if (funcError || listError) {
            throw funcError || listError;
        }

        // 3. Atualizar a UI com os dados obtidos
        welcomeMessage.textContent = `Bem-vindo(a), ${funcionario.nome.split(' ')[0]}!`;
        
        if (listaHolerites.length === 0) {
            holeritesList.innerHTML = `<p>Nenhum holerite encontrado em seu histórico.</p>`;
            return;
        }

        holeritesList.innerHTML = ''; // Limpa a mensagem "Buscando..."

        // 4. Gerar os links de download para cada holerite
        for (const holerite of listaHolerites) {
            const { data, error: urlError } = await supabase.storage
                .from('holerites')
                .createSignedUrl(holerite.pdf_path, 300); // Gera um link válido por 5 minutos

            if (urlError) {
                console.error(`Erro ao gerar URL para ${holerite.pdf_path}:`, urlError);
                continue; // Pula este item se houver erro
            }

            const holeriteItem = document.createElement('div');
            holeriteItem.className = 'func-item';
            holeriteItem.innerHTML = `
                <div class="func-info">
                    <p><span>Mês de Referência:</span> ${formatarMesReferencia(holerite.mes_referencia)}</p>
                </div>
                <div class="func-actions">
                    <a href="${data.signedUrl}" download class="submit-btn">
                        Baixar PDF
                    </a>
                </div>
            `;
            holeritesList.appendChild(holeriteItem);
        }

    } catch (error) {
        holeritesList.innerHTML = `<p>Ocorreu um erro ao carregar seus dados. Tente fazer login novamente.</p>`;
        console.error('Erro ao carregar portal do funcionário:', error);
    }
});

// --- LÓGICA DE LOGOUT ---
logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('funcionarioId');
    alert("Saindo do portal...");
    window.location.href = 'index.html';
});