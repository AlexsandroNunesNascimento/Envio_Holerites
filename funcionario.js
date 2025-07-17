import { supabase } from './supabase.js';

const logoutBtn = document.getElementById('logout-btn-func');
const welcomeMessage = document.getElementById('welcome-message');
const holeritesList = document.getElementById('holerites-list');
const changePasswordBtn = document.getElementById('change-password-btn');
const passwordModal = document.getElementById('password-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const changePasswordForm = document.getElementById('change-password-form');

const formatarMesReferencia = (dataISO) => {
    if (!dataISO) return "Data Inválida";
    const [ano, mes] = dataISO.split('-');
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    if (mes < 1 || mes > 12) return "Data Inválida";
    return `${meses[parseInt(mes) - 1]} de ${ano}`;
};

holeritesList.addEventListener('click', async (event) => {
    if (event.target.classList.contains('download-link')) {
        const jaBaixou = event.target.dataset.baixado === 'true';

        if (!jaBaixou) {
            const holeriteId = event.target.dataset.holeriteId;
            event.target.dataset.baixado = 'true';
            supabase
                .from('holerites')
                .update({ data_download: new Date() })
                .eq('id', holeriteId)
                .then(({ error }) => {
                    if (error) {
                        console.error("Erro ao registrar download:", error);
                        event.target.dataset.baixado = 'false';
                    } else {
                        event.target.textContent = 'Baixar Novamente';
                        event.target.style.backgroundColor = 'var(--success-color, #28a745)';
                    }
                });
        }
    }
});

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
            // ==== MODIFICAÇÃO: ADICIONADO 'uploaded_at' NA CONSULTA ====
            supabase.from('holerites').select('id, mes_referencia, pdf_path, data_download, uploaded_at').eq('funcionario_id', funcionarioId).order('mes_referencia', { ascending: false })
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
            // Se o caminho do PDF for nulo, significa que já foi limpo pelo sistema
            if (!holerite.pdf_path) {
                const holeriteItem = document.createElement('div');
                holeriteItem.className = 'func-item';
                holeriteItem.innerHTML = `
                    <div class="func-info">
                        <p><span>Mês de Referência:</span> ${formatarMesReferencia(holerite.mes_referencia)}</p>
                        <p class="expiry-warning" style="font-size: 0.9em; color: #777; margin-top: 5px;">
                            O prazo para download online expirou. Caso precise deste documento, entre em contato com o escritório de contabilidade.
                        </p>
                    </div>
                    <div class="func-actions">
                         <a class="submit-btn" style="background-color: grey; cursor: not-allowed;" disabled>Expirado</a>
                    </div>
                `;
                holeritesList.appendChild(holeriteItem);
                continue; // Pula para o próximo item
            }
            
            // ==== INÍCIO DA NOVA LÓGICA DE AVISO DE EXPIRAÇÃO ====
            let expiryMessage = '';
            const uploadDate = new Date(holerite.uploaded_at);
            const expirationDate = new Date(new Date(uploadDate).setMonth(uploadDate.getMonth() + 6));
            const today = new Date();
            
            const diffTime = expirationDate.getTime() - today.getTime();
            const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
            
            if (diffDays > 0) {
                const formattedExpirationDate = expirationDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
                expiryMessage = `
                    <p class="expiry-warning" style="font-size: 0.9em; color: #d9534f; margin-top: 5px;">
                        <i class="fa-solid fa-triangle-exclamation"></i> 
                        Atenção: o arquivo será excluído em ${formattedExpirationDate} (faltam ${diffDays} dias).
                    </p>
                `;
            } 
            // ==== FIM DA NOVA LÓGICA ====

            const { data, error: urlError } = await supabase.storage.from('holerites').createSignedUrl(holerite.pdf_path, 300); // 5 minutos de validade para o link
            if (urlError) {
                console.error("Erro ao gerar URL para o PDF:", urlError);
                continue;
            }

            const holeriteItem = document.createElement('div');
            holeriteItem.className = 'func-item';

            const isDownloaded = !!holerite.data_download;
            const buttonText = isDownloaded ? 'Baixar Novamente' : 'Baixar PDF';
            const buttonColor = isDownloaded ? 'var(--success-color, #28a745)' : 'var(--primary-color, #007bff)';
            
            // ==== MODIFICAÇÃO: ADICIONADO expiryMessage NO HTML ====
            holeriteItem.innerHTML = `
                <div class="func-info">
                    <p><span>Mês de Referência:</span> ${formatarMesReferencia(holerite.mes_referencia)}</p>
                    ${expiryMessage}
                </div>
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

logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('funcionarioId');
    window.location.href = 'index.html';
});