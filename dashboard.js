async function atualizarDashboard() {
  try {
    const resposta = await fetch("/api/status");

    if (!resposta.ok) {
      throw new Error("Erro ao consultar API");
    }

    const dados = await resposta.json();

    // Total de apertos
    document.getElementById("total-apertos").textContent =
      dados.totalApertos;

    document.getElementById("descricao-apertos").innerHTML =
      `<b>${dados.totalApertos}</b> apertos registrados`;

    // Equipamentos
    document.getElementById("equipamentos-online").innerHTML =
      `${dados.equipamentosOnline} <small>/ 5</small>`;

    document.getElementById("descricao-equipamentos").innerHTML =
      `<b>${dados.equipamentosOnline} ESP32</b> online`;

    // Qualidade
    document.getElementById("apertos-corretos").textContent =
      dados.corretos;

    document.getElementById("apertos-incorretos").textContent =
      dados.incorretos;

    const total =
      dados.corretos + dados.incorretos;

    const taxa =
      total > 0
        ? Math.round((dados.corretos / total) * 100)
        : 0;

    document.getElementById("taxa-rosca").textContent =
      total > 0 ? `${taxa}%` : "—";

    // Lista dos equipamentos
    const lista =
      document.getElementById("lista-equipamentos");

    lista.innerHTML = "";

    Object.entries(dados.equipamentos).forEach(
      ([esp32, equipamento]) => {

        const div = document.createElement("div");

        const status = equipamento.online
          ? "status--online"
          : "status--offline";

        const texto = equipamento.online
          ? "ONLINE"
          : "AGUARDANDO";

        div.innerHTML = `
          <i class="status ${status}"></i>
          <span>
            ${equipamento.nome} · ${esp32}
          </span>
          <small>${texto}</small>
        `;

        lista.appendChild(div);
      }
    );

  } catch (erro) {
    console.error("Erro:", erro);
  }
}

// Atualiza imediatamente
atualizarDashboard();

// Atualiza a cada segundo
setInterval(atualizarDashboard, 1000);


// Relógio
function atualizarRelogio() {
  const agora = new Date();

  document.getElementById("relogio").textContent =
    agora.toLocaleTimeString("pt-BR");
}

setInterval(atualizarRelogio, 1000);
atualizarRelogio();
