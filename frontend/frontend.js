// Base URL do Backend
const baseURLBackend = 'http://localhost:5000';

// URLs das paginas HTML
const urlEditaResultadoExame = 'edita_resultado_exame.html';
const urlEditaUsuario = 'edita_usuario.html';
const urlEditaTipoExame = 'edita_tipo_exame.html';
const urlIndex = 'index.html';
const urlListaResultadosExames = 'lista_resultados_exames.html';
const urlListaTiposExames = 'lista_tipos_exames.html';
const urlListaUsuarios = 'lista_usuarios.html';
const urlLogin = 'login.html';
const urlPainelUsuario = 'painel_usuario.html';

// Exibir mensagem de erro na tela (com id erro-msg posicionado no html)
function exibirMensagemErro(mensagemErro){
    const elementoMensagemErro = document.getElementById('erro-msg');

    if (elementoMensagemErro != null) {
        elementoMensagemErro.textContent = mensagemErro;
        elementoMensagemErro.style.display = 'block';
    }    
}

// Criar instancia do Axios
function getInstanciaAxios() {
    // Se tem token JWT passa ele no header
    if (getJwtToken()) {
        return axios.create({
            baseURL: baseURLBackend,
            headers: {
                'Authorization': `Bearer ${getJwtToken()}`
            }
        })
    } else {
        return axios.create({
            baseURL: baseURLBackend
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
            exibirMensagemErro('Você só pode editar seu próprio usuário');
            return;
        }

        // Recuperar os dados do usuario e popular no formulario
        getInstanciaAxios().get('/users/' + idUserEdicao)
            .then(function (response) {
                // Na obtencao de usuarios com sucesso
                let usuarioEdicao = response.data;

                document.getElementById('_id').value = usuarioEdicao._id;
                document.getElementById('nome').value = usuarioEdicao.nome;
                document.getElementById('dataNascimento').value = formatarDataParaFrontend(usuarioEdicao.dataNascimento);
                document.getElementById('cpf').value = usuarioEdicao.cpf;
                document.getElementById('email').value = usuarioEdicao.email;
                document.getElementById('admin').checked = usuarioEdicao.admin;
            })
            .catch(function (error) {
                exibirMensagemErro('Erro ao recuperar usuário: ' + error.response.data.message);
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
            getInstanciaAxios().post('/users', {
                nome: nome,
                dataNascimento: dataNascimento,
                cpf: cpf,
                email: email,
                senha: senha,
                admin: admin
            })
                .then(function (response) {
                    // Se admin redireciona para listagem de usuarios
                    if (getUserAdmin()) {
                        window.location.href = urlListaUsuarios;
                    } else {
                        // Se nao eh admin redireciona para pagina de login
                        window.location.href = urlLogin;
                    }
                    return;
                })
                .catch(function (error) {
                    exibirMensagemErro('Erro ao cadastrar usuário: ' + error.response.data.message);
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

            getInstanciaAxios().put('/users/' + idUserEdicao, usuarioPersistir)
                .then(function (response) {
                    // Se admin redireciona para listagem de usuarios
                    if (getUserAdmin()) {
                        window.location.href = urlListaUsuarios;
                    } else {
                        // Se nao eh admin redireciona para pagina inicial de usuario
                        window.location.href = urlPainelUsuario;
                    }
                    return;
                })
                .catch(function (error) {
                    // No caso de erro, apresentar na tela
                    exibirMensagemErro('Erro ao atualizar usuário: ' + error.response.data.message);
                    return;
                });
        }
    });


}

// Para fazer login de usuario
function login() {
    // Se usuario ja esta logado redireciona ele para painel do usuario
    if (getJwtToken()) {
        window.location.href = urlPainelUsuario;
        return;
    }

    // Função para lidar com o envio do formulário de login
    document.getElementById('loginForm').addEventListener('submit', function (event) {
        // Evita o envio padrão do formulário
        event.preventDefault();

        // Obter os valores dos campos de login
        let email = document.getElementById('email').value;
        let senha = document.getElementById('senha').value;

        // Chamando endpoint do backend para criar usuario
        getInstanciaAxios().post('/login', {
            email: email,
            senha: senha
        })
            .then(function (response) {
                // Obtendo o token, id do usuario e se eh admin ou nao e armazenando no local storage
                localStorage.setItem('jwtToken', response.data.token);
                localStorage.setItem('userId', response.data.userId);
                localStorage.setItem('userAdmin', response.data.userAdmin);

                // Redirecionar para a tela inicial do usuario
                window.location.href = urlPainelUsuario;
                return;
            })
            .catch(function (error) {
                exibirMensagemErro('Erro ao realizar login: ' + error.response.data.message);
                return;
            });
    });
}

// Para listar todos usuarios
function listarUsuarios() {
    // Chamando endpoint do backend para listar usuarios
    getInstanciaAxios().get('/users?limit=1000&offset=0')
        .then(function (response) {
            // Na obtencao de usuarios com sucesso
            const usuarios = response.data.users;

            // Popule a tabela com os dados dos usuários
            const tabelaUsuarios = document.getElementById('tabela-usuarios');
            usuarios.forEach(usuario => {
                const row = tabelaUsuarios.insertRow();
                row.innerHTML = `
                <td>${usuario.email}</td>
                <td>${usuario.nome}</td>
                <td>${usuario.admin == true ? 'Sim' : 'Não'}</td>
                <td><a href="${urlEditaUsuario}?id=${usuario._id}" class="btn btn-primary">Editar</a>
                <a href="javascript:void(0)" onclick="javascript:removerUsuario('${usuario._id}')"  class="btn btn-primary">Apagar</a></td>
            `;
            });
        })
        .catch(function (error) {
            // No caso de erro, apresentar na tela
            exibirMensagemErro('Erro ao listar usuários: ' + error.response.data.message);
            return;
        });
}

// Para listar todos tipos de exames
function listarTiposExames() {
    // Chamando endpoint do backend para listar tipos de exames
    getInstanciaAxios().get('/examType?limit=1000&offset=0')
        .then(function (response) {
            // Na obtencao de tipos de exames com sucesso
            const tiposExames = response.data;

            // Popule a tabela com os dados dos usuários
            const tabelaTiposExames = document.getElementById('tabela-tipos-exames');
            tiposExames.forEach(tipoExame => {
                const row = tabelaTiposExames.insertRow();
                row.innerHTML = `
                <td>${tipoExame._id}</td>
                <td>${tipoExame.nomeExame}</td>
                <td>${tipoExame.valorReferencia}</td>
                <!--<td><a href="${urlEditaTipoExame}?id=${tipoExame._id}" class="btn btn-primary">Editar</a>
                <a href="javascript:void(0)" onclick="removerTipoExame(${tipoExame._id})"  class="btn btn-primary">Apagar</a></td>-->
            `;
            });
        })
        .catch(function (error) {
            exibirMensagemErro('Erro ao listar tipos de exames: ' + error.response.data.message);
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
    getInstanciaAxios().get(urlBackend)
        .then(function (response) {
            // Na obtencao de resultados de exames com sucesso
            const resultadosExames = response.data;

            if (resultadosExames.length == 0) {
                exibirMensagemErro('Nenhum resultado de exame localizado para o usuário');
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
                    <td><a href="${urlEditaResultadoExame}?id=${resultadoExame._id}" class="btn btn-primary">Editar</a>
                    <a href="javascript:void(0)" onclick="javascript:removerResultadoExame('${resultadoExame._id}')"  class="btn btn-primary">Apagar</a></td>`;
                } else{
                    row.innerHTML += '<td></td>';
                }
            
            });
        })
        .catch(function (error) {
            // No caso de erro, apresentar na tela
            exibirMensagemErro('Erro ao listar resultados de exames: ' + error.response.data.message);
            return;
        });
}

// Remover um resultado de exame
function removerResultadoExame(id) {
    getInstanciaAxios().delete('/exam/' + id)
    .then(function (response) {
        // Redireciona para listagem de exames
        window.location.href = urlListaResultadosExames;
        return;
    })
    .catch(function (error) {
        // No caso de erro, apresentar na tela
        exibirMensagemErro('Erro ao remover resultado de exame: ' + error.response.data.message);
        return;
    });
}

// Remover usuario
function removerUsuario(id) {
    // Antes de remover, verifica se o usuario tem algum resultado de exame
    getInstanciaAxios().get('/exam/user/'+id)
        .then(function (response) {
            // Na obtencao de resultados de exames com sucesso
            const resultadosExames = response.data;

            if (resultadosExames > 0) {
                exibirMensagemErro('Usuário possui resultados de exames. Exclua os resultados primeiro. ');
                return;
            } else {
                // Remove usuario da base
                getInstanciaAxios().delete('/users/' + id)
                .then(function (response) {
                    // Redireciona para listagem de usuarios
                    window.location.href = urlListaUsuarios;
                    return;
                })
                .catch(function (error) {
                    // No caso de erro, apresentar na tela
                    exibirMensagemErro('Erro ao remover resultado de exame: ' + error.response.data.message);
                    return;
                });
            }
        })
        .catch(function (error) {
            // No caso de erro, apresentar na tela
            exibirMensagemErro('Erro ao verificar resultados de exames de usuario: ' + error.response.data.message);
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
    window.location.href = urlIndex;
    return;
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

function montarNavbarCabecalho(){
    // Se o usuario esta logado
    if (getJwtToken()) {
        document.getElementById('ul-navbar-cabecalho').innerHTML = `
        <li class="nav-item"><a class="nav-link text-white" href="${urlPainelUsuario}">${getUserAdmin() ? 'Painel Administrador' : 'Painel Usuário'}</a></li>
        <li class="nav-item"><a class="nav-link text-white" href="${urlEditaUsuario  + "?id=" + getUserId()}">Editar Perfil</a></li>        
        <li class="nav-item"><a class="nav-link text-white" href="javascript:void(0)" onclick = "javascript:logout()">Logout</a></li>
        `;        
    } else {
        document.getElementById('ul-navbar-cabecalho').innerHTML = `
        <li class="nav-item"><a class="nav-link text-white" href="${urlEditaUsuario}">Cadastre-se</a></li>
        <li class="nav-item"><a class="nav-link text-white" href="${urlLogin}">Login</a></li>
         `;        
    }
}

// Logica para montar painel de usuario com as opcoes as quais ele tem acesso
function montarPainelUsuario(){
    if (getUserAdmin()) {
        document.getElementById('div-header-acoes-usuario').innerText = 'Painel do Administrador';

        document.getElementById('div-acoes-usuario').innerHTML = `
        <a href="${urlListaUsuarios}" class="btn btn-primary mb-2">Listar usuarios</a><br>
        <a href="${urlListaResultadosExames}" class="btn btn-primary mb-2">Listar resultados de exames</a><br>
        <a href="${urlListaTiposExames}" class="btn btn-primary mb-2">Listar tipos de exames</a><br>
        <a href="${urlEditaUsuario}" class="btn btn-primary mb-2" >Cadastrar usuário</a><br>
        <a href="${urlEditaResultadoExame}" class="btn btn-primary mb-2" >Cadastrar resultado de exame</a><br>
        `;
    } else {
        document.getElementById('div-header-acoes-usuario').innerText = 'Painel do Usuário';

        document.getElementById('div-acoes-usuario').innerHTML = `
        <a id="link-resultados" href="${urlListaResultadosExames}" class="btn btn-primary mb-2">Ver meus exames</a><br>
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