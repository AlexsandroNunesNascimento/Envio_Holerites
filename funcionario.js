// funcionario.js

// Lógica de logout para a página do funcionário
const logoutBtn = document.getElementById('logout-btn-func');

logoutBtn.addEventListener('click', () => {
    alert("Saindo do portal...");
    window.location.href = 'index.html';
});