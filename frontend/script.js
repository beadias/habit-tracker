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
      <span>Frequência: ${habito.frequencia}</span>
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