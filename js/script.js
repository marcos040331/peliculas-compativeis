const formPesquisa = document.querySelector("#formPesquisa");
const campoPesquisa = document.querySelector("#campoPesquisa");
const mensagem = document.querySelector("#mensagem");
const listaResultados = document.querySelector("#listaResultados");
const quantidadeResultados = document.querySelector(
    "#quantidadeResultados"
);

const dadosTeste = [
    {
        modelo: "Samsung Galaxy A55",
        compativeis: "Samsung Galaxy A54 e Galaxy S23 FE"
    },
    {
        modelo: "Samsung Galaxy A15",
        compativeis: "Samsung Galaxy A14 5G"
    },
    {
        modelo: "Redmi Note 13",
        compativeis: "Redmi Note 13 4G"
    },
    {
        modelo: "iPhone 13",
        compativeis: "iPhone 13 Pro"
    }
];

function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function criarResultado(item) {
    return `
        <article class="resultado">
            <h3>📱 ${item.modelo}</h3>

            <p>
                <strong>Compatíveis:</strong>
                ${item.compativeis}
            </p>
        </article>
    `;
}

function exibirResultados(resultados) {
    quantidadeResultados.textContent =
        `${resultados.length} resultado${resultados.length === 1 ? "" : "s"}`;

    if (resultados.length === 0) {
        listaResultados.innerHTML = `
            <div class="estado-vazio">
                <div class="icone-vazio">😕</div>

                <h3>Nenhum modelo encontrado</h3>

                <p>
                    Verifique o nome digitado e tente novamente.
                </p>
            </div>
        `;

        return;
    }

    listaResultados.innerHTML = resultados
        .map(criarResultado)
        .join("");
}

function pesquisarModelo(termo) {
    const termoNormalizado = normalizarTexto(termo);

    return dadosTeste.filter((item) => {
        const modelo = normalizarTexto(item.modelo);
        const compativeis = normalizarTexto(item.compativeis);

        return (
            modelo.includes(termoNormalizado) ||
            compativeis.includes(termoNormalizado)
        );
    });
}

formPesquisa.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const termo = campoPesquisa.value.trim();

    if (termo.length < 2) {
        mensagem.textContent =
            "Digite pelo menos 2 caracteres para pesquisar.";

        campoPesquisa.focus();
        return;
    }

    mensagem.textContent = `Pesquisando por: ${termo}`;

    const resultados = pesquisarModelo(termo);

    exibirResultados(resultados);
});
