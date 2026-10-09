// ==========================================
// CONFIGURAÇÃO DA API
// ==========================================

const API_URL =
  "https://symmetrical-space-sniffle-x95x5xw4799hvv47-3000.app.github.dev/api/status";


// ==========================================
// ATUALIZAÇÃO DO DASHBOARD
// ==========================================

async function atualizarDashboard() {

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


    // ========================================
    // TOTAL DE APERTOS
    // ========================================

    const totalApertosEl =
      document.getElementById("total-apertos");


    if (totalApertosEl) {

      totalApertosEl.textContent =
        dados.totalApertos ?? 0;

    }


    const descApertosEl =
      document.getElementById("descricao-apertos");


    if (descApertosEl) {

      const total =
        dados.totalApertos ?? 0;


      if (total === 0) {

        descApertosEl.innerHTML =
          "Nenhum aperto registrado";

      } else {

        descApertosEl.innerHTML =
          `<b>${total}</b> apertos registrados`;

      }

    }


    // ========================================
    // EQUIPAMENTOS ONLINE
    // ========================================

    const equipamentosOnline =
      dados.equipamentosOnline ?? 0;


    const eqOnlineEl =
      document.getElementById(
        "equipamentos-online"
      );


    if (eqOnlineEl) {

      eqOnlineEl.innerHTML =
        `${equipamentosOnline} <small>/ 5</small>`;

    }


    const descEqEl =
      document.getElementById(
        "descricao-equipamentos"
      );


    if (descEqEl) {

      descEqEl.innerHTML =
        `<b>${equipamentosOnline} ESP32</b> online`;

    }


    // ========================================
    // PRODUÇÃO DOS ÚLTIMOS 10 SEGUNDOS
    // ========================================

    let apertos10Segundos = 0;


    if (dados.equipamentos) {

      Object.values(dados.equipamentos)
        .forEach(equipamento => {

          apertos10Segundos +=
            Number(
              equipamento.apertosUltimos10Segundos ?? 0
            );

        });

    }


    const apertos10El =
      document.getElementById(
        "apertos-10-segundos"
      );


    if (apertos10El) {

      apertos10El.textContent =
        apertos10Segundos;

    }


    // ========================================
    // LISTA DE EQUIPAMENTOS
    // ========================================

    atualizarEquipamentos(
      dados.equipamentos
    );


    // ========================================
    // AVISOS
    // ========================================

    atualizarAlertas(
      dados.equipamentos,
      equipamentosOnline
    );


    // ========================================
    // STATUS DA TOPBAR
    // ========================================

    atualizarStatusTopbar(
      equipamentosOnline
    );

  }


  catch (erro) {

    console.error(
      "Falha ao atualizar o dashboard:",
      erro
    );

  }

}


// ==========================================
// FORMATAR HORÁRIO
// ==========================================

function formatarHorario(data) {

  if (!data) {
    return "--:--:--";
  }


  const valor =
    new Date(data);


  if (isNaN(valor.getTime())) {
    return "--:--:--";
  }


  return valor.toLocaleTimeString(
    "pt-BR"
  );

}


// ==========================================
// LISTA DE EQUIPAMENTOS
// ==========================================

function atualizarEquipamentos(
  equipamentos
) {

  const lista =
    document.getElementById(
      "lista-equipamentos"
    );


  if (!lista) {
    return;
  }


  if (!equipamentos) {

    lista.innerHTML = `
      <div>

        <i class="status status--offline"></i>

        <span>
          Nenhum equipamento conectado
        </span>

        <small>
          AGUARDANDO
        </small>

      </div>
    `;

    return;
  }


  lista.innerHTML = "";


  Object.entries(equipamentos)
    .forEach(
      ([esp32, equipamento]) => {


        const div =
          document.createElement("div");


        const statusClass =
          equipamento.online
            ? "status--online"
            : "status--offline";


        const textoStatus =
          equipamento.online
            ? "ONLINE"
            : "OFFLINE";


        const apertos =
          equipamento.apertosUltimos10Segundos ?? 0;


        const ultimoOnline =
          formatarHorario(
            equipamento.ultimoOnline
          );


        const ultimoAperto =
          formatarHorario(
            equipamento.ultimoAperto
          );


        div.innerHTML = `

          <i class="status ${statusClass}"></i>


          <span>

            <strong>
              ${equipamento.nome}
            </strong>

            <small>
              ${esp32}
            </small>

            <small>
              ${apertos}
              parafuso(s) nos últimos 10s
            </small>

            <small>
              Último online:
              ${ultimoOnline}
            </small>

            <small>
              Último aperto:
              ${ultimoAperto}
            </small>

          </span>


          <small>
            ${textoStatus}
          </small>

        `;


        lista.appendChild(div);

      }
    );

}


// ==========================================
// AVISOS DE INTEGRAÇÃO
// ==========================================

function atualizarAlertas(
  equipamentos,
  equipamentosOnline
) {

  const lista =
    document.getElementById(
      "lista-alertas"
    );


  const contador =
    document.getElementById(
      "contador-alerta"
    );


  if (!lista || !contador) {
    return;
  }


  lista.innerHTML = "";


  // ========================================
  // TOTAL DE EQUIPAMENTOS
  // ========================================

  const totalEquipamentos =
    equipamentos
      ? Object.keys(equipamentos).length
      : 5;


  const equipamentosAguardando =
    totalEquipamentos -
    equipamentosOnline;


  // ========================================
  // EXISTEM EQUIPAMENTOS OFFLINE
  // ========================================

  if (equipamentosAguardando > 0) {

    contador.textContent =
      equipamentosAguardando;


    const alerta =
      document.createElement("div");


    alerta.className =
      "alerta alerta--amarelo";


    alerta.innerHTML = `

      <b>!</b>

      <p>

        <strong>
          ESP32 aguardando dados
        </strong>

        <span>
          ${equipamentosAguardando}
          equipamento(s) ainda não enviaram
          sinal online.
        </span>

      </p>

      <time>
        pendente
      </time>

    `;


    lista.appendChild(alerta);

  }


  // ========================================
  // TODOS ONLINE
  // ========================================

  else {

    contador.textContent =
      "✓";


    const alerta =
      document.createElement("div");


    alerta.className =
      "alerta alerta--azul";


    alerta.innerHTML = `

      <b>✓</b>

      <p>

        <strong>
          Comunicação estabelecida
        </strong>

        <span>
          Todos os ${totalEquipamentos}
          ESP32 estão enviando sinais online.
        </span>

      </p>

      <time>
        ativo
      </time>

    `;


    lista.appendChild(alerta);

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
// RELÓGIO
// ==========================================

function atualizarRelogio() {

  const relogioEl =
    document.getElementById(
      "relogio"
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

    // Primeira atualização
    atualizarDashboard();

    atualizarRelogio();


    // Atualiza os dados a cada segundo
    setInterval(
      atualizarDashboard,
      1000
    );


    // Atualiza o relógio a cada segundo
    setInterval(
      atualizarRelogio,
      1000
    );

  }
);
