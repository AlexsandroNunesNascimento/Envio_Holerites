// autenticacao.js

// Importa o cliente supabase do nosso arquivo de configuração
import { supabase } from './supabase.js';

// --- CONTROLE DA INTERFACE DE LOGIN ---

const gearButton = document.getElementById('gear-btn');
const mainLoginForm = document.getElementById('main-login-form');
const adminLoginForm = document.getElementById('admin-login-form');
const pageTitle = document.getElementById('page-title');
const backToMainLoginLink = document.getElementById('back-to-main-login');

gearButton.addEventListener('click', () => {
    pageTitle.textContent = 'Login ADM';
    mainLoginForm.style.display = 'none';
    adminLoginForm.style.display = 'block';
});

backToMainLoginLink.addEventListener('click', (event) => {
    event.preventDefault();
    pageTitle.textContent = 'Login Holerite';
    mainLoginForm.style.display = 'block';
    adminLoginForm.style.display = 'none';
});


// --- LÓGICA DE AUTENTICAÇÃO ---

// Escuta o evento de 'submit' do formulário de funcionário
mainLoginForm.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Impede o recarregamento da página

    // Pega os valores dos TRÊS campos
    const nome = document.getElementById('nome').value;
    const cpf = document.getElementById('cpf').value;
    const senha = document.getElementById('senha').value;
    
    // Procura no banco um funcionário com NOME, CPF e SENHA informados
    const { data, error } = await supabase
        .from('funcionario')
        .select('id') // Só precisamos do ID para o sessionStorage
        .eq('nome', nome)      // <--- CORREÇÃO: Adicionada a verificação do nome
        .eq('cpf', cpf)
        .eq('senha', senha)
        .single(); // .single() espera um resultado único ou nenhum

    if (error && error.code !== 'PGRST116') { // Ignora o erro "nenhuma linha encontrada"
        console.error('Erro na consulta:', error);
        alert('Ocorreu um erro ao tentar fazer login. Tente novamente.');
        return;
    }

    if (data) {
        // Se encontrou, guarda o ID na sessão antes de redirecionar
        sessionStorage.setItem('funcionarioId', data.id);
        
        alert('Login de funcionário bem-sucedido!');
        window.location.href = 'funcionario.html';
    } else {
        // Se não encontrou, avisa o usuário
        alert('Nome, CPF ou senha inválidos. Verifique os dados e tente novamente.'); // <--- CORREÇÃO: Mensagem de erro mais clara
    }
});


// Escuta o evento de 'submit' do formulário de administrador
adminLoginForm.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('admin-senha').value;
    
    const { data, error } = await supabase
        .from('administrador')
        .select('*')
        .eq('email', email)
        .eq('senha', senha)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Erro na consulta:', error);
        alert('Ocorreu um erro ao tentar fazer login. Tente novamente.');
        return;
    }

    if (data) {
        alert('Login de administrador bem-sucedido!');
        window.location.href = 'adm.html';
    } else {
        alert('Email ou senha de administrador inválidos.');
    }
});