// adm.js
import { supabase } from './supabase.js';

// --- SELEÇÃO DOS ELEMENTOS DO DOM ---
const logoutBtn = document.getElementById('logout-btn');
const sideMenuButtons = document.querySelectorAll('.side-menu button');
const contentSections = document.querySelectorAll('.content-section');
const cadastroForm = document.getElementById('cadastro-form');

// Elementos da área de consulta
const searchNomeInput = document.getElementById('search-nome');
const searchLojaInput = document.getElementById('search-loja');
const resultList = document.getElementById('result-list');
const noResultsMessage = document.getElementById('no-results');

// Elementos do Modal de Edição
const editModal = document.getElementById('edit-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const editForm = document.getElementById('edit-form');

// Elementos da área de Envio de Holerite
const holeriteUploadForm = document.getElementById('holerite-upload-form');
const lojaSelect = document.getElementById('holerite-loja-select');
const funcSelect = document.getElementById('holerite-func-select');

let allFuncionarios = []; // Guarda a lista completa de funcionários para otimização

// --- FUNÇÃO PARA TROCAR AS TELAS (SEÇÕES) ---
const showSection = (targetId) => {
    contentSections.forEach(section => {
        section.classList.remove('active');
        if (section.id === targetId) {
            section.classList.add('active');
        }
    });
};

// --- FUNÇÃO PARA POPULAR OS FILTROS DE ENVIO DE HOLERITE ---
const populateHoleriteFilters = async () => {
    const { data, error } = await supabase.from('funcionario').select('id, nome, loja').order('nome');
    if (error) {
        console.error("Erro ao buscar funcionários:", error);
        return;
    }
    allFuncionarios = data;

    const lojas = [...new Set(allFuncionarios.map(f => f.loja))];
    lojaSelect.innerHTML = '<option value="">Todas as Lojas</option>';
    lojas.sort().forEach(loja => {
        lojaSelect.innerHTML += `<option value="${loja}">${loja}</option>`;
    });

    updateFuncionarioSelect();
};

const updateFuncionarioSelect = () => {
    const selectedLoja = lojaSelect.value;
    const filteredFuncionarios = selectedLoja ? allFuncionarios.filter(f => f.loja === selectedLoja) : allFuncionarios;

    funcSelect.innerHTML = '<option value="" disabled selected>-- Escolha um funcionário --</option>';
    filteredFuncionarios.forEach(func => {
        funcSelect.innerHTML += `<option value="${func.id}">${func.nome}</option>`;
    });
};

// --- LÓGICA DE NAVEGAÇÃO DO MENU LATERAL ---
sideMenuButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetSectionId = button.getAttribute('data-target');
        showSection(targetSectionId);
        
        if (targetSectionId === 'consulta-section') fetchAndDisplayFuncionarios();
        if (targetSectionId === 'holerite-section') populateHoleriteFilters();
    });
});

lojaSelect.addEventListener('change', updateFuncionarioSelect);

// --- LÓGICA PARA FORMULÁRIO DE UPLOAD DE HOLERITE ---
holeriteUploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const funcionarioId = funcSelect.value;
    const mesReferencia = document.getElementById('holerite-mes').value + '-01';
    const pdfFile = document.getElementById('holerite-pdf-file').files[0];
    const submitButton = holeriteUploadForm.querySelector('button[type="submit"]');

    if (!funcionarioId || !document.getElementById('holerite-mes').value || !pdfFile) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

    try {
        const fileName = `holerite_${mesReferencia.slice(0, 7)}_${Date.now()}.pdf`;
        const filePath = `${funcionarioId}/${fileName}`;

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
        lojaSelect.value = "";
        updateFuncionarioSelect();
        
    } catch (error) {
        console.error("Erro no envio do holerite:", error);
        alert(`Ocorreu um erro: ${error.message}`);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Enviar Holerite';
    }
});

// --- LÓGICA DE CADASTRO, CONSULTA, EDIÇÃO E EXCLUSÃO (EXISTENTE) ---
// Todo o código anterior de consulta, edição, exclusão, etc., permanece aqui.
// (Omitido por brevidade, mas deve estar presente no seu arquivo final).
// Função fetchAndDisplayFuncionarios
// Função do cadastroForm
// Funções do Modal e Formulário de Edição
// Funções dos botões de editar e deletar
//...

// (Incluindo as funções para que o arquivo fique completo)
const fetchAndDisplayFuncionarios = async () => {
    const nomeFilter = searchNomeInput.value;
    const lojaFilter = searchLojaInput.value;
    let query = supabase.from('funcionario').select('*').order('nome', { ascending: true });
    if (nomeFilter) query = query.ilike('nome', `%${nomeFilter}%`);
    if (lojaFilter) query = query.ilike('loja', `%${lojaFilter}%`);
    const { data, error } = await query;
    if (error) {
        console.error('Erro ao buscar funcionários:', error);
        return;
    }
    resultList.innerHTML = '';
    noResultsMessage.style.display = data.length === 0 ? 'block' : 'none';
    data.forEach(func => {
        const item = document.createElement('div');
        item.className = 'func-item';
        item.innerHTML = `
            <div class="func-info"><p><span>Nome:</span> ${func.nome}</p><p><span>CPF:</span> ${func.cpf}</p><p><span>Loja:</span> ${func.loja}</p></div>
            <div class="func-actions"><button class="edit-btn" data-id="${func.id}">Editar</button><button class="delete-btn" data-id="${func.id}">Excluir</button></div>
        `;
        resultList.appendChild(item);
    });
};

searchNomeInput.addEventListener('keyup', fetchAndDisplayFuncionarios);
searchLojaInput.addEventListener('keyup', fetchAndDisplayFuncionarios);

cadastroForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const { error } = await supabase.from('funcionario').insert([
        { nome: document.getElementById('func-nome').value, cpf: document.getElementById('func-cpf').value, loja: document.getElementById('func-loja').value, senha: document.getElementById('func-senha').value }
    ]);
    if (error) {
        alert(error.code === '23505' ? 'Erro: O CPF informado já está cadastrado.' : `Erro: ${error.message}`);
    } else {
        alert('Funcionário cadastrado com sucesso!');
        cadastroForm.reset();
    }
});

resultList.addEventListener('click', async (event) => {
    const target = event.target;
    const id = target.getAttribute('data-id');

    if (target.classList.contains('delete-btn')) {
        if (confirm('Tem certeza que deseja excluir este funcionário?')) {
            const { error } = await supabase.from('funcionario').delete().eq('id', id);
            if (error) alert(`Erro ao excluir: ${error.message}`);
            else { alert('Funcionário excluído.'); fetchAndDisplayFuncionarios(); }
        }
    }
    
    if (target.classList.contains('edit-btn')) {
        const { data, error } = await supabase.from('funcionario').select('*').eq('id', id).single();
        if(error) { alert(`Erro ao carregar dados: ${error.message}`); return; }
        document.getElementById('edit-id').value = data.id;
        document.getElementById('edit-nome').value = data.nome;
        document.getElementById('edit-cpf').value = data.cpf;
        document.getElementById('edit-loja').value = data.loja;
        editModal.style.display = 'block';
    }
});

closeModalBtn.addEventListener('click', () => { editModal.style.display = 'none'; });
window.addEventListener('click', (event) => { if (event.target == editModal) editModal.style.display = 'none'; });

editForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = document.getElementById('edit-id').value;
    const senha = document.getElementById('edit-senha').value;
    let dadosParaAtualizar = { nome: document.getElementById('edit-nome').value, loja: document.getElementById('edit-loja').value };
    if (senha) dadosParaAtualizar.senha = senha;
    
    const { error } = await supabase.from('funcionario').update(dadosParaAtualizar).eq('id', id);
    if (error) alert(`Erro ao atualizar: ${error.message}`);
    else { alert('Funcionário atualizado!'); editModal.style.display = 'none'; fetchAndDisplayFuncionarios(); }
});

logoutBtn.addEventListener('click', () => { window.location.href = 'index.html'; });