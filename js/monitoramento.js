// ==========================================
// CONFIGURAÇÕES DA API
// ==========================================

const API_URL =
  "https://symmetrical-space-sniffle-x95x5xw4799hvv47-3000.app.github.dev/api/status";


// ==========================================
// ESTAÇÕES
// ==========================================

const ESTACOES = [
  {
    esp32: "ESP32 01",
    estacao: "ESTAÇÃO 01"
  },
  {
    esp32: "ESP32 02",
    estacao: "ESTAÇÃO 02"
  },
  {
    esp32: "ESP32 03",
    estacao: "ESTAÇÃO 03"
  },
  {
    esp32: "ESP32 04",
    estacao: "ESTAÇÃO 04"
  },
  {
    esp32: "ESP32 05",
    estacao: "ESTAÇÃO 05"
  }
];


// ==========================================
// FORMATAR DATA/HORA
// ==========================================

function formatarDataHora(valor) {

  if (!valor) {
    return "Sem dados";
  }


  const data =
    new Date(valor);


  if (Number.isNaN(data.getTime())) {
    return "Sem dados";
  }


  return data.toLocaleTimeString(
    "pt-BR",
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }
  );

}


// ==========================================
// OBTER EQUIPAMENTO
// ==========================================

function obterEquipamento(
  equipamentos,
  esp32
) {

  if (!equipamentos) {
    return null;
  }


  return equipamentos[esp32] ?? null;

}


// ==========================================
// ATUALIZAR CARD
// ==========================================

function atualizarCard(
  card,
  equipamento,
  esp32
) {

  if (!card) {
    return;
  }


  // ========================================
  // SE NÃO EXISTE DADO
  // ========================================

  if (!equipamento) {

    card.classList.remove(
      "equipamento-card--online"
    );


    card.classList.add(
      "equipamento-card--offline"
    );


    const statusTexto =
      card.querySelector(
        ".status-texto"
      );


    if (statusTexto) {

      statusTexto.classList.remove(
        "status-texto--online"
      );


      statusTexto.classList.add(
        "status-texto--offline"
      );


      statusTexto.textContent =
        "AGUARDANDO";

    }


    return;
  }


  // ========================================
  // STATUS ONLINE
  // ========================================

  const online =
    equipamento.online === true;


  const statusTexto =
    card.querySelector(
      ".status-texto"
    );


  if (online) {

    card.classList.remove(
      "equipamento-card--offline"
    );


    card.classList.add(
      "equipamento-card--online"
    );


    if (statusTexto) {

      statusTexto.classList.remove(
        "status-texto--offline"
      );


      statusTexto.classList.add(
        "status-texto--online"
      );


      statusTexto.textContent =
        "ONLINE";

    }

  } else {

    card.classList.remove(
      "equipamento-card--online"
    );


    card.classList.add(
      "equipamento-card--offline"
    );


    if (statusTexto) {

      statusTexto.classList.remove(
        "status-texto--online"
      );


      statusTexto.classList.add(
        "status-texto--offline"
      );


      statusTexto.textContent =
        "OFFLINE";

    }

  }


  // ========================================
  // NOME
  // ========================================

  const nomeEquipamento =
    card.querySelector("h3");


  if (nomeEquipamento) {

    nomeEquipamento.textContent =
      `${equipamento.nome ?? "Parafusadeira"} · ${esp32}`;

  }


  // ========================================
  // DADOS
  // ========================================

  const dadosElementos =
    card.querySelectorAll(
      ".dados-equipamento > div"
    );


  if (dadosElementos.length < 4) {
    return;
  }


  // ========================================
  // TOTAL DE APERTOS
  // ========================================

  const totalApertos =
    dadosElementos[0]
      .querySelector("b");


  if (totalApertos) {

    totalApertos.textContent =
      equipamento.apertos ?? 0;

  }


  // ========================================
  // APERTOS NOS ÚLTIMOS 10 SEGUNDOS
  // ========================================

  const apertos10 =
    dadosElementos[1]
      .querySelector("b");


  if (apertos10) {

    apertos10.textContent =
      equipamento.apertosUltimos10Segundos ?? 0;

  }


  // ========================================
  // ÚLTIMO APERTO
  // ========================================

  const ultimoAperto =
    dadosElementos[2]
      .querySelector("b");


  if (ultimoAperto) {

    ultimoAperto.textContent =
      formatarDataHora(
        equipamento.ultimoAperto
      );

  }


  // ========================================
  // ÚLTIMO SINAL ONLINE
  // ========================================

  const ultimoOnline =
    dadosElementos[3]
      .querySelector("b");


  if (ultimoOnline) {

    ultimoOnline.textContent =
      formatarDataHora(
        equipamento.ultimoOnline
      );

  }

}


// ==========================================
// ATUALIZAÇÃO DO MONITORAMENTO
// ==========================================

async function atualizarMonitoramento() {

  try {

    const resposta =
      await fetch(API_URL);


    if (!resposta.ok) {

      throw new Error(
        `Erro na API (Status HTTP: ${resposta.status})`
      );

    }


    const dados =
      await resposta.json();


    const grid =
      document.getElementById(
        "equipamentos-grid"
      );


    if (!grid) {
      return;
    }


    const cards =
      grid.querySelectorAll(
        ".equipamento-card"
      );


    // ========================================
    // ATUALIZAR AS 5 ESTAÇÕES
    // ========================================

    ESTACOES.forEach(
      (estacao, index) => {

        const card =
          cards[index];


        const equipamento =
          obterEquipamento(
            dados.equipamentos,
            estacao.esp32
          );


        atualizarCard(
          card,
          equipamento,
          estacao.esp32
        );

      }
    );


    // ========================================
    // STATUS DA TOPBAR
    // ========================================

    atualizarStatusTopbar(
      dados.equipamentosOnline ?? 0
    );

  }


  catch (erro) {

    console.error(
      "Falha ao atualizar o monitoramento:",
      erro
    );

  }

}


// ==========================================
// STATUS DA TOPBAR
// ==========================================

function atualizarStatusTopbar(
  equipamentosOnline
) {

  const status =
    document.querySelector(
      ".topbar__status"
    );


  if (!status) {
    return;
  }


  if (equipamentosOnline === 0) {

    status.innerHTML = `
      <i></i>
      Aguardando sinais do ESP32
    `;

    return;
  }


  if (equipamentosOnline < 5) {

    status.innerHTML = `
      <i></i>
      ${equipamentosOnline} de 5 ESP32 online
    `;

    return;
  }


  status.innerHTML = `
    <i></i>
    Todos os ESP32 estão online
  `;

}


// ==========================================
// RELÓGIO EM TEMPO REAL
// ==========================================

function atualizarRelogio() {

  const relogioEl =
    document.querySelector(
      "[data-relogio]"
    );


  if (!relogioEl) {
    return;
  }


  const agora =
    new Date();


  relogioEl.textContent =
    agora.toLocaleTimeString(
      "pt-BR"
    );

}


// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    // Atualização imediata
    atualizarMonitoramento();

    atualizarRelogio();


    // Atualiza os dados a cada segundo
    setInterval(
      atualizarMonitoramento,
      1000
    );


    // Atualiza relógio a cada segundo
    setInterval(
      atualizarRelogio,
      1000
    );

  }
);
