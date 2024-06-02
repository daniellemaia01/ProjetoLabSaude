// Base URL do Backend
const BASE_URL_BACKEND = 'http://localhost:5000';

// URLs das paginas HTML
const URL_EDITA_RESULTADO_EXAME = 'edita_resultado_exame.html';
const URL_EDITA_USUARIO = 'edita_usuario.html';
const URL_EDITA_TIPO_EXAME = 'edita_tipo_exame.html';
const URL_INDEX = 'index.html';
const URL_LISTA_RESULTADOS_EXAMES = 'lista_resultados_exames.html';
const URL_LISTA_TIPOS_EXAMES = 'lista_tipos_exames.html';
const URL_LISTA_USUARIOS = 'lista_usuarios.html';
const URL_LOGIN = 'login.html';
const URL_PAINEL_USUARIO = 'painel_usuario.html';

// Exibir mensagem de erro na tela (com id erro-msg posicionado no html)
function exibirMensagemErro(mensagemErro) {
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
            baseURL: BASE_URL_BACKEND,
            headers: {
                'Authorization': `Bearer ${getJwtToken()}`
            }
        })
    } else {
        return axios.create({
            baseURL: BASE_URL_BACKEND
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
                        window.location.href = URL_LISTA_USUARIOS;
                    } else {
                        // Se nao eh admin redireciona para pagina de login
                        window.location.href = URL_LOGIN;
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
                        window.location.href = URL_LISTA_USUARIOS;
                    } else {
                        // Se nao eh admin redireciona para pagina inicial de usuario
                        window.location.href = URL_PAINEL_USUARIO;
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


// Para criar ou editar um resultado de exame
function editaResultadoExame() {

    // Somente administrador pode criar ou editar resultado de exame
    if (!getUserAdmin()) {
        window.location.href = URL_INDEX;
        return;
    }

    let usuarios;
    let tiposExames;

    // Recuparando lista de usuarios para exibir no select de usuarios
    getInstanciaAxios().get('/users?limit=1000&offset=0')
        .then(function (response) {
            // Na obtencao de usuarios com sucesso
            usuarios = response.data.users;

            // Popule o select com os dados dos usuários
            const selectUsuarios = document.getElementById('select-usuarios');

            // Itera sobre a lista de usuários e cria as opções
            usuarios.forEach(usuario => {
                const option = document.createElement('option');
                option.value = usuario._id; 
                option.textContent =  `${usuario.nome}(${usuario.email})`; 
                selectUsuarios.appendChild(option);
            });            
        })
        .catch(function (error) {
            // No caso de erro, apresentar na tela
            exibirMensagemErro('Erro ao obter lista de usuários: ' + error.response.data.message);
            return;
        });

    // Recuparando lista de tipos de exames para exibir no select de tipos de exames
    getInstanciaAxios().get('/examType?limit=1000&offset=0')
        .then(function (response) {
            // Na obtencao de tipos de exames com sucesso
            const tiposExames = response.data;

            // Popule o select com os dados de tipos de exames
            const selectTiposExames = document.getElementById('select-tipos-exames');

            // Itera sobre a lista de tipos de exames e cria as opções
            tiposExames.forEach(tipoExame => {
                const option = document.createElement('option');
                option.value = tipoExame._id; 
                option.textContent = `${tipoExame.nomeExame}`; 
                selectTiposExames.appendChild(option);
            });            
        })
        .catch(function (error) {
            // No caso de erro, apresentar na tela
            exibirMensagemErro('Erro ao obter lista de tipos de exames: ' + error.response.data.message);
            return;
        });

    // Verificando se foi passado id de resultado de exame para edicao
    let idResultadoExameEdicao = getURLParamValue("id");

    // Caso usuario esteja editando um resultado 
    if (idResultadoExameEdicao) {

        // Recuperar os dados do resultado do exame e popular no formulario
        getInstanciaAxios().get('/exam/' + idResultadoExameEdicao)
            .then(function (response) {
                // Na obtencao de resultado de exame com sucesso
                let resultadoExameEdicao = response.data;

                document.getElementById('_id').value = resultadoExameEdicao._id;
                document.getElementById('select-usuarios').value = resultadoExameEdicao.usuarioId._id;
                document.getElementById('select-tipos-exames').value = resultadoExameEdicao.tipoExameId._id;                
                document.getElementById('data-coleta').value = formatarDataParaFrontend(resultadoExameEdicao.dataColeta);
                document.getElementById('resultado').value = resultadoExameEdicao.resultado;
            })
            .catch(function (error) {
                exibirMensagemErro('Erro ao recuperar resultado de exame: ' + error.response.data.message);
                return;
            });
    } else {
        // Caso esteja criando um resultado de exame, escondendo div do campo id
        document.getElementById('div-id').style = "display: none";
    }

    // Para quando clicar no botao de enviar formulario
    document.getElementById('resultadoExameForm').addEventListener('submit', function (event) {
        // Evita o envio padrão do formulário
        event.preventDefault();

        // Obter os valores dos campos de resultado de usuario
        let usuarioId = document.getElementById('select-usuarios').value;
        let tipoExameId = document.getElementById('select-tipos-exames').value;
        let dataColeta = document.getElementById('data-coleta').value;
        let resultado = document.getElementById('resultado').value;

        if (idResultadoExameEdicao == null) {
            // Chamando endpoint do backend para criar resultado de exame
            getInstanciaAxios().post('/exam', {
                usuarioId: usuarioId,
                tipoExameId: tipoExameId,
                dataColeta: dataColeta,
                resultado: resultado
            })
                .then(function (response) {
                    // Redireciona para listagem de resultados de exames
                    window.location.href = URL_LISTA_RESULTADOS_EXAMES;
                    return;
                })
                .catch(function (error) {
                    exibirMensagemErro('Erro ao cadastrar resultado de exame: ' + error.response.data.message);
                    return;
                });
        } else {
            // Chamando endpoint do backend para editar resultado de exame
            getInstanciaAxios().put('/exam/'+idResultadoExameEdicao, {
                usuarioId: usuarioId,
                tipoExameId: tipoExameId,
                dataColeta: dataColeta,
                resultado: resultado
            })
            .then(function (response) {
                // Redireciona para listagem de resultados de exames
                window.location.href = URL_LISTA_RESULTADOS_EXAMES;
                return;
            })
            .catch(function (error) {
                exibirMensagemErro('Erro ao atualizar resultado de exame: ' + error.response.data.message);
                return;
            });
        }
    });


}


// Para fazer login de usuario
function login() {
    // Se usuario ja esta logado redireciona ele para painel do usuario
    if (getJwtToken()) {
        window.location.href = URL_PAINEL_USUARIO;
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
                window.location.href = URL_PAINEL_USUARIO;
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
                <td><a href="${URL_EDITA_USUARIO}?id=${usuario._id}" class="btn btn-primary">Editar</a>
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
                <!--<td><a href="${URL_EDITA_TIPO_EXAME}?id=${tipoExame._id}" class="btn btn-primary">Editar</a>
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
                    <td><a href="${URL_EDITA_RESULTADO_EXAME}?id=${resultadoExame._id}" class="btn btn-primary">Editar</a>
                    <a href="javascript:void(0)" onclick="javascript:removerResultadoExame('${resultadoExame._id}')"  class="btn btn-primary">Apagar</a></td>`;
                } else {
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
            window.location.href = URL_LISTA_RESULTADOS_EXAMES;
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
    // Remove usuario da base
    getInstanciaAxios().delete('/users/' + id)
        .then(function (response) {
            // Redireciona para listagem de usuarios
            window.location.href = URL_LISTA_USUARIOS;
            return;
        })
        .catch(function (error) {
            // No caso de erro, apresentar na tela
            exibirMensagemErro('Erro ao remover usuário: ' + error.response.data.message);
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
    window.location.href = URL_INDEX;
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

function montarNavbarCabecalho() {
    // Se o usuario esta logado
    if (getJwtToken()) {
        document.getElementById('ul-navbar-cabecalho').innerHTML = `
        <li class="nav-item"><a class="nav-link text-white" href="${URL_PAINEL_USUARIO}">${getUserAdmin() ? 'Painel Administrador' : 'Painel Usuário'}</a></li>
        <li class="nav-item"><a class="nav-link text-white" href="${URL_EDITA_USUARIO + "?id=" + getUserId()}">Editar Perfil</a></li>        
        <li class="nav-item"><a class="nav-link text-white" href="javascript:void(0)" onclick = "javascript:logout()">Logout</a></li>
        `;
    } else {
        document.getElementById('ul-navbar-cabecalho').innerHTML = `
        <li class="nav-item"><a class="nav-link text-white" href="${URL_EDITA_USUARIO}">Cadastre-se</a></li>
        <li class="nav-item"><a class="nav-link text-white" href="${URL_LOGIN}">Login</a></li>
         `;
    }
}

// Logica para montar painel de usuario com as opcoes as quais ele tem acesso
function montarPainelUsuario() {
    if (getUserAdmin()) {
        document.getElementById('div-header-acoes-usuario').innerText = 'Painel do Administrador';

        document.getElementById('div-acoes-usuario').innerHTML = `
        <a href="${URL_LISTA_USUARIOS}" class="btn btn-primary mb-2">Listar usuarios</a><br>
        <a href="${URL_LISTA_RESULTADOS_EXAMES}" class="btn btn-primary mb-2">Listar resultados de exames</a><br>
        <a href="${URL_LISTA_TIPOS_EXAMES}" class="btn btn-primary mb-2">Listar tipos de exames</a><br>
        <a href="${URL_EDITA_USUARIO}" class="btn btn-primary mb-2" >Cadastrar usuário</a><br>
        <a href="${URL_EDITA_RESULTADO_EXAME}" class="btn btn-primary mb-2" >Cadastrar resultado de exame</a><br>
        `;
    } else {
        document.getElementById('div-header-acoes-usuario').innerText = 'Painel do Usuário';

        document.getElementById('div-acoes-usuario').innerHTML = `
        <a id="link-resultados" href="${URL_LISTA_RESULTADOS_EXAMES}" class="btn btn-primary mb-2">Ver meus exames</a><br>
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