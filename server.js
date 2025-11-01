const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');


const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'keywordpalavrachave',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(express.static('public'));

const users = []; //Banco de dados "falso"/temporário (ele é apagado assim que o servidor é reiniciado)

app.post('/cadastro', async (req, res) => {
    try {
    const { nome, email, senha } = req.body;

    const userExists = users.find(user => user.email === email);
    if (userExists) {
        return res.status(400).send('Este e-mail já está cadastrado.');
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const newUser = { id: users.length + 1, username: nome, email, password: hashedPassword };
    users.push(newUser);

    console.log('Novo usuário cadastrado: ', newUser);
    console.log('Total de usuários: ', users);

    res.status(201).json({message: 'Usuário cadastrado com sucesso!'});
    }
    catch (error){
        console.error(error);
        res.status(500).json('Erro no servidor.');
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        const user = users.find(user => user.email === email);

        if (!user || !(await bcrypt.compare(senha, user.password))) {
            return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email
        };

        console.log('Usuário logado:', req.session.user);

        res.status(200).json({ message: 'Login bem-sucedido!', user: req.session.user });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log('Seu site está sendo servido da pasta "public"');
});