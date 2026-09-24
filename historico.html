
// ==========================================
// CONFIGURAÇÕES DA API
// ==========================================

const API_STATUS =
  "https://symmetrical-space-sniffle-x95x5xw4799hvv47-3000.app.github.dev/api/status";

const API_HISTORICO =
  "https://symmetrical-space-sniffle-x95x5xw4799hvv47-3000.app.github.dev/api/historico";


// ==========================================
// ESTAÇÕES CADASTRADAS
// ==========================================

const ESTACOES = [
  { id: "all", nome: "Todas as estações" },
  { id: "ESP32 01", nome: "Estação 01" },
  { id: "ESP32 02", nome: "Estação 02" },
  { id: "ESP32 03", nome: "Estação 03" },
  { id: "ESP32 04", nome: "Estação 04" },
  { id: "ESP32 05", nome: "Estação 05" }
];


// ==========================================
// VARIÁVEIS
// ==========================================

let historico = [];

let estacaoAtual = "all";

let filtroAtual = "all";


// ==========================================
// BUSCAR HISTÓRICO
// ==========================================

async function atualizarHistorico() {
  try {
    const resposta = await fetch(API_HISTORICO);

    if (!resposta.ok) {
      throw new Error(
        `Erro HTTP: ${resposta.status}`
      );
    }

    const dados = await resposta.json();

    if (!Array.isArray(dados)) {
      throw new Error(
        "A API de histórico não retornou uma lista."
      );
    }

    historico = dados;

    renderizarHistorico();

  } catch (erro) {
    console.error(
      "Falha ao buscar histórico:",
      erro
    );
  }
}


// ==========================================
// IDENTIFICAR ESTAÇÃO
// ==========================================

function obterESP32(evento) {
  return evento.esp32 || "";
}


function obterNomeEstacao(esp32) {
  const estacao = ESTACOES.find(
    item => item.id === esp32
  );

  if (estacao) {
    return estacao.nome;
  }

  return esp32 || "Estação desconhecida";
}


// ==========================================
// CONFIGURAR ABAS DE ESTAÇÃO
// ==========================================

function configurarAbasEstacao() {
  const abas = document.querySelectorAll(
    "[data-estacao]"
  );

  abas.forEach(botao => {
    botao.addEventListener("click", () => {

      // Remove a seleção anterior
      abas.forEach(item => {
        item.classList.remove("ativo");
      });

      // Ativa a estação selecionada
      botao.classList.add("ativo");

      // Guarda a estação
      estacaoAtual = botao.dataset.estacao;

      // Atualiza a tabela
      renderizarHistorico();
    });
  });
}


// ==========================================
// CONFIGURAR FILTROS DE EVENTOS
// ==========================================

function configurarFiltros() {
  const filtros = document.querySelectorAll(
    "[data-tipo-filtro]"
  );

  filtros.forEach(botao => {
    botao.addEventListener("click", () => {

      // Remove a seleção anterior
      filtros.forEach(item => {
        item.classList.remove("ativo");
      });

      // Ativa o filtro selecionado
      botao.classList.add("ativo");

      // Guarda o filtro
      filtroAtual = botao.dataset.tipoFiltro;

      // Atualiza a tabela
      renderizarHistorico();
    });
  });
}


// ==========================================
// FILTRAR HISTÓRICO
// ==========================================

function filtrarHistorico() {
  return historico.filter(evento => {

    // --------------------------------------
    // FILTRO POR ESTAÇÃO
    // --------------------------------------

    if (
      estacaoAtual !== "all" &&
      obterESP32(evento) !== estacaoAtual
    ) {
      return false;
    }

    // --------------------------------------
    // FILTRO POR TIPO DE EVENTO
    // --------------------------------------

    const tipo = String(
      evento.tipo || ""
    ).toLowerCase();

    if (filtroAtual === "tightening") {
      return tipo === "aperto";
    }

    if (filtroAtual === "online") {
      return tipo === "online";
    }

    if (filtroAtual === "alert") {
      return (
        tipo === "alerta" ||
        tipo === "alert" ||
        evento.alerta === true ||
        evento.correto === false
      );
    }

    return true;
  });
}


// ==========================================
// CRIAR CÉLULA SEGURA
// ==========================================

function criarCelula(valor) {
  const celula = document.createElement("td");

  celula.textContent =
    valor !== undefined &&
    valor !== null &&
    valor !== ""
      ? String(valor)
      : "—";

  return celula;
}


// ==========================================
// RENDERIZAR HISTÓRICO
// ==========================================

function renderizarHistorico() {
  const corpo = document.getElementById(
    "historico-corpo"
  );

  if (!corpo) return;

  corpo.innerHTML = "";

  const eventos = filtrarHistorico()
    .slice()
    .reverse();

  // --------------------------------------
  // NENHUM EVENTO
  // --------------------------------------

  if (eventos.length === 0) {
    const linha = document.createElement("tr");

    const celula = criarCelula(
      "Nenhum evento encontrado para esta seleção."
    );

    celula.colSpan = 10;

    linha.appendChild(celula);

    corpo.appendChild(linha);

    return;
  }

  // --------------------------------------
  // CRIAR LINHAS
  // --------------------------------------

  eventos.forEach(evento => {
    const linha = document.createElement("tr");

    const esp32 = obterESP32(evento);

    const estacao = obterNomeEstacao(esp32);

    const tipo = String(
      evento.tipo || "—"
    ).toLowerCase();

    // HORÁRIO
    linha.appendChild(
      criarCelula(
        formatarHorario(evento.data || evento.horario)
      )
    );

    // TIPO
    linha.appendChild(
      criarCelula(tipo.toUpperCase())
    );

    // ESTAÇÃO
    linha.appendChild(
      criarCelula(estacao)
    );

    // ESP32
    linha.appendChild(
      criarCelula(evento.esp32)
    );

    // PARAFUSADEIRA
    linha.appendChild(
      criarCelula(evento.parafusadeira)
    );

    // APERTO
    let aperto = "—";

    if (evento.aperto === true) {
      aperto = "SIM";
    } else if (evento.aperto === false) {
      aperto = "NÃO";
    }

    linha.appendChild(
      criarCelula(aperto)
    );

    // STATUS ONLINE
    let status = "—";

    if (evento.online === true) {
      status = "ONLINE";
    } else if (evento.online === false) {
      status = "OFFLINE";
    }

    linha.appendChild(
      criarCelula(status)
    );

    // APERTOS NOS ÚLTIMOS 10 SEGUNDOS
    linha.appendChild(
      criarCelula(
        evento.apertosUltimos10Segundos
      )
    );

    // TORQUE
    linha.appendChild(
      criarCelula(evento.torque)
    );

    // RESULTADO
    let resultado = "—";

    if (evento.correto === true) {
      resultado = "CORRETO";
    } else if (evento.correto === false) {
      resultado = "INCORRETO";
    } else if (evento.resultado) {
      resultado = evento.resultado;
    }

    const celulaResultado = criarCelula(resultado);

    if (evento.correto === true) {
      celulaResultado.classList.add(
        "resultado--correto"
      );
    } else if (evento.correto === false) {
      celulaResultado.classList.add(
        "resultado--incorreto"
      );
    }

    linha.appendChild(celulaResultado);

    // Adiciona a linha à tabela
    corpo.appendChild(linha);
  });
}


// ==========================================
// FORMATAR DATA E HORA
// ==========================================

function formatarHorario(valor) {
  if (!valor) return "—";

  const data = new Date(valor);

  if (isNaN(data.getTime())) {
    return valor;
  }

  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}


// ==========================================
// ATUALIZAR RELÓGIO
// ==========================================

function atualizarRelogio() {
  const relogio = document.querySelector(
    "[data-relogio]"
  );

  if (!relogio) return;

  relogio.textContent =
    new Date().toLocaleTimeString("pt-BR");
}


// ==========================================
// ATUALIZAR STATUS GERAL DO SISTEMA
// ==========================================

async function atualizarStatus() {
  try {
    const resposta = await fetch(API_STATUS);

    if (!resposta.ok) {
      throw new Error(
        `Erro HTTP: ${resposta.status}`
      );
    }

    const dados = await resposta.json();

    const status = document.querySelector(
      ".topbar__status"
    );

    if (!status) return;

    const online = Number(
      dados.equipamentosOnline || 0
    );

    status.innerHTML = "";

    const indicador = document.createElement("i");

    status.appendChild(indicador);

    const texto = online > 0
      ? `${online} equipamento(s) online`
      : "Aguardando eventos do sistema";

    status.appendChild(
      document.createTextNode(texto)
    );

  } catch (erro) {
    console.error(
      "Falha ao atualizar status:",
      erro
    );
  }
}


// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    configurarAbasEstacao();

    configurarFiltros();

    atualizarHistorico();

    atualizarStatus();

    atualizarRelogio();

    // Atualiza histórico a cada segundo
    setInterval(
      atualizarHistorico,
      1000
    );

    // Atualiza status a cada segundo
    setInterval(
      atualizarStatus,
      1000
    );

    // Atualiza relógio a cada segundo
    setInterval(
      atualizarRelogio,
      1000
    );

  }
);
