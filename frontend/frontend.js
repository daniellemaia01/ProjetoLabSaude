// Base URL do Backend
const baseURL = 'http://localhost:5000';

// Instancia do Axios
let axiosInstance = getInstanciaAxios();

// Caso exista, escondendo elemento com possiveis mensagens de erro
const erroMsgElement = document.getElementById('erro-msg');
if (erroMsgElement != null ) erroMsgElement.style.display = 'none';

// Logica para exibir Link login / logout no cabecalho
logicaLinkLoginLogoutHeader();

// Criar instancia do Axios
function getInstanciaAxios() {
    // Se tem token JWT passa ele no header
    if (localStorage.getItem('jwtToken')) {
        return axios.create({
            baseURL: baseURL,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            }
        })
    } else {
        return axios.create({
            baseURL: baseURL
        })
    }
}

// Para criar ou editar um usuario
function manterUsuario () {

    document.getElementById('userForm').addEventListener('submit', function(event) {
        // Evita o envio padrão do formulário
        event.preventDefault(); 
        
        // Obter os valores dos campos de usuário
        var nome = document.getElementById('nome').value;
        var dataNascimento = document.getElementById('dataNascimento').value;
        var cpf = document.getElementById('cpf').value;
        var email = document.getElementById('email').value;
        var senha = document.getElementById('senha').value;
        var admin = document.getElementById('admin').checked;

        // Chamando endpoint do backend para criar usuario
        axiosInstance.post('/users', {
            nome: nome,
            dataNascimento: dataNascimento,
            cpf: cpf,
            email: email,
            senha: senha,
            admin: admin
        })
        .then(function (response) {
            // Na criacao com sucesso, redirecionar para a tela inicial do usuario
            console.log(response.data);
            window.location.href = 'tela_usuario.html';
        })
        .catch(function (error) {
            // No caso de erro, apresentar na tela
            console.error('Erro ao cadastrar usuário:', error);
            if (erroMsgElement != null ) {
                erroMsgElement.textContent = 'Erro ao cadastrar usuário: ' + error.response.data.message;
                erroMsgElement.style.display = 'block';
            }
        });
    });
}

// Para fazer login de usuario
function login () {


    // Função para lidar com o envio do formulário de login
    document.getElementById('loginForm').addEventListener('submit', function(event) {
        // Evita o envio padrão do formulário
        event.preventDefault(); 

        // Obter os valores dos campos de login
        var email = document.getElementById('email').value;
        var senha = document.getElementById('senha').value;
        
        // Chamando endpoint do backend para criar usuario
        axiosInstance.post('/login', {
            email: email,
            senha: senha
        })
        .then(function (response) {
            console.log(response.data);

            // Obtendo o token, id do usuario e se eh admin ou nao e armazenando no local storage
            localStorage.setItem('jwtToken', response.data.token);
            localStorage.setItem('userId', response.data.userId);
            localStorage.setItem('userAdmin', response.data.userAdmin);

            // Atualizando a instancia do AXIOS para agora fazer consultas autenticadas
            axiosInstance = getInstanciaAxios();

            // Na criacao com sucesso, redirecionar para a tela inicial do usuario
            if (localStorage.getItem('userAdmin')) {
                window.location.href = 'tela_admin.html';
            } else {
                window.location.href = 'tela_usuario.html';
            }
        })
        .catch(function (error) {
            // No caso de erro, apresentar na tela
            console.error('Erro ao realizar login:', error);
            if (erroMsgElement != null ) {
                erroMsgElement.textContent = 'Erro ao realizar login: ' + error.response.data.message;
                erroMsgElement.style.display = 'block';
            }
        });
    });
}

// Para listar todos usuarios
function listarUsuarios(){
    // Chamando endpoint do backend para listar usuarios
       axiosInstance.get('/users?limit=1000&offset=0')
    .then(function (response) {
        // Na obtencao de usuarios com sucesso
        const usuarios = response.data.users;
        console.log(usuarios);

        // Popule a tabela com os dados dos usuários
        const tabelaUsuarios = document.getElementById('tabela-usuarios');
        usuarios.forEach(usuario => {
            const row = tabelaUsuarios.insertRow();
            row.innerHTML = `
                <td>${usuario.email}</td>
                <td>${usuario.nome}</td>
                <td>${usuario.admin}</td>
                <td><a href="edita_usuario.html?id=${usuario._id}">Editar</a>
                <a href="javascript:void(0)" onclick="removerUsuario(${usuario._id})">Apagar</a></td>
            `;
        });        
    })
    .catch(function (error) {
        // No caso de erro, apresentar na tela
        console.error('Erro ao listar usuários:', error);
        if (erroMsgElement != null ) {
            erroMsgElement.textContent = 'Erro ao listar usuários: ' + error.response.data.message;
            erroMsgElement.style.display = 'block';
        }
    });
}

// Para fazer logout
function logout(){
    // Removemos o JWT token e dados do usuarios do local storage
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userAdmin');

    // Redirecionar para a tela inicial
    window.location.href = 'index.html';
}

// Logica para exibir Link login / logout no cabecalho
function logicaLinkLoginLogoutHeader() {
    const loginLogoutHeader = document.getElementById('login-logout');
    if (localStorage.getItem('jwtToken')) {
        loginLogoutHeader.href = "javascript:void(0)";
        loginLogoutHeader.onclick = logout;
        loginLogoutHeader.innerText = "Logout"
    } else {
        loginLogoutHeader.href = "login.html";
        loginLogoutHeader.innerText = "Login"
    }
}