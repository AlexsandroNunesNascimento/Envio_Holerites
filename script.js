// Seleciona os elementos do DOM
const gearButton = document.getElementById('gear-btn');
const mainLoginForm = document.getElementById('main-login-form');
const adminLoginForm = document.getElementById('admin-login-form');
const pageTitle = document.getElementById('page-title');
// Seleciona o novo link de "voltar"
const backToMainLoginLink = document.getElementById('back-to-main-login');

// Função para ir para o Login ADM
gearButton.addEventListener('click', () => {
    // Muda o texto do título
    pageTitle.textContent = 'Login ADM';
    // Esconde o formulário principal
    mainLoginForm.style.display = 'none';
    // Mostra o formulário secundário
    adminLoginForm.style.display = 'block';
});

// Função para voltar para o Login Principal
backToMainLoginLink.addEventListener('click', (event) => {
    // Previne o comportamento padrão do link (que é recarregar a página)
    event.preventDefault();

    // Muda o texto do título de volta
    pageTitle.textContent = 'Login Holerite';
    // Mostra o formulário principal
    mainLoginForm.style.display = 'block';
    // Esconde o formulário secundário
    adminLoginForm.style.display = 'none';
});