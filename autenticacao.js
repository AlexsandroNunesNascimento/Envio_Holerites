import { supabase } from './supabase.js';

const gearButton = document.getElementById('gear-btn');
const mainLoginForm = document.getElementById('main-login-form');
const adminLoginForm = document.getElementById('admin-login-form');
const pageTitle = document.getElementById('page-title');
const backToMainLoginLink = document.getElementById('back-to-main-login');

gearButton.addEventListener('click', () => {
    pageTitle.textContent = 'Login Administração';
    mainLoginForm.style.display = 'none';
    adminLoginForm.style.display = 'block';
});

backToMainLoginLink.addEventListener('click', (event) => {
    event.preventDefault();
    pageTitle.textContent = 'Login Holerite';
    mainLoginForm.style.display = 'block';
    adminLoginForm.style.display = 'none';
});


mainLoginForm.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault(); 

    const nome = document.getElementById('nome').value;
    const cpf = document.getElementById('cpf').value;
    const senha = document.getElementById('senha').value;
    const { data, error } = await supabase
        .from('funcionario')
        .select('id')
        .eq('nome', nome) 
        .eq('cpf', cpf)
        .eq('senha', senha)
        .single(); 

    if (error && error.code !== 'PGRST116') { 
        console.error('Erro na consulta:', error);
        alert('Ocorreu um erro ao tentar fazer login. Tente novamente.');
        return;
    }

    if (data) {
        sessionStorage.setItem('funcionarioId', data.id);
        alert('Login de funcionário bem-sucedido!');
        window.location.href = 'funcionario.html';
    } else {
        alert('Nome, CPF ou senha inválidos. Verifique os dados e tente novamente.');
    }
});

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