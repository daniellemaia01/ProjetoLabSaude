// Base URL do Backend
const baseURL = 'http://localhost:5000';

// Instancia do Axios
let axiosInstance = getInstanciaAxios();

// Caso exista, escondendo elemento com possiveis mensagens de erro
const erroMsgElement = document.getElementById('erro-msg');

// Logica para exibir Link login / logout no cabecalho
logicaLinkLoginLogoutHeader();

// Criar instancia do Axios
function getInstanciaAxios() {
    // Se tem token JWT passa ele no header
    if (getJwtToken()) {
        return axios.create({
            baseURL: baseURL,
            headers: {
                'Authorization': `Bearer ${getJwtToken()}`
            }
        })
    } else {
        return axios.create({
            baseURL: baseURL
        })
    }
}

// Para obter um parametro passado via GET na URL
function getURLParamValue(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Para criar ou editar um usuario
function editaUsuario () {

    // Verificando se foi passado id de usuario para edicao
    let idUserEdicao = getURLParamValue("id");

    // Caso usuario esteja editando um usuario ele precisa estar logado
    if (idUserEdicao && getUserId()) {

        // Usuario que nao é admin só vai editar o próprio perfil
        if (idUserEdicao != getUserId() && !getUserAdmin()) {
            idUserEdicao = getUserId();
        }

        // Recuperar os dados do usuario
        axiosInstance.get('/users/'+idUserEdicao)
        .then(function (response) {
            // Na obtencao de usuarios com sucesso
            let usuarioEdicao = response.data;
            console.log(usuarioEdicao);

            document.getElementById('_id').value = usuarioEdicao._id;
            document.getElementById('nome').value = usuarioEdicao.nome;
            document.getElementById('dataNascimento').value = formatarDataParaFrontend(usuarioEdicao.dataNascimento);
            document.getElementById('cpf').value = usuarioEdicao.cpf;
            document.getElementById('email').value = usuarioEdicao.email;
            document.getElementById('admin').checked = usuarioEdicao.admin;
        })
        .catch(function (error) {
            // No caso de erro, apresentar na tela
            console.error('Erro ao recuperar usuário:', error);
            if (erroMsgElement != null ) {
                erroMsgElement.textContent = 'Erro ao recuperar usuário: ' + error.response.data.message;
                erroMsgElement.style.display = 'block';
            }
        });
    }

    // Para quando clicar no botao de enviar formulario
    document.getElementById('userForm').addEventListener('submit', function(event) {
        // Evita o envio padrão do formulário
        event.preventDefault(); 
        
        // Obter os valores dos campos de usuário
        let nome = document.getElementById('nome').value;
        let dataNascimento = document.getElementById('dataNascimento').value;
        let cpf = document.getElementById('cpf').value;
        let email = document.getElementById('email').value;
        let senha = document.getElementById('senha').value;
        let admin = document.getElementById('admin').checked;

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
        let email = document.getElementById('email').value;
        let senha = document.getElementById('senha').value;
        
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
            if (getUserAdmin()) {
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

// Recupera jwtToken do Local storage
function getJwtToken() {
    return localStorage.getItem('jwtToken');
}

// Recupera id do usuario logado do Local storage
function getUserId() {
    return localStorage.getItem('userId');
}

// Recupera se usuario logado é admin ou não do Local storage
function getUserAdmin() {
    return localStorage.getItem('userAdmin');
}

// Logica para exibir Link login / logout no cabecalho
function logicaLinkLoginLogoutHeader() {
    const loginLogoutHeader = document.getElementById('login-logout');
    if (getJwtToken()) {
        loginLogoutHeader.href = "javascript:void(0)";
        loginLogoutHeader.onclick = logout;
        loginLogoutHeader.innerText = "Logout"
    } else {
        loginLogoutHeader.href = "login.html";
        loginLogoutHeader.innerText = "Login"
    }
}

// Logica da tela de usuario
function montarEditarPerfilUsuario() {
    // Ir para página de edicao de perfil usuario
    document.getElementById('link-editar-perfil').href = 'edita_usuario.html?id=' + getUserId();
}

// Recebe uma data no formato mantido pelo backed e converte para formato do frontend
function formatarDataParaFrontend(dataBackendString) {
    const dataBackend = new Date(dataBackendString);
    const dataFormatadaFrontend = dataBackend.toISOString().split('T')[0];   
    return  dataFormatadaFrontend;
}