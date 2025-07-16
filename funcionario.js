// funcionario.js
import { supabase } from './supabase.js';

// --- SELETORES DO DOM ---
const logoutBtn = document.getElementById('logout-btn-func');
const welcomeMessage = document.getElementById('welcome-message');
const holeritesList = document.getElementById('holerites-list');
const changePasswordBtn = document.getElementById('change-password-btn');
const passwordModal = document.getElementById('password-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const changePasswordForm = document.getElementById('change-password-form');

// --- FUNÇÕES AUXILIARES ---
const formatarMesReferencia = (dataISO) => {
    // Adicionado tratamento de erro para datas inválidas
    if (!dataISO) return "Data Inválida";
    const [ano, mes] = dataISO.split('-');
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    // Adicionado tratamento de erro para mês inválido
    if (mes < 1 || mes > 12) return "Data Inválida";
    return `${meses[parseInt(mes) - 1]} de ${ano}`;
};

// --- LÓGICA DE RASTREAMENTO DE DOWNLOAD ---
holeritesList.addEventListener('click', async (event) => {
    // A lógica só roda se o elemento clicado tiver a classe 'download-link'
    if (event.target.classList.contains('download-link')) {
        const jaBaixou = event.target.dataset.baixado === 'true';

        // O registro no banco só acontece se o atributo 'data-baixado' for falso
        if (!jaBaixou) {
            const holeriteId = event.target.dataset.holeriteId;
            // Marca imediatamente o atributo no HTML para evitar cliques duplicados
            event.target.dataset.baixado = 'true'; 

            // Atualiza a data_download no banco de dados
            supabase
                .from('holerites')
                .update({ data_download: new Date() })
                .eq('id', holeriteId)
                .then(({ error }) => {
                    if (error) {
                        console.error("Erro ao registrar download:", error);
                        // Se houver um erro, permite que o usuário tente novamente
                        event.target.dataset.baixado = 'false';
                    } else {
                        // Se for bem-sucedido, muda o texto e a cor do botão permanentemente (nesta sessão)
                        event.target.textContent = 'Baixar Novamente';
                        event.target.style.backgroundColor = 'var(--success-color, #28a745)';
                    }
                });
        }
    }
});

// --- LÓGICA PRINCIPAL AO CARREGAR A PÁGINA ---
document.addEventListener('DOMContentLoaded', async () => {
    const funcionarioId = sessionStorage.getItem('funcionarioId');
    if (!funcionarioId) {
        alert('Acesso negado. Por favor, faça o login novamente.');
        window.location.href = 'index.html';
        return;
    }

    try {
        const [funcionarioPromise, holeritesPromise] = await Promise.all([
            supabase.from('funcionario').select('nome').eq('id', funcionarioId).single(),
            supabase.from('holerites').select('id, mes_referencia, pdf_path, data_download').eq('funcionario_id', funcionarioId).order('mes_referencia', { ascending: false })
        ]);

        const { data: funcionario, error: funcError } = funcionarioPromise;
        const { data: listaHolerites, error: listError } = holeritesPromise;

        if (funcError || listError) {
            throw funcError || listError;
        }

        welcomeMessage.textContent = `Bem-vindo(a), ${funcionario.nome.split(' ')[0]}!`;
        
        if (listaHolerites.length === 0) {
            holeritesList.innerHTML = `<p>Nenhum holerite encontrado em seu histórico.</p>`;
            return;
        }

        holeritesList.innerHTML = '';

        for (const holerite of listaHolerites) {
            const { data, error: urlError } = await supabase.storage.from('holerites').createSignedUrl(holerite.pdf_path, 300); // Link válido por 5 minutos
            if (urlError) {
                console.error("Erro ao gerar URL para o PDF:", urlError);
                continue; // Pula para o próximo item
            }
            
            const holeriteItem = document.createElement('div');
            holeriteItem.className = 'func-item';

            const isDownloaded = !!holerite.data_download;
            const buttonText = isDownloaded ? 'Baixar Novamente' : 'Baixar PDF';
            const buttonColor = isDownloaded ? 'var(--success-color, #28a745)' : 'var(--primary-color, #007bff)';
            
            holeriteItem.innerHTML = `
                <div class="func-info"><p><span>Mês de Referência:</span> ${formatarMesReferencia(holerite.mes_referencia)}</p></div>
                <div class="func-actions">
                    <a href="${data.signedUrl}" download 
                       class="submit-btn download-link"
                       data-holerite-id="${holerite.id}"
                       data-baixado="${isDownloaded}"
                       style="background-color: ${buttonColor};">
                       ${buttonText}
                    </a>
                </div>
            `;
            holeritesList.appendChild(holeriteItem);
        }
    } catch (error) {
        console.error('Erro ao carregar o portal do funcionário:', error);
        holeritesList.innerHTML = `<p>Ocorreu um erro ao carregar seus dados. Por favor, tente novamente.</p>`;
    }
});

// --- LÓGICA DO MODAL DE SENHA ---
const closeModal = () => {
    passwordModal.style.display = 'none';
    changePasswordForm.reset();
};
changePasswordBtn.addEventListener('click', () => {
    passwordModal.style.display = 'block';
});
closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', (event) => {
    if (event.target == passwordModal) {
        closeModal();
    }
});

changePasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const submitButton = changePasswordForm.querySelector('button[type="submit"]');

    if (newPassword !== confirmPassword) {
        alert('As senhas não coincidem. Por favor, verifique.');
        return;
    }
    if (newPassword.length < 6) {
        alert('A nova senha precisa ter no mínimo 6 caracteres.');
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Salvando...';

    try {
        const funcionarioId = sessionStorage.getItem('funcionarioId');
        if (!funcionarioId) throw new Error("Sessão inválida. Por favor, faça o login novamente.");
        
        const { data: user, error: fetchError } = await supabase.from('funcionario').select('senha').eq('id', funcionarioId).single();
        if (fetchError) throw fetchError;
        if (user.senha !== currentPassword) throw new Error("A senha atual está incorreta.");
        
        const { error: updateError } = await supabase.from('funcionario').update({ senha: newPassword }).eq('id', funcionarioId);
        if (updateError) throw updateError;
        
        alert("Senha alterada com sucesso!");
        closeModal();
    } catch (error) {
        alert(`Erro ao alterar senha: ${error.message}`);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Salvar Nova Senha';
    }
});

// --- LÓGICA DE LOGOUT ---
logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('funcionarioId');
    window.location.href = 'index.html';
});