document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    
    // Usuário e senha definidos
    const usuarioCorreto = "admin";
    const senhaCorreta = "123456";
    
    // Verificação do login
    if(usuario === usuarioCorreto && senha === senhaCorreta) {
        // Salvar informação do usuário logado
        sessionStorage.setItem('usuarioLogado', usuario);
        // Redirecionar para a página de convidados
        window.location.replace('convidados.html');
        // Alternativa: window.location.href = './convidados.html';
    } else {
        alert("Usuário ou senha incorretos!");
    }
}); 