const API_URL = 'http://localhost:3000/habitos';

const form = document.getElementById('formHabito');
const listaHabitos = document.getElementById('listaHabitos');

async function listarHabitos() {
  const resposta = await fetch(API_URL);
  const habitos = await resposta.json();

  listaHabitos.innerHTML = '';

  habitos.forEach((habito) => {
    const item = document.createElement('div');
    item.classList.add('habito');

    item.innerHTML = `
  <strong>${habito.nome}</strong><br>
  <span>Frequência: ${habito.frequencia}</span><br><br>
  <button onclick="abrirModal(${habito.id}, '${habito.nome}', '${habito.frequencia}')">Editar</button>
`;

    listaHabitos.appendChild(item);
  });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const nome = document.getElementById('nome').value;
  const frequencia = document.getElementById('frequencia').value;

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

listarHabitos();

async function editarHabito(id) {
    const novoNome = prompt('Novo nome do hábito:');
    const novaFrequencia = prompt('Nova frequência:');
  
    if (!novoNome || !novaFrequencia) return;
  
    await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nome: novoNome,
        frequencia: novaFrequencia
      })
    });
  
    listarHabitos();
  }

  let habitoAtualId = null;

function abrirModal(id, nome, frequencia) {
  habitoAtualId = id;

  document.getElementById('editNome').value = nome;
  document.getElementById('editFrequencia').value = frequencia;

  document.getElementById('modal').classList.remove('hidden');
}

function fecharModal() {
  document.getElementById('modal').classList.add('hidden');
}

async function salvarEdicao() {
  const nome = document.getElementById('editNome').value;
  const frequencia = document.getElementById('editFrequencia').value;

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