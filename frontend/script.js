const API_URL = 'http://localhost:3000/habitos';

const form = document.getElementById('formHabito');
const listaHabitos = document.getElementById('listaHabitos');

let habitoAtualId = null;

// Tela inicial
function iniciarSistema() {
  const nome = document.getElementById('nomeUsuario').value;
  const idade = document.getElementById('idadeUsuario').value;

  if (!nome || !idade) {
    alert('Preencha nome e idade!');
    return;
  }

  document.getElementById('telaInicial').classList.add('hidden');
  document.getElementById('sistema').classList.remove('hidden');

  document.getElementById('boasVindas').innerText =
    `Bem-vindo, ${nome}! Vamos começar a registrar seus hábitos?`;

  document.getElementById('idade').innerText = `Idade: ${idade}`;

  const hoje = new Date();
  const dataFormatada = hoje.toLocaleDateString('pt-BR');
  document.getElementById('dataHoje').innerText = `Data: ${dataFormatada}`;

  listarHabitos();
}

// Listar hábitos
async function listarHabitos() {
  const resposta = await fetch(API_URL);
  const habitos = await resposta.json();

  listaHabitos.innerHTML = '';

  if (habitos.length === 0) {
    listaHabitos.innerHTML = '<p>Nenhum hábito cadastrado ainda.</p>';
    return;
  }

  habitos.forEach((habito) => {
    const item = document.createElement('div');
    item.classList.add('habito');

    item.innerHTML = `
      <div>
        <strong>${habito.nome}</strong>
        <span>Frequência: ${habito.frequencia}</span>
      </div>

      <div class="acoes">
        <button class="btn-editar" onclick="abrirModal(${habito.id}, '${habito.nome}', '${habito.frequencia}')">
          Editar
        </button>

        <button class="btn-excluir" onclick="excluirHabito(${habito.id})">
          Excluir
        </button>
      </div>
    `;

    listaHabitos.appendChild(item);
  });
}

// Cadastrar hábito
form.addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const nome = document.getElementById('nome').value.trim();
    const frequencia = document.getElementById('frequencia').value;
  
    const resposta = await fetch(API_URL);
    const habitos = await resposta.json();
  
    const habitoExiste = habitos.some(
      (habito) => habito.nome.toLowerCase() === nome.toLowerCase()
    );
  
    if (habitoExiste) {
      alert('Este hábito já foi cadastrado!');
      return;
    }
  
    await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome, frequencia })
    });
  
    form.reset();
    listarHabitos();
  });

// Abrir modal de edição
function abrirModal(id, nome, frequencia) {
  habitoAtualId = id;

  document.getElementById('editNome').value = nome;
  document.getElementById('editFrequencia').value = frequencia;

  document.getElementById('modal').classList.remove('hidden');
}

// Fechar modal
function fecharModal() {
  document.getElementById('modal').classList.add('hidden');
}

// Salvar edição
async function salvarEdicao() {
    const nome = document.getElementById('editNome').value.trim();
    const frequencia = document.getElementById('editFrequencia').value;
  
    if (!nome || !frequencia) {
      alert('Preencha todos os campos!');
      return;
    }
  
    await fetch(`${API_URL}/${habitoAtualId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome, frequencia })
    });
  
    fecharModal();
    listarHabitos();
  }
  
// Excluir hábito
async function excluirHabito(id) {
  const confirmar = confirm('Deseja excluir este hábito?');

  if (!confirmar) return;

  await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });

  listarHabitos();
}