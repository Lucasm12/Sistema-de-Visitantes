// Variáveis globais
let visitantes = [];
let todosConvidados = [];

// Verifica qual página está sendo carregada
document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname;
    const isLoginPage = document.getElementById('loginForm') !== null;
    const isConvidadosPage = document.getElementById('formVisitante') !== null;
    
    if (isLoginPage) {
        setupLoginPage();
    } 
    else if (isConvidadosPage) {
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
    if (usuario === 'admin' && senha === '123456') {
        const loadingText = document.getElementById('loadingText');
        loadingText.textContent = 'Acesso permitido!';
        sessionStorage.setItem('usuarioLogado', usuario);
        setTimeout(() => {
            window.location.href = 'convidados.html';
        }, 500);
    } else {
        mostrarErroLogin();
    }
}

function mostrarErroLogin() {
    // Primeiro, limpa qualquer alerta existente
    const alertaExistente = document.querySelector('.alerta-erro');
    if (alertaExistente) {
        alertaExistente.remove();
    }

    // Reseta a exibição do formulário
    document.getElementById('progressContainer').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    
    // Cria o elemento de alerta
    const alertaErro = document.createElement('div');
    alertaErro.className = 'alerta-erro';
    alertaErro.innerHTML = `
        <div class="alerta-conteudo">
            <i class="fas fa-exclamation-circle"></i>
            <span>Usuário ou senha inválidos!</span>
            <button class="fechar-alerta">×</button>
        </div>
    `;
    
    // Adiciona ao corpo do documento
    document.body.appendChild(alertaErro);
    
    // Força um reflow para garantir que a animação funcione
    alertaErro.offsetHeight;
    
    // Adiciona a classe que torna o alerta visível
    alertaErro.classList.add('mostrar');
    
    // Adiciona evento para fechar o alerta
    const btnFechar = alertaErro.querySelector('.fechar-alerta');
    if (btnFechar) {
        btnFechar.addEventListener('click', () => {
            alertaErro.classList.remove('mostrar');
            setTimeout(() => alertaErro.remove(), 300);
        });
    }
    
    // Remove automaticamente após 3 segundos
    setTimeout(() => {
        if (alertaErro && alertaErro.parentElement) {
            alertaErro.classList.remove('mostrar');
            setTimeout(() => alertaErro.remove(), 300);
        }
    }, 3000);
}

// ========== FUNÇÕES DA PÁGINA DE CONVIDADOS ==========
function setupConvidadosPage() {
    if (!sessionStorage.getItem('usuarioLogado')) {
        window.location.href = 'index.html';
    }
    document.getElementById('nomeUsuario').textContent = sessionStorage.getItem('usuarioLogado');
    
    // Carrega os dados do localStorage ao iniciar
    const dadosSalvos = localStorage.getItem('visitantes');
    if (dadosSalvos) {
        visitantes = JSON.parse(dadosSalvos);
    }
    
    // Adiciona event listeners para os botões de navegação
    document.querySelectorAll('.nav-btn').forEach(button => {
        button.addEventListener('click', function() {
            const secao = this.getAttribute('data-section');
            mostrarSecao(secao);
        });
    });
    
    carregarVisitantes();
    atualizarContadores();
    mostrarSecao('cadastro');
}

function atualizarContadores() {
    // Total de visitantes
    const totalVisitantes = visitantes.length;
    document.getElementById('totalVisitantes').textContent = totalVisitantes;

    // Visitantes do mês atual
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    const visitantesMes = visitantes.filter(v => {
        const dataVisita = new Date(v.dataVisita);
        return dataVisita.getMonth() === mesAtual && dataVisita.getFullYear() === anoAtual;
    }).length;
    document.getElementById('visitantesMes').textContent = visitantesMes;

    // Total de evangélicos
    const totalEvangelicos = visitantes.filter(v => v.evangelico === 'sim').length;
    document.getElementById('totalEvangelicos').textContent = totalEvangelicos;

    // Total de acompanhantes
    const totalAcompanhantes = visitantes.reduce((total, v) => {
        return total + (parseInt(v.acompanhantes) || 0);
    }, 0);
    document.getElementById('totalAcompanhantes').textContent = totalAcompanhantes;
}

function filtrarVisitantes() {
    const pesquisaNome = document.getElementById('pesquisaNome').value.toLowerCase().trim();
    const dataInicial = document.getElementById('dataInicial').value;
    const dataFinal = document.getElementById('dataFinal').value;
    
    let visitantesFiltrados = [...visitantes];
    
    // Filtro por nome
    if (pesquisaNome) {
        visitantesFiltrados = visitantesFiltrados.filter(visitante => 
            visitante.nome.toLowerCase().includes(pesquisaNome)
        );
    }
    
    // Filtro por data
    if (dataInicial || dataFinal) {
        visitantesFiltrados = visitantesFiltrados.filter(visitante => {
            const dataVisita = new Date(visitante.dataVisita);
            dataVisita.setHours(0, 0, 0, 0); // Normaliza a hora para comparação

            if (dataInicial && dataFinal) {
                const inicio = new Date(dataInicial);
                inicio.setHours(0, 0, 0, 0);
                const fim = new Date(dataFinal);
                fim.setHours(23, 59, 59, 999);
                return dataVisita >= inicio && dataVisita <= fim;
            } else if (dataInicial) {
                const inicio = new Date(dataInicial);
                inicio.setHours(0, 0, 0, 0);
                return dataVisita >= inicio;
            } else if (dataFinal) {
                const fim = new Date(dataFinal);
                fim.setHours(23, 59, 59, 999);
                return dataVisita <= fim;
            }
            return true;
        });
    }
    
    carregarVisitantes(visitantesFiltrados);
    atualizarContadores();
}

function limparFiltros() {
    // Limpa os campos de filtro
    document.getElementById('pesquisaNome').value = '';
    document.getElementById('dataInicial').value = '';
    document.getElementById('dataFinal').value = '';
    
    // Recarrega todos os visitantes
    carregarVisitantes();
    atualizarContadores();
}

// Adiciona event listeners para os campos de data
document.getElementById('dataInicial')?.addEventListener('change', filtrarVisitantes);
document.getElementById('dataFinal')?.addEventListener('change', filtrarVisitantes);

// Adicionar pesquisa em tempo real por nome (opcional)
document.getElementById('pesquisaNome')?.addEventListener('input', function() {
    filtrarVisitantes();
});

function carregarVisitantes(listaVisitantes = visitantes) {
    const tbody = document.querySelector('#tabelaVisitantes');
    tbody.innerHTML = '';

    if (listaVisitantes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                    Nenhum visitante encontrado
                </td>
            </tr>
        `;
        return;
    }

    listaVisitantes.forEach(visitante => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50 transition-colors';
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="text-sm font-medium text-gray-900">${visitante.nome}</div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    visitante.evangelico === 'sim' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }">
                    ${visitante.evangelico === 'sim' ? 'Sim' : 'Não'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${visitante.igreja || '-'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex items-center gap-2">
                    <i class="fas fa-calendar-alt text-blue-500"></i>
                    <span>${formatarData(visitante.dataVisita)}</span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="editarVisitante(${visitante.id})" 
                        class="text-blue-600 hover:text-blue-900 mr-3">
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
function editarVisitante(id) {
    const visitante = visitantes.find(v => v.id === id);
    if(visitante) {
        document.getElementById('nome').value = visitante.nome;
        document.getElementById('evangelico').value = visitante.evangelico;
        document.getElementById('igreja').value = visitante.igreja;
        document.getElementById('dataVisita').value = visitante.dataVisita;
        document.getElementById('acompanhantes').value = visitante.acompanhantes;
        document.getElementById('observacoes').value = visitante.observacoes;
        document.getElementById('formVisitante').dataset.editando = id;
        mostrarSecao('cadastro');
    }
}

function excluirVisitante(id) {
    if(confirm('Tem certeza que deseja excluir este visitante?')) {
        visitantes = visitantes.filter(v => v.id !== id);
        localStorage.setItem('visitantes', JSON.stringify(visitantes));
        carregarVisitantes();
        atualizarContadores();
    }
}

function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
}

function mostrarSecao(secaoId) {
    // Esconde todas as seções
    const secoes = ['cadastro', 'lista', 'dashboard'];
    secoes.forEach(id => {
        const secao = document.getElementById(id);
        if (secao) {
            secao.classList.add('hidden');
        }
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
    const btnAtivo = document.querySelector(`[data-section="${secaoId}"]`);
    if (btnAtivo) {
        btnAtivo.classList.add('bg-blue-700/50');
    }
}

function fazerLogout() {
    sessionStorage.removeItem('usuarioLogado');
    window.location.href = 'index.html';
}

function atualizarDashboard() {
    // Atualiza os contadores
    const totalVisitantes = visitantes.length;
    document.getElementById('totalVisitantes').textContent = totalVisitantes;

    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    const visitantesMes = visitantes.filter(v => {
        const dataVisita = new Date(v.dataVisita);
        return dataVisita.getMonth() === mesAtual && dataVisita.getFullYear() === anoAtual;
    }).length;
    document.getElementById('visitantesMes').textContent = visitantesMes;

    const totalEvangelicos = visitantes.filter(v => v.evangelico === 'sim').length;
    document.getElementById('totalEvangelicos').textContent = totalEvangelicos;

    const totalAcompanhantes = visitantes.reduce((total, v) => {
        return total + (parseInt(v.acompanhantes) || 0);
    }, 0);
    document.getElementById('totalAcompanhantes').textContent = totalAcompanhantes;

    // Gráfico de Visitantes por Mês
    const visitantesPorMes = obterVisitantesPorMes();
    criarGraficoVisitantesPorMes(visitantesPorMes);

    // Gráfico de Evangélicos vs Não Evangélicos
    const dadosEvangelicos = {
        evangelicos: totalEvangelicos,
        naoEvangelicos: totalVisitantes - totalEvangelicos
    };
    criarGraficoEvangelicos(dadosEvangelicos);

    // Gráfico de Igrejas mais frequentes
    const igrejasMaisFrequentes = obterIgrejasMaisFrequentes();
    criarGraficoIgrejas(igrejasMaisFrequentes);
}

function obterVisitantesPorMes() {
    const meses = {};
    const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    visitantes.forEach(visitante => {
        const data = new Date(visitante.dataVisita);
        const mesAno = `${nomesMeses[data.getMonth()]}/${data.getFullYear()}`;
        meses[mesAno] = (meses[mesAno] || 0) + 1;
    });

    return meses;
}

function criarGraficoVisitantesPorMes(dados) {
    const ctx = document.getElementById('graficoVisitantes').getContext('2d');
    
    // Destruir gráfico existente se houver
    if (window.graficoVisitantes) {
        window.graficoVisitantes.destroy();
    }

    window.graficoVisitantes = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(dados),
            datasets: [{
                label: 'Visitantes por Mês',
                data: Object.values(dados),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Evolução de Visitantes'
                }
            }
        }
    });
}

function criarGraficoEvangelicos(dados) {
    const ctx = document.getElementById('graficoEvangelicos').getContext('2d');
    
    if (window.graficoEvangelicos) {
        window.graficoEvangelicos.destroy();
    }

    window.graficoEvangelicos = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Evangélicos', 'Não Evangélicos'],
            datasets: [{
                data: [dados.evangelicos, dados.naoEvangelicos],
                backgroundColor: ['#3b82f6', '#e11d48']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Distribuição de Evangélicos'
                }
            }
        }
    });
}

function obterIgrejasMaisFrequentes() {
    const igrejas = {};
    visitantes.forEach(visitante => {
        if (visitante.igreja) {
            igrejas[visitante.igreja] = (igrejas[visitante.igreja] || 0) + 1;
        }
    });

    // Ordenar e pegar as 5 mais frequentes
    return Object.entries(igrejas)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
        }, {});
}

function criarGraficoIgrejas(dados) {
    const ctx = document.getElementById('graficoIgrejas').getContext('2d');
    
    if (window.graficoIgrejas) {
        window.graficoIgrejas.destroy();
    }

    window.graficoIgrejas = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(dados),
            datasets: [{
                label: 'Visitantes por Igreja',
                data: Object.values(dados),
                backgroundColor: '#3b82f6'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Igrejas mais Frequentes'
                }
            }
        }
    });
} 
