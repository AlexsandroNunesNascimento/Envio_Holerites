import { supabase } from './supabase.js';

const logoutBtn = document.getElementById('logout-btn');
const sideMenuButtons = document.querySelectorAll('.side-menu button');
const contentSections = document.querySelectorAll('.content-section');
const cadastroForm = document.getElementById('cadastro-form');
const searchNomeInput = document.getElementById('search-nome');
const searchLojaInput = document.getElementById('search-loja');
const resultList = document.getElementById('result-list');
const noResultsMessage = document.getElementById('no-results');
const editModal = document.getElementById('edit-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const editForm = document.getElementById('edit-form');
const holeriteUploadForm = document.getElementById('holerite-upload-form');
const holeriteLojaSelect = document.getElementById('holerite-loja-select');
const holeriteFuncSelect = document.getElementById('holerite-func-select');
const reportLojaSelect = document.getElementById('report-loja-select');
const reportMesSelect = document.getElementById('report-mes-select');
const generateReportBtn = document.getElementById('generate-report-btn');
const reportActionsDiv = document.getElementById('report-actions');
const printReportBtn = document.getElementById('print-report-btn');
const reportOutput = document.getElementById('report-output');

let allFuncionarios = [];

const showSection = (targetId) => {
    contentSections.forEach(section => {
        section.classList.toggle('active', section.id === targetId);
    });
};

const populateLojaFilters = async () => {
    if (allFuncionarios.length > 0) return;
    const { data, error } = await supabase.from('funcionario').select('id, nome, loja').order('nome');
    if (error) {
        console.error("Erro ao buscar funcionários para os filtros:", error);
        return;
    }
    allFuncionarios = data;
    const lojas = [...new Set(allFuncionarios.map(f => f.loja))].sort();
    holeriteLojaSelect.innerHTML = '<option value="">Todas as Lojas</option>';
    reportLojaSelect.innerHTML = '<option value="" disabled selected>Selecione uma loja...</option>';

    lojas.forEach(loja => {
        holeriteLojaSelect.innerHTML += `<option value="${loja}">${loja}</option>`;
        reportLojaSelect.innerHTML += `<option value="${loja}">${loja}</option>`;
    });
};

sideMenuButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetSectionId = button.getAttribute('data-target');
        showSection(targetSectionId);
        if (targetSectionId === 'consulta-section') fetchAndDisplayFuncionarios();
        if (targetSectionId === 'holerite-section' || targetSectionId === 'report-section') populateLojaFilters();
    });
});

holeriteLojaSelect.addEventListener('change', () => {
    const selectedLoja = holeriteLojaSelect.value;
    const filteredFuncionarios = selectedLoja ? allFuncionarios.filter(f => f.loja === selectedLoja) : allFuncionarios;
    holeriteFuncSelect.innerHTML = '<option value="" disabled selected>-- Escolha um funcionário --</option>';
    filteredFuncionarios.forEach(func => {
        holeriteFuncSelect.innerHTML += `<option value="${func.id}">${func.nome}</option>`;
    });
});

cadastroForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const { error } = await supabase.from('funcionario').insert([{
        nome: document.getElementById('func-nome').value,
        cpf: document.getElementById('func-cpf').value,
        loja: document.getElementById('func-loja').value,
        senha: document.getElementById('func-senha').value
    }]);

    if (error) {
        alert(error.code === '23505' ? 'Erro: O CPF informado já está cadastrado.' : `Erro: ${error.message}`);
    } else {
        alert('Funcionário cadastrado com sucesso!');
        cadastroForm.reset();
        allFuncionarios = []; 
    }
});

const fetchAndDisplayFuncionarios = async () => {
    let query = supabase.from('funcionario').select('*').order('nome', { ascending: true });
    if (searchNomeInput.value) query = query.ilike('nome', `%${searchNomeInput.value}%`);
    if (searchLojaInput.value) query = query.ilike('loja', `%${searchLojaInput.value}%`);

    const { data, error } = await query;
    if (error) { console.error('Erro ao buscar funcionários:', error); return; }

    resultList.innerHTML = '';
    noResultsMessage.style.display = data.length === 0 ? 'block' : 'none';

    data.forEach(func => {
        const item = document.createElement('div');
        item.className = 'func-item';
        item.innerHTML = `<div class="func-info"><p><span>Nome:</span> ${func.nome}</p><p><span>CPF:</span> ${func.cpf}</p><p><span>Loja:</span> ${func.loja}</p></div><div class="func-actions"><button class="edit-btn" data-id="${func.id}">Editar</button><button class="delete-btn" data-id="${func.id}">Excluir</button></div>`;
        resultList.appendChild(item);
    });
};

searchNomeInput.addEventListener('keyup', fetchAndDisplayFuncionarios);
searchLojaInput.addEventListener('keyup', fetchAndDisplayFuncionarios);

resultList.addEventListener('click', async (event) => {
    const target = event.target;
    const id = target.getAttribute('data-id');
    if (!id) return;

    if (target.classList.contains('delete-btn')) {
        if (confirm('Tem certeza que deseja excluir este funcionário?')) {
            const { error } = await supabase.from('funcionario').delete().eq('id', id);
            if (error) { alert(`Erro ao excluir: ${error.message}`); } else { alert('Funcionário excluído.'); fetchAndDisplayFuncionarios(); allFuncionarios = []; }
        }
    } else if (target.classList.contains('edit-btn')) {
        const { data, error } = await supabase.from('funcionario').select('*').eq('id', id).single();
        if (error) { alert(`Erro ao carregar dados: ${error.message}`); return; }
        document.getElementById('edit-id').value = data.id;
        document.getElementById('edit-nome').value = data.nome;
        document.getElementById('edit-cpf').value = data.cpf;
        document.getElementById('edit-loja').value = data.loja;
        document.getElementById('edit-senha').value = '';
        editModal.style.display = 'block';
    }
});

closeModalBtn.addEventListener('click', () => editModal.style.display = 'none');
window.addEventListener('click', (event) => { if (event.target == editModal) editModal.style.display = 'none'; });

editForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = document.getElementById('edit-id').value;
    let dadosParaAtualizar = { nome: document.getElementById('edit-nome').value, loja: document.getElementById('edit-loja').value };
    if (document.getElementById('edit-senha').value) {
        dadosParaAtualizar.senha = document.getElementById('edit-senha').value;
    }
    const { error } = await supabase.from('funcionario').update(dadosParaAtualizar).eq('id', id);
    if (error) { alert(`Erro ao atualizar: ${error.message}`); } else { alert('Funcionário atualizado!'); editModal.style.display = 'none'; fetchAndDisplayFuncionarios(); allFuncionarios = []; }
});

holeriteUploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const funcionarioId = holeriteFuncSelect.value;
    const mesReferenciaInput = document.getElementById('holerite-mes'); 
    const pdfFile = document.getElementById('holerite-pdf-file').files[0];
    const submitButton = holeriteUploadForm.querySelector('button[type="submit"]');
    if (!funcionarioId || !mesReferenciaInput.value || !pdfFile) {
        alert("Preencha todos os campos.");
        return;
    }

    const mesReferencia = mesReferenciaInput.value + '-01'; 

    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

    try {
        const filePath = `${funcionarioId}/holerite_${mesReferencia.slice(0, 7)}_${Date.now()}.pdf`;
        const { error: uploadError } = await supabase.storage.from('holerites').upload(filePath, pdfFile);
        if (uploadError) throw uploadError;
        
        const { error: insertError } = await supabase.from('holerites').insert({
            funcionario_id: funcionarioId,
            mes_referencia: mesReferencia,
            pdf_path: filePath
        });
        if (insertError) throw insertError;

        alert('Holerite enviado com sucesso!');
        holeriteUploadForm.reset();
        holeriteLojaSelect.value = "";
    } catch (error) {
        alert(`Erro: ${error.message}`);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Enviar Holerite';
    }
});

const formatarMesReferencia = (dataISO) => {
    const data = new Date(dataISO);
    return `${data.toLocaleString('pt-BR', { month: 'long', timeZone: 'UTC' })} de ${data.getUTCFullYear()}`;
};

const formatarStatusDownload = (dataISO) => {
    return dataISO ? `<span style="color: var(--success-color, #28a745); font-weight: bold;">Baixado</span> (${new Date(dataISO).toLocaleDateString('pt-BR')})` : '<span style="color: #f39c12; font-weight: bold;">Pendente</span>';
};

generateReportBtn.addEventListener('click', async () => {
    const loja = reportLojaSelect.value;
    if (!loja) { alert("Selecione uma loja para o relatório."); return; }
    
    generateReportBtn.disabled = true;
    generateReportBtn.textContent = 'Gerando...';
    reportOutput.innerHTML = '<p>Buscando dados, por favor, aguarde...</p>';

    let query = supabase.from('funcionario').select('nome, holerites(mes_referencia, data_download)').eq('loja', loja);

    if (reportMesSelect.value) {
        const inicioMes = `${reportMesSelect.value}-01`;
        const proximoMes = new Date(inicioMes);
        proximoMes.setUTCMonth(proximoMes.getUTCMonth() + 1);
        const fimMes = proximoMes.toISOString().split('T')[0];
        query = query.filter('holerites.mes_referencia', 'gte', inicioMes).filter('holerites.mes_referencia', 'lt', fimMes);
    }
    
    query = query.order('nome').order('mes_referencia', { foreignTable: 'holerites', ascending: false });
    const { data: funcionarios, error } = await query;

    generateReportBtn.disabled = false;
    generateReportBtn.textContent = 'Gerar Relatório';
    
    if (error) { reportOutput.innerHTML = `<p style="color:red;">Erro: ${error.message}</p>`; return; }
    if (funcionarios.length === 0) { reportOutput.innerHTML = '<p>Nenhum funcionário encontrado para esta loja.</p>'; reportActionsDiv.style.display = 'none'; return; }

    let tableHTML = `<div id="printable-report"><h3 style="text-align:center; font-weight: 600;">Relatório de Downloads - Loja: ${loja}</h3><table style="width:100%; border-collapse: collapse; font-size: 0.9em;"><thead style="background-color: #34495e; color: white;"><tr><th style="padding: 10px; text-align: left;">Funcionário</th><th style="padding: 10px; text-align: left;">Mês Referência</th><th style="padding: 10px; text-align: left;">Status</th></tr></thead><tbody>`;

    funcionarios.forEach(func => {
        if (func.holerites.length === 0) {
            tableHTML += `<tr style="border-bottom: 1px solid #eee;"><td style="padding: 10px; font-weight: 600;">${func.nome}</td><td colspan="2" style="padding: 10px; color: #888;">Nenhum holerite no período selecionado</td></tr>`;
        } else {
            func.holerites.forEach((holerite, index) => {
                tableHTML += `<tr style="border-bottom: 1px solid #eee;"><td style="padding: 10px; font-weight: ${index === 0 ? '600' : 'normal'}">${index === 0 ? func.nome : ''}</td><td style="padding: 10px;">${formatarMesReferencia(holerite.mes_referencia)}</td><td style="padding: 10px;">${formatarStatusDownload(holerite.data_download)}</td></tr>`;
            });
        }
    });
    tableHTML += `</tbody></table></div>`;
    reportOutput.innerHTML = tableHTML;
    reportActionsDiv.style.display = 'block';
});

printReportBtn.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const reportContent = document.getElementById('printable-report');
    if (!reportContent) return;

    printReportBtn.textContent = 'Preparando PDF...';
    printReportBtn.disabled = true;

    html2canvas(reportContent, { scale: 2, useCORS: true }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth - 20;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 10;
        
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);

        let pageNumber = 1;
        while (heightLeft > 0) {
            position -= (pdfHeight - 20);
            pdf.addPage();
            pageNumber++;
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            pdf.text(`Página ${pageNumber}`, pdfWidth / 2, pdfHeight - 10, { align: 'center' });
        }
        
        pdf.save(`relatorio-downloads-${new Date().toISOString().split('T')[0]}.pdf`);
        
        printReportBtn.textContent = 'Imprimir em PDF';
        printReportBtn.disabled = false;
    });
});

logoutBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
});

const runCleanupButton = document.getElementById('run-cleanup-btn');
const cleanupStatusDiv = document.getElementById('cleanup-status');

runCleanupButton.addEventListener('click', async () => {
    
    const isConfirmed = confirm("Você tem certeza que deseja deletar PERMANENTEMENTE todos os holerites com mais de 6 meses?\n\nEsta ação não pode ser desfeita.");
    
    if (!isConfirmed) {
        cleanupStatusDiv.textContent = "Operação cancelada.";
        cleanupStatusDiv.style.color = '#333';
        return;
    }

    runCleanupButton.disabled = true;
    runCleanupButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Executando limpeza...';
    cleanupStatusDiv.innerHTML = 'Conectando ao servidor... Por favor, aguarde, isso pode levar alguns instantes.';
    cleanupStatusDiv.style.color = 'blue';

    try {
        const { data, error } = await supabase.functions.invoke('cleanup-storage');

        if (error) throw error;

        const successMessage = `✅ Limpeza Concluída! Resposta do servidor: "${data.message}"`;
        cleanupStatusDiv.innerHTML = successMessage;
        cleanupStatusDiv.style.color = 'green';
        alert(successMessage);

    } catch (err) {
        console.error("Erro ao invocar a função de limpeza:", err);
        const errorMessage = `❌ Erro na operação: ${err.message}`;
        cleanupStatusDiv.innerHTML = errorMessage;
        cleanupStatusDiv.style.color = 'red';
        alert(errorMessage + " Veja o console do navegador para mais detalhes (F12).");
    } finally {
        runCleanupButton.disabled = false;
        runCleanupButton.innerHTML = '<i class="fa-solid fa-trash-can"></i> Executar Limpeza de Holerites Antigos';
    }
});