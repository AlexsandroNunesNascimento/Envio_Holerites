// adm.js
import { supabase } from './supabase.js';

// Seleciona os elementos da página
const logoutBtn = document.getElementById('logout-btn');
const showCadastroBtn = document.getElementById('show-cadastro-btn');
const cadastroSection = document.getElementById('cadastro-section');
const welcomeSection = document.getElementById('welcome-section');
const cadastroForm = document.getElementById('cadastro-form');

// Lógica para o botão Sair
logoutBtn.addEventListener('click', () => {
    alert("Saindo...");
    window.location.href = 'index.html'; // Volta para a página de login
});

// Lógica para mostrar o formulário de cadastro
showCadastroBtn.addEventListener('click', () => {
    welcomeSection.style.display = 'none'; // Esconde a mensagem de boas-vindas
    cadastroSection.style.display = 'block'; // Mostra a seção de cadastro
});

// Lógica para enviar o formulário de cadastro para o Supabase
cadastroForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Pega os valores dos campos do formulário
    const nome = document.getElementById('func-nome').value;
    const cpf = document.getElementById('func-cpf').value;
    const loja = document.getElementById('func-loja').value;
    const senha = document.getElementById('func-senha').value;

    // Tenta inserir os dados na tabela 'funcionario'
    const { data, error } = await supabase
      .from('funcionario')
      .insert([
        { nome, cpf, loja, senha }
      ]);

    if (error) {
        console.error('Erro ao cadastrar:', error);
        // O erro '23505' é o de violação de chave única (CPF duplicado)
        if (error.code === '23505') {
            alert('Erro: O CPF informado já está cadastrado.');
        } else {
            alert(`Ocorreu um erro ao cadastrar: ${error.message}`);
        }
    } else {
        alert('Funcionário cadastrado com sucesso!');
        cadastroForm.reset(); // Limpa os campos do formulário
    }
});