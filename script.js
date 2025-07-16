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