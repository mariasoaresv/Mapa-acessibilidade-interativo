document.addEventListener('DOMContentLoaded', () => {

    // Exibição do popup de login/cadastro

    const wrapper = document.querySelector('.wrapper');
    const logarLink = document.querySelector('.logar-link');
    const cadastrarLink = document.querySelector('.cadastrar-link');
    const loginPopup = document.querySelector('.login');
    const iconClose = document.querySelector('.icon-close');

    loginPopup.addEventListener('click', () => {
        wrapper.classList.add('active-popup');
    });

    iconClose.addEventListener('click', () => {
        wrapper.classList.remove('active-popup');
    });

    cadastrarLink.addEventListener('click', () => {
        wrapper.classList.add('active');
    });

    logarLink.addEventListener('click', () => {
        wrapper.classList.remove('active');
    });

    // Ponte para o backend (server.js)

    const loginForm = document.getElementById('login-form');
    const cadastroForm = document.getElementById('cadastro-form');

    // Formulário de login

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('login-email').value;
            const senha = document.getElementById('login-senha').value;

            try {

                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, senha: senha }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message);

                    sessionStorage.setItem('usuarioLogado', JSON.stringify(data.user));

                    wrapper.classList.remove('active-popup'); 
                    window.location.href = 'mapa.html'; //redireciona para a página de mapa
                    
                } else {
                    alert(data.message); 
                }
            } catch (error) {
                console.error('Erro no login:', error);
                alert('Ocorreu um erro. Tente novamente.');
            }
        });
    }

    // Formulário de cadastro

    if (cadastroForm) {
        cadastroForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const nome = document.getElementById('cadastro-nome').value;
            const email = document.getElementById('cadastro-email').value;
            const senha = document.getElementById('cadastro-senha').value;

            try {
                // Envia os dados para o /cadastro no server.js
                const response = await fetch('/cadastro', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, email, senha }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message);
                    wrapper.classList.remove('active'); // Volta para a tela de login
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Erro no cadastro:', error);
                alert('Ocorreu um erro. Tente novamente.');
            }
        });
    }
});