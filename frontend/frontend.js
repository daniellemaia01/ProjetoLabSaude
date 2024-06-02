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
function editaUsuario() {

    // Verificando se foi passado id de usuario para edicao
    let idUserEdicao = getURLParamValue("id");

    // Caso usuario esteja editando um usuario ele precisa estar logado
    if (idUserEdicao && getUserId()) {

        // Usuario que nao é admin só pode editar o próprio perfil
        if (idUserEdicao != getUserId() && !getUserAdmin()) {
            if (erroMsgElement != null) {
                erroMsgElement.textContent = 'Você só pode editar seu próprio usuário';
                erroMsgElement.style.display = 'block';
            }
            return;
        }

        // Recuperar os dados do usuario e popular no formulario
        axiosInstance.get('/users/' + idUserEdicao)
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
                if (erroMsgElement != null) {
                    erroMsgElement.textContent = 'Erro ao recuperar usuário: ' + error.response.data.message;
                    erroMsgElement.style.display = 'block';
                }
                return;
            });
    }

    // Se esta criando um usuario, escondendo div do campo id
    if (!idUserEdicao) {
        document.getElementById('div-id').style = "display: none";
    }

    // Campo que indica que usuario é administrador só fica visivel se usuario
    // logado tambem for administrador
    if (!getUserAdmin()) {
        document.getElementById('div-admin').style = "display: none";
    }

    // Para quando clicar no botao de enviar formulario
    document.getElementById('userForm').addEventListener('submit', function (event) {
        // Evita o envio padrão do formulário
        event.preventDefault();

        // Obter os valores dos campos de usuário
        let nome = document.getElementById('nome').value;
        let dataNascimento = document.getElementById('dataNascimento').value;
        let cpf = document.getElementById('cpf').value;
        let email = document.getElementById('email').value;
        let senha = document.getElementById('senha').value;
        let admin = document.getElementById('admin').checked;

        if (idUserEdicao == null) {
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
                    if (erroMsgElement != null) {
                        erroMsgElement.textContent = 'Erro ao cadastrar usuário: ' + error.response.data.message;
                        erroMsgElement.style.display = 'block';
                    }
                    return;
                });
        } else {
            // Chamando endpoint do backend para editar usuario
            let usuarioPersistir;

            // Se a senha esta sendo atualizada, coloco ela na lista de propriedades a persistir
            if (senha != null && senha != '') {
                usuarioPersistir = {
                    nome: nome,
                    dataNascimento: dataNascimento,
                    cpf: cpf,
                    email: email,
                    senha: senha,
                    admin: admin
                };
            } else {
                // Caso contrario, suprimo a senha
                usuarioPersistir = {
                    nome: nome,
                    dataNascimento: dataNascimento,
                    cpf: cpf,
                    email: email,
                    admin: admin
                };
            }

            axiosInstance.put('/users/' + idUserEdicao, usuarioPersistir)
                .then(function (response) {
                    // Na edicao com sucesso, redirecionar para a tela inicial do usuario
                    console.log(response.data);
                    window.location.href = 'tela_usuario.html';
                })
                .catch(function (error) {
                    // No caso de erro, apresentar na tela
                    console.error('Erro ao atualizar usuário:', error);
                    if (erroMsgElement != null) {
                        erroMsgElement.textContent = 'Erro ao atualizar usuário: ' + error.response.data.message;
                        erroMsgElement.style.display = 'block';
                    }
                    return;
                });
        }
    });


}

// Para fazer login de usuario
function login() {


    // Função para lidar com o envio do formulário de login
    document.getElementById('loginForm').addEventListener('submit', function (event) {
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
                if (erroMsgElement != null) {
                    erroMsgElement.textContent = 'Erro ao realizar login: ' + error.response.data.message;
                    erroMsgElement.style.display = 'block';
                }
                return;
            });
    });
}

// Para listar todos usuarios
function listarUsuarios() {
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
                <td><a href="edita_usuario.html?id=${usuario._id}" class="btn btn-primary">Editar</a>
                <a href="javascript:void(0)" onclick="removerUsuario(${usuario._id})"  class="btn btn-primary">Apagar</a></td>
            `;
            });
        })
        .catch(function (error) {
            // No caso de erro, apresentar na tela
            console.error('Erro ao listar usuários:', error);
            if (erroMsgElement != null) {
                erroMsgElement.textContent = 'Erro ao listar usuários: ' + error.response.data.message;
                erroMsgElement.style.display = 'block';
            }
            return;
        });
}

// Para listar todos tipos de exames
function listarTiposExames() {
    // Chamando endpoint do backend para listar tipos de exames
    axiosInstance.get('/examType?limit=1000&offset=0')
        .then(function (response) {
            // Na obtencao de tipos de exames com sucesso
            const tiposExames = response.data;
            console.log(tiposExames);

            // Popule a tabela com os dados dos usuários
            const tabelaTiposExames = document.getElementById('tabela-tipos-exames');
            tiposExames.forEach(tipoExame => {
                const row = tabelaTiposExames.insertRow();
                row.innerHTML = `
                <td>${tipoExame._id}</td>
                <td>${tipoExame.nomeExame}</td>
                <td>${tipoExame.valorReferencia}</td>
                <!--<td><a href="edita_tipo_exame.html?id=${tipoExame._id}" class="btn btn-primary">Editar</a>
                <a href="javascript:void(0)" onclick="removerTipoExame(${tipoExame._id})"  class="btn btn-primary">Apagar</a></td>-->
            `;
            });
        })
        .catch(function (error) {
            // No caso de erro, apresentar na tela
            console.error('Erro ao listar tipos de exames:', error);
            if (erroMsgElement != null) {
                erroMsgElement.textContent = 'Erro ao listar tipos de exames: ' + error.response.data.message;
                erroMsgElement.style.display = 'block';
            }
            return;
        });
}

// Para listar todos resultados de exames
function listarResultadosExames() {

    let urlBackend;

    // Se usuario é admin exibindo a opcao de criar resultado de exame
    // Usar endpoint do backend que lista todos resultados de exames de todos usuarios
    if (getUserAdmin()) {
        document.getElementById('link-criar-resultado-exame').style.display = '';
        urlBackend = '/exam?limit=1000&offset=0';
    } else {
        // Endpoint para obter apenas resultados do proprio usuario
        urlBackend = '/exam/user?limit=1000&offset=0';
    }

    // Chamando endpoint do backend para listar resultados de exames
    axiosInstance.get(urlBackend)
        .then(function (response) {
            // Na obtencao de resultados de exames com sucesso
            const resultadosExames = response.data;
            console.log(resultadosExames);

            if (resultadosExames.length == 0) {
                if (erroMsgElement != null) {
                    erroMsgElement.textContent = 'Nenhum resultado de exame localizado para o usuário';
                    erroMsgElement.style.display = 'block';
                }
                return;
            }

            // Popule a tabela com os dados dos resultados
            const tabelaResultadosExames = document.getElementById('tabela-resultados-exames');
            resultadosExames.forEach(resultadoExame => {
                const row = tabelaResultadosExames.insertRow();
                row.innerHTML = `
                <td>${resultadoExame.usuarioId.email}</td>
                <td>${resultadoExame.usuarioId.nome}</td>
                <td>${resultadoExame.tipoExameId.nomeExame}</td>
                <td>${resultadoExame.resultado}</td>
                <td>${resultadoExame.tipoExameId.valorReferencia}</td>
                <td>${formatarDataParaFrontendPtBR(resultadoExame.dataColeta)}</td>`;

                // Se é admin mostra operacoes de edicao e remocao
                if (getUserAdmin()) {
                    row.innerHTML += `
                    <td><a href="edita_resultado_exame.html?id=${resultadoExame._id}" class="btn btn-primary">Editar</a>
                    <a href="javascript:void(0)" onclick="removerResultadoExame(${resultadoExame._id})"  class="btn btn-primary">Apagar</a></td>`;
                } else{
                    row.innerHTML += '<td></td>';
                }
            
            });
        })
        .catch(function (error) {
            // No caso de erro, apresentar na tela
            console.error('Erro ao listar reultados de exames:', error);
            if (erroMsgElement != null) {
                erroMsgElement.textContent = 'Erro ao listar resultados de exames: ' + error.response.data.message;
                erroMsgElement.style.display = 'block';
            }
            return;
        });
}


// Para fazer logout
function logout() {
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
    return JSON.parse(localStorage.getItem('userAdmin'));
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

// Logica para montar tela de usuario com as opcoes as quais ele tem acesso
function montarPainelUsuario(){
    if (getUserAdmin()) {
        document.getElementById('div-header-acoes-usuario').innerText = 'Painel do Administrador';

        document.getElementById('div-acoes-usuario').innerHTML = `
        <a href="lista_usuarios.html" class="btn btn-primary mb-2">Listar usuarios</a><br>
        <a href="lista_resultados_exames.html" class="btn btn-primary mb-2">Listar resultados de exames</a><br>
        <a href="lista_tipos_exames.html" class="btn btn-primary mb-2">Listar tipos de exames</a><br>
        <a href="edita_usuario.html" class="btn btn-primary mb-2" >Cadastrar usuário</a><br>
        <a href="edita_resultado_exame.html" class="btn btn-primary mb-2" >Cadastrar resultado de exame</a><br>
        <a id="link-editar-perfil" href="" class="btn btn-primary mb-2">Editar meu perfil</a><br>
        `;
    } else {
        document.getElementById('div-header-acoes-usuario').innerText = 'Painel do Usuário';

        document.getElementById('div-acoes-usuario').innerHTML = `
        <a id="link-resultados" href="lista_resultados_exames.html" class="btn btn-primary mb-2">Ver meus exames</a><br>
        <a id="link-editar-perfil" href="" class="btn btn-primary mb-2">Editar meu perfil</a>
        `;
    }
}

// Recebe uma data no formato mantido pelo backed e converte para formato do frontend (en)
function formatarDataParaFrontend(dataBackendString) {
    const dataBackend = new Date(dataBackendString);
    const dataFormatadaFrontend = dataBackend.toISOString().split('T')[0];
    return dataFormatadaFrontend;
}

// Recebe uma data no formato mantido pelo backend e converte para formato do frontend (pt-BR)
function formatarDataParaFrontendPtBR(dataBackendString) {
    const dataBackend = new Date(dataBackendString);
    const dia = String(dataBackend.getDate()).padStart(2, '0');
    const mes = String(dataBackend.getMonth() + 1).padStart(2, '0');
    const ano = dataBackend.getFullYear();
    return `${dia}/${mes}/${ano}`;
}