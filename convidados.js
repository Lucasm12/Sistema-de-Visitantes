// Verifica se o usuário está logado
let visitantes = [];

window.onload = function() {
    if (!sessionStorage.getItem('usuarioLogado')) {
        window.location.href = 'index.html';
    }
    document.getElementById('nomeUsuario').textContent = sessionStorage.getItem('usuarioLogado');
    
    // Carrega os dados do localStorage ao iniciar
    const dadosSalvos = localStorage.getItem('visitantes');
    if (dadosSalvos) {
        visitantes = JSON.parse(dadosSalvos);
    }
    
    carregarVisitantes();
    mostrarSecao('cadastro');
}

// Função para salvar visitante
document.getElementById('formVisitante').addEventListener('submit', function(e) {
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
    
    // Muda para a aba de lista
    mostrarSecao('lista');
});

function carregarVisitantes() {
    const tbody = document.querySelector('#tabelaVisitantes tbody');
    tbody.innerHTML = '';

    visitantes.forEach(visitante => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${visitante.nome}</td>
            <td>${visitante.evangelico === 'sim' ? 'Sim' : 'Não'}</td>
            <td>${visitante.igreja}</td>
            <td>${formatarData(visitante.dataVisita)}</td>
            <td>
                <button onclick="editarVisitante(${visitante.id})" class="acoes-btn editar-btn">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="excluirVisitante(${visitante.id})" class="acoes-btn excluir-btn">
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
    }
}

function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
}

function mostrarSecao(secaoId) {
    document.querySelectorAll('main section').forEach(section => {
        section.classList.add('hidden');
    });
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(secaoId).classList.remove('hidden');
    document.querySelector(`[onclick="mostrarSecao('${secaoId}')"]`).classList.add('active');
}

function fazerLogout() {
    sessionStorage.removeItem('usuarioLogado');
    window.location.href = 'index.html';
} 