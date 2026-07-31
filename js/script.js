const campoPesquisa = document.querySelector("#campoPesquisa");
const mensagem = document.querySelector("#mensagem");
const listaResultados = document.querySelector("#listaResultados");
const contador = document.querySelector("#contador");
const btnLimpar = document.querySelector("#btnLimpar");
const btnTema = document.querySelector("#btnTema");
const btnInstalar = document.querySelector("#btnInstalar");

let peliculas = [];
let eventoInstalacao = null;
let temporizadorPesquisa = null;

function escaparHtml(texto) {
  return String(texto ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizarTexto(texto) {
  return String(texto ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function calcularPontuacao(item, termo) {
  const modelo = normalizarTexto(item.modelo);
  const compativeis = normalizarTexto(item.compativeis);
  const palavras = termo.split(" ").filter(Boolean);
  const textoCompleto = `${modelo} ${compativeis}`;

  if (!palavras.every(palavra => textoCompleto.includes(palavra))) {
    return -1;
  }

  let pontos = 0;

  if (modelo === termo) pontos += 200;
  if (modelo.startsWith(termo)) pontos += 120;
  if (modelo.includes(termo)) pontos += 80;
  if (compativeis.includes(termo)) pontos += 25;

  palavras.forEach(palavra => {
    if (modelo.split(" ").includes(palavra)) pontos += 15;
    else if (modelo.includes(palavra)) pontos += 8;
  });

  return pontos;
}

function pesquisar(termoDigitado) {
  const termo = normalizarTexto(termoDigitado);

  return peliculas
    .map(item => ({
      item,
      pontos: calcularPontuacao(item, termo)
    }))
    .filter(resultado => resultado.pontos >= 0)
    .sort((a, b) => b.pontos - a.pontos)
    .map(resultado => resultado.item);
}

function textoParaCopiar(item) {
  return `📱 ${item.modelo}\nCompatíveis: ${item.compativeis || "Não informado"}`;
}

async function copiarResultado(botao, indice) {
  const item = resultadosAtuais[indice];

  try {
    await navigator.clipboard.writeText(textoParaCopiar(item));
    const textoOriginal = botao.textContent;
    botao.textContent = "✅ Copiado";

    setTimeout(() => {
      botao.textContent = textoOriginal;
    }, 1600);
  } catch {
    alert(textoParaCopiar(item));
  }
}

let resultadosAtuais = [];

function exibirResultados(resultados) {
  resultadosAtuais = resultados;

  contador.textContent =
    `${resultados.length} resultado${resultados.length === 1 ? "" : "s"}`;

  if (!resultados.length) {
    listaResultados.innerHTML = `
      <div class="estado-vazio">
        <div class="icone-vazio">😕</div>
        <h3>Nenhum modelo encontrado</h3>
        <p>Tente escrever apenas parte do modelo, como A55, G54 ou iPhone 13.</p>
      </div>
    `;
    return;
  }

  listaResultados.innerHTML = resultados.map((item, indice) => `
    <article class="resultado">
      <div class="resultado-topo">
        <div>
          <h3>📱 ${escaparHtml(item.modelo)}</h3>
          <p>
            <strong>Compatíveis:</strong>
            ${escaparHtml(item.compativeis || "Nenhuma compatibilidade informada.")}
          </p>
        </div>

        <button class="btn-copiar" type="button" data-indice="${indice}">
          📋 Copiar
        </button>
      </div>
    </article>
  `).join("");

  document.querySelectorAll(".btn-copiar").forEach(botao => {
    botao.addEventListener("click", () => {
      copiarResultado(botao, Number(botao.dataset.indice));
    });
  });
}

function executarPesquisa() {
  const termo = campoPesquisa.value.trim();
  btnLimpar.hidden = termo.length === 0;

  if (termo.length < 2) {
    contador.textContent = "0 resultados";
    mensagem.textContent =
      `${peliculas.length} modelos carregados. Digite pelo menos 2 caracteres.`;

    listaResultados.innerHTML = `
      <div class="estado-vazio">
        <div class="icone-vazio">🔍</div>
        <h3>Comece uma pesquisa</h3>
        <p>Digite pelo menos 2 caracteres para consultar.</p>
      </div>
    `;
    return;
  }

  const resultados = pesquisar(termo);
  mensagem.textContent = `Pesquisa por: ${termo}`;
  exibirResultados(resultados);
}

async function carregarDados() {
  try {
    const resposta = await fetch("data/peliculas.json", { cache: "no-store" });

    if (!resposta.ok) {
      throw new Error(`Erro HTTP ${resposta.status}`);
    }

    peliculas = await resposta.json();
    mensagem.textContent =
      `${peliculas.length} modelos carregados. Digite para pesquisar.`;
  } catch (erro) {
    console.error(erro);
    mensagem.textContent = "Erro ao carregar a base de dados.";
    listaResultados.innerHTML = `
      <div class="estado-vazio">
        <div class="icone-vazio">⚠️</div>
        <h3>Não foi possível carregar os dados</h3>
        <p>Confirme se data/peliculas.json está no repositório.</p>
      </div>
    `;
  }
}

campoPesquisa.addEventListener("input", () => {
  clearTimeout(temporizadorPesquisa);
  temporizadorPesquisa = setTimeout(executarPesquisa, 180);
});

btnLimpar.addEventListener("click", () => {
  campoPesquisa.value = "";
  campoPesquisa.focus();
  executarPesquisa();
});

function aplicarTema(tema) {
  const escuro = tema === "escuro";
  document.body.classList.toggle("tema-escuro", escuro);
  btnTema.textContent = escuro ? "☀️" : "🌙";
  localStorage.setItem("tema", tema);
}

btnTema.addEventListener("click", () => {
  aplicarTema(
    document.body.classList.contains("tema-escuro") ? "claro" : "escuro"
  );
});

window.addEventListener("beforeinstallprompt", evento => {
  evento.preventDefault();
  eventoInstalacao = evento;
  btnInstalar.hidden = false;
});

btnInstalar.addEventListener("click", async () => {
  if (!eventoInstalacao) return;

  eventoInstalacao.prompt();
  await eventoInstalacao.userChoice;

  eventoInstalacao = null;
  btnInstalar.hidden = true;
});

window.addEventListener("appinstalled", () => {
  mensagem.textContent = "Aplicativo instalado com sucesso!";
  btnInstalar.hidden = true;
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js");
  });
}

aplicarTema(localStorage.getItem("tema") || "claro");
carregarDados();
