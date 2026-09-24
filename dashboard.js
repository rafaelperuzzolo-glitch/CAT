// ==========================================
// CONFIGURAÇÕES DA API
// ==========================================
// Aponta explicitamente para a porta 3000 onde a API do Express está rodando
const API_URL = "https://symmetrical-space-sniffle-x95x5xw4799hvv47-3000.app.github.dev/api/status";

// ==========================================
// ATUALIZAÇÃO DO DASHBOARD
// ==========================================
async function atualizarDashboard() {
  try {
    const resposta = await fetch(API_URL);

    if (!resposta.ok) {
      throw new Error(`Erro na API (Status HTTP: ${resposta.status})`);
    }

    const dados = await resposta.json();

    // 1. Total de apertos
    const totalApertosEl = document.getElementById("total-apertos");
    if (totalApertosEl) {
      totalApertosEl.textContent = dados.totalApertos;
    }

    const descApertosEl = document.getElementById("descricao-apertos");
    if (descApertosEl) {
      descApertosEl.innerHTML = `<b>${dados.totalApertos}</b> apertos registrados`;
    }

    // 2. Equipamentos online
    const eqOnlineEl = document.getElementById("equipamentos-online");
    if (eqOnlineEl) {
      eqOnlineEl.innerHTML = `${dados.equipamentosOnline} <small>/ 5</small>`;
    }

    const descEqEl = document.getElementById("descricao-equipamentos");
    if (descEqEl) {
      descEqEl.innerHTML = `<b>${dados.equipamentosOnline} ESP32</b> online`;
    }

    // 3. Qualidade
    const apertosCorretosEl = document.getElementById("apertos-corretos");
    if (apertosCorretosEl) {
      apertosCorretosEl.textContent = dados.corretos;
    }

    const apertosIncorretosEl = document.getElementById("apertos-incorretos");
    if (apertosIncorretosEl) {
      apertosIncorretosEl.textContent = dados.incorretos;
    }

    const total = dados.corretos + dados.incorretos;
    const taxa = total > 0 ? Math.round((dados.corretos / total) * 100) : 0;

    const taxaRoscaEl = document.getElementById("taxa-rosca");
    if (taxaRoscaEl) {
      taxaRoscaEl.textContent = total > 0 ? `${taxa}%` : "—";
    }

    // 4. Lista dos equipamentos
    const lista = document.getElementById("lista-equipamentos");
    if (lista && dados.equipamentos) {
      lista.innerHTML = "";

      Object.entries(dados.equipamentos).forEach(([esp32, equipamento]) => {
        const div = document.createElement("div");

        const statusClass = equipamento.online
          ? "status--online"
          : "status--offline";

        const textoStatus = equipamento.online ? "ONLINE" : "AGUARDANDO";

        div.innerHTML = `
          <i class="status ${statusClass}"></i>
          <span>
            ${equipamento.nome} · ${esp32}
          </span>
          <small>${textoStatus}</small>
        `;

        lista.appendChild(div);
      });
    }

  } catch (erro) {
    console.error("Falha ao atualizar o dashboard:", erro);
  }
}

// ==========================================
// RELÓGIO EM TEMPO REAL
// ==========================================
function atualizarRelogio() {
  const relogioEl = document.getElementById("relogio");
  if (relogioEl) {
    const agora = new Date();
    relogioEl.textContent = agora.toLocaleTimeString("pt-BR");
  }
}

// ==========================================
// INICIALIZAÇÃO E INTERVALOS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // Executa imediatamente no carregamento da página
  atualizarDashboard();
  atualizarRelogio();

  // Executa as atualizações a cada 1 segundo (1000ms)
  setInterval(atualizarDashboard, 1000);
  setInterval(atualizarRelogio, 1000);
});
