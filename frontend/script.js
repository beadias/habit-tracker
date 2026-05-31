const API_URL = 'http://localhost:3000/habitos';

const form = document.getElementById('formHabito');
const listaHabitos = document.getElementById('listaHabitos');

let habitoAtualId = null;

const frequenciaSelect = document.getElementById('frequencia');

const opcoesDiario = document.getElementById('opcoesDiario');
const opcoesSemanal = document.getElementById('opcoesSemanal');

frequenciaSelect.addEventListener('change', () => {

    const valor = frequenciaSelect.value;
  
    opcoesDiario.classList.add('hidden');
    opcoesSemanal.classList.add('hidden');
  
    if (valor === 'Diário') {
      opcoesDiario.classList.remove('hidden');
    }
  
    if (valor === 'Semanal') {
      opcoesSemanal.classList.remove('hidden');
    }
  
  });

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

    const porcentagem = habito.meta_diaria
  ? Math.round((habito.progresso_atual / habito.meta_diaria) * 100)
  : 0;

    item.innerHTML = `

  <div>

    <strong class="${habito.concluido ? 'concluido' : ''}">
      ${habito.nome}
    </strong>

    <span>Frequência: ${habito.frequencia}</span>

    ${
      habito.frequencia === 'Diário'
      ? `
        <p class="meta">
          Meta diária: ${habito.meta_diaria}x
        </p>

        <p class="progresso-texto">
          Hoje: ${habito.progresso_atual}/${habito.meta_diaria}
        </p>

        <div class="barra-progresso">
          <div 
            class="progresso"
            style="width: ${porcentagem}%"
          ></div>
        </div>

        <p class="porcentagem">
          ${porcentagem}% concluído
        </p>
      `
      : ''
    }

    ${
      habito.frequencia === 'Semanal'
      ? `
        <p class="dias-semana-card">
          ${habito.dias_semana.join(' • ')}
        </p>
      `
      : ''
    }

    ${
      habito.concluido
      ? '<p class="status-concluido">Concluído ✅</p>'
      : ''
    }

  </div>

  <div class="acoes">

    <button 
      class="btn-concluir"
      onclick="concluirHabito(${habito.id})"
    >
      Registrar
    </button>

    <button 
      class="btn-editar"
      onclick="abrirModal(
        ${habito.id},
        '${habito.nome}',
        '${habito.frequencia}'
      )"
    >
      Editar
    </button>

    <button 
      class="btn-excluir"
      onclick="excluirHabito(${habito.id})"
    >
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
  
    let meta_diaria = null;
    let dias_semana = [];
  
    if (frequencia === 'Diário') {
      meta_diaria = document.getElementById('metaDiaria').value;
    }
  
    if (frequencia === 'Semanal') {
  
      const checkboxes = document.querySelectorAll(
        '.dias-checkbox input:checked'
      );
  
      dias_semana = Array.from(checkboxes).map(
        checkbox => checkbox.value
      );
    }
  
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
  
      body: JSON.stringify({
        nome,
        frequencia,
        meta_diaria,
        dias_semana
      })
    });
  
    form.reset();
  
    opcoesDiario.classList.add('hidden');
    opcoesSemanal.classList.add('hidden');
  
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
let habitoParaExcluirId = null;

function excluirHabito(id) {
  habitoParaExcluirId = id;
  document.getElementById('modalExcluir').classList.remove('hidden');
}

function fecharModalExcluir() {
  document.getElementById('modalExcluir').classList.add('hidden');
  habitoParaExcluirId = null;
}

async function confirmarExclusao() {
  if (!habitoParaExcluirId) return;

  await fetch(`${API_URL}/${habitoParaExcluirId}`, {
    method: 'DELETE'
  });

  fecharModalExcluir();
  listarHabitos();
}

// Marcar hábito como concluido
async function concluirHabito(id) {
    await fetch(`${API_URL}/${id}/progresso`, {
      method: 'PATCH'
    });
  
    listarHabitos();
  }

  // Página de histórico
  function mostrarAba(aba) {
    document.getElementById('abaRegistro').classList.add('hidden');
    document.getElementById('abaHistorico').classList.add('hidden');
  
    document.querySelectorAll('.aba').forEach(botao => {
      botao.classList.remove('ativa');
    });
  
    if (aba === 'registro') {
      document.getElementById('abaRegistro').classList.remove('hidden');
      document.querySelectorAll('.aba')[0].classList.add('ativa');
    }
  
    if (aba === 'historico') {
      document.getElementById('abaHistorico').classList.remove('hidden');
      document.querySelectorAll('.aba')[1].classList.add('ativa');
      carregarHistorico();
    }
  }
  
  async function carregarHistorico() {

    const resposta = await fetch('http://localhost:3000/historico');
  
    const historico = await resposta.json();
  
    const listaHistorico = document.getElementById('listaHistorico');
  
    listaHistorico.innerHTML = '';
  
    listaHistorico.innerHTML += `
  
      <div class="resumo-historico">
  
        <div class="card-resumo">
          <h3>Hoje</h3>
          <p>${historico.totalHoje}</p>
        </div>
  
        <div class="card-resumo">
          <h3>Últimos 7 dias</h3>
          <p>${historico.totalSemana}</p>
        </div>
  
      </div>
  
    `;
  
    listaHistorico.innerHTML += `
      <h3 class="titulo-registros">
        Últimos registros
      </h3>
    `;
  
    historico.registros.forEach((registro) => {
  
      const data = new Date(
        registro.data_conclusao
      ).toLocaleDateString('pt-BR');
  
      const item = document.createElement('div');
  
      item.classList.add('historico-item');
  
      item.innerHTML = `
        <strong>${registro.nome}</strong>
  
        <span>
          Registrado em: ${data}
        </span>
      `;
  
      listaHistorico.appendChild(item);
  
    });
  
  }
