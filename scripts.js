// Variáveis globais
let visitantes = [];
let todosConvidados = [];

// Verifica qual página está sendo carregada
document.addEventListener('DOMContentLoaded', function() {
    // Verifica se está na página de login
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        setupLoginPage();
    } 
    // Verifica se está na página de convidados
    else if (window.location.pathname.includes('convidados.html')) {
        setupConvidadosPage();
    }
});

// ========== FUNÇÕES DA PÁGINA DE LOGIN ==========
function setupLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

function handleLogin(event) {
    event.preventDefault();
    
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('progressContainer').style.display = 'block';
    
    iniciarBarraProgresso(usuario, senha);
}

function iniciarBarraProgresso(usuario, senha) {
    let progresso = 0;
    const progressBar = document.getElementById('progressBar');
    const loadingText = document.getElementById('loadingText');
    
    const intervalo = setInterval(() => {
        progresso += 5;
        progressBar.style.width = progresso + '%';
        progressBar.setAttribute('aria-valuenow', progresso);
        
        atualizarMensagemProgresso(progresso, loadingText);
        
        if (progresso >= 100) {
            clearInterval(intervalo);
            finalizarLogin(usuario, senha);
        }
    }, 100);
}

function atualizarMensagemProgresso(progresso, loadingText) {
    if (progresso < 30) {
        loadingText.textContent = 'Verificando credenciais...';
    } else if (progresso < 60) {
        loadingText.textContent = 'Carregando dados...';
    } else if (progresso < 90) {
        loadingText.textContent = 'Finalizando...';
    }
}

function finalizarLogin(usuario, senha) {
    const loadingText = document.getElementById('loadingText');
    loadingText.textContent = 'Acesso permitido!';
    
    if (usuario === 'admin' && senha === '123456') {
        sessionStorage.setItem('usuarioLogado', usuario);
        setTimeout(() => {
            window.location.href = 'convidados.html';
        }, 500);
    } else {
        mostrarErroLogin();
    }
}

function mostrarErroLogin() {
    document.getElementById('progressContainer').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    alert('Usuário ou senha inválidos! Use admin/123456');
}

// ========== FUNÇÕES DA PÁGINA DE CONVIDADOS ==========
function setupConvidadosPage() {
    if (!sessionStorage.getItem('usuarioLogado')) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('nomeUsuario').textContent = sessionStorage.getItem('usuarioLogado');
    
    // Carrega os dados salvos
    const dadosSalvos = localStorage.getItem('visitantes');
    if (dadosSalvos) {
        visitantes = JSON.parse(dadosSalvos);
    }
    
    // Configura os botões de navegação
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const secao = this.getAttribute('data-section');
            mostrarSecao(secao);
        });
    });

    // Configura o formulário
    const formVisitante = document.getElementById('formVisitante');
    if (formVisitante) {
        formVisitante.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const visitante = {
                id: Date.now(),
                nome: document.getElementById('nome').value,
                evangelico: document.getElementById('evangelico').value,
                igreja: document.getElementById('igreja').value,
                dataVisita: document.getElementById('dataVisita').value,
                acompanhantes: document.getElementById('acompanhantes').value,
                observacoes: document.getElementById('observacoes').value
            };

            if(this.dataset.editando) {
                // Editando visitante existente
                const id = parseInt(this.dataset.editando);
                const index = visitantes.findIndex(v => v.id === id);
                if (index !== -1) {
                    visitantes[index] = {...visitantes[index], ...visitante};
                }
                delete this.dataset.editando;
            } else {
                // Novo visitante
                visitantes.push(visitante);
            }

            // Salva no localStorage
            localStorage.setItem('visitantes', JSON.stringify(visitantes));
            
            // Limpa o formulário
            this.reset();
            
            // Atualiza a tabela
            carregarVisitantes();
            
            // Mostra mensagem de sucesso
            alert('Visitante salvo com sucesso!');
            
            // Atualiza as estatísticas
            atualizarEstatisticas();
            
            // Muda para a aba de lista
            mostrarSecao('lista');
        });
    }

    // Carrega a lista inicial e estatísticas
    carregarVisitantes();
    atualizarEstatisticas();
    mostrarSecao('cadastro');

    // Atualiza a data atual
    const dataAtual = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('dataAtual').textContent = dataAtual;

    // Configurar filtros
    const filtroNome = document.getElementById('filtroNome');
    const filtroData = document.getElementById('filtroData');
    const limparFiltros = document.getElementById('limparFiltros');

    if (filtroNome) {
        filtroNome.addEventListener('input', aplicarFiltros);
    }
    if (filtroData) {
        filtroData.addEventListener('change', aplicarFiltros);
    }
    if (limparFiltros) {
        limparFiltros.addEventListener('click', () => {
            filtroNome.value = '';
            filtroData.value = '';
            aplicarFiltros();
        });
    }
}

function aplicarFiltros() {
    const nome = document.getElementById('filtroNome').value.toLowerCase();
    const data = document.getElementById('filtroData').value;
    
    const visitantesFiltrados = visitantes.filter(visitante => {
        const nomeMatch = visitante.nome.toLowerCase().includes(nome);
        const dataMatch = !data || visitante.dataVisita === data;
        return nomeMatch && dataMatch;
    });

    const tbody = document.querySelector('#tabelaVisitantes tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if (visitantesFiltrados.length === 0) {
        // Mostrar mensagem quando não houver resultados
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                <div class="flex flex-col items-center justify-center py-4">
                    <i class="fas fa-search mb-2 text-2xl"></i>
                    <p>Nenhum visitante encontrado</p>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
        return;
    }

    visitantesFiltrados.forEach(visitante => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${visitante.nome}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    visitante.evangelico === 'sim' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }">
                    ${visitante.evangelico === 'sim' ? 'Sim' : 'Não'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${visitante.igreja || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatarData(visitante.dataVisita)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button onclick="editarVisitante(${visitante.id})" 
                        class="text-blue-600 hover:text-blue-900">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="excluirVisitante(${visitante.id})" 
                        class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function carregarVisitantes() {
    aplicarFiltros();
}

function atualizarEstatisticas() {
    const totalVisitantes = visitantes.length;
    const visitantesMes = visitantes.filter(v => {
        const dataVisita = new Date(v.dataVisita);
        const hoje = new Date();
        return dataVisita.getMonth() === hoje.getMonth() && 
               dataVisita.getFullYear() === hoje.getFullYear();
    }).length;
    
    const evangelicos = visitantes.filter(v => v.evangelico === 'sim').length;
    const totalAcompanhantes = visitantes.reduce((total, v) => total + parseInt(v.acompanhantes || 0), 0);

    document.getElementById('totalVisitantes').textContent = totalVisitantes;
    document.getElementById('visitantesMes').textContent = visitantesMes;
    document.getElementById('totalEvangelicos').textContent = evangelicos;
    document.getElementById('totalAcompanhantes').textContent = totalAcompanhantes;
}

function editarVisitante(id) {
    const visitante = visitantes.find(v => v.id === id);
    if(visitante) {
        preencherFormulario(visitante);
        document.getElementById('formVisitante').dataset.editando = id;
        mostrarSecao('cadastro');
    }
}

function preencherFormulario(visitante) {
    document.getElementById('nome').value = visitante.nome;
    document.getElementById('evangelico').value = visitante.evangelico;
    document.getElementById('igreja').value = visitante.igreja;
    document.getElementById('dataVisita').value = visitante.dataVisita;
    document.getElementById('acompanhantes').value = visitante.acompanhantes;
    document.getElementById('observacoes').value = visitante.observacoes;
}

function excluirVisitante(id) {
    if(confirm('Tem certeza que deseja excluir este visitante?')) {
        visitantes = visitantes.filter(v => v.id !== id);
        localStorage.setItem('visitantes', JSON.stringify(visitantes));
        carregarVisitantes();
        alert('Visitante excluído com sucesso!');
    }
}

function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
}

function mostrarSecao(secaoId) {
    // Esconde todas as seções
    document.querySelectorAll('main section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Remove a classe active de todos os botões
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-blue-700/50');
    });
    
    // Mostra a seção selecionada
    const secaoAtual = document.getElementById(secaoId);
    if (secaoAtual) {
        secaoAtual.classList.remove('hidden');
    }
    
    // Adiciona a classe active ao botão selecionado
    const botaoAtual = document.querySelector(`[data-section="${secaoId}"]`);
    if (botaoAtual) {
        botaoAtual.classList.add('bg-blue-700/50');
    }

    // Atualiza o título do cabeçalho
    const titulos = {
        'cadastro': 'Novo Visitante',
        'lista': 'Lista de Visitantes',
        'dashboard': 'Dashboard'
    };
    document.querySelector('header h2').textContent = titulos[secaoId] || 'Dashboard';
}

function fazerLogout() {
    sessionStorage.removeItem('usuarioLogado');
    window.location.href = 'index.html';
} 