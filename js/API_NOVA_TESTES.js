const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// ==========================================
// CONFIGURACAO DO SERVIDOR
// ==========================================

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ==========================================
// CONFIGURACAO DE STATUS
// ==========================================

// O ESP32 envia um sinal a cada 10 segundos.
// O equipamento fica offline se passar de 15 segundos
// sem receber um sinal valido.

const TEMPO_LIMITE_OFFLINE = 15000;

// ==========================================
// EQUIPAMENTOS CADASTRADOS
// ==========================================

const equipamentos = {
  "ESP32 01": {
    nome: "Parafusadeira 01",
    online: false,
    apertos: 0,
    ultimoSinal: null
  },

  "ESP32 02": {
    nome: "Parafusadeira 02",
    online: false,
    apertos: 0,
    ultimoSinal: null
  },

  "ESP32 03": {
    nome: "Parafusadeira 03",
    online: false,
    apertos: 0,
    ultimoSinal: null
  },

  "ESP32 04": {
    nome: "Parafusadeira 04",
    online: false,
    apertos: 0,
    ultimoSinal: null
  },

  "ESP32 05": {
    nome: "Parafusadeira 05",
    online: false,
    apertos: 0,
    ultimoSinal: null
  }
};

// ==========================================
// HISTORICO DE EVENTOS
// ==========================================

const historico = [];

// ==========================================
// RECEBER SINAL DO ESP32
//
// POST /api/sinal
//
// Tipos aceitos:
// - tipo: "online" -> sinal de vida
// - aperto: true   -> evento de aperto
// ==========================================

app.post("/api/sinal", (req, res) => {

  const {
    tipo,
    esp32,
    parafusadeira,
    aperto,
    online,
    apertosUltimos10Segundos,
    data
  } = req.body;

  // ----------------------------------------
  // VALIDAR IDENTIFICACAO
  // ----------------------------------------

  if (
    typeof esp32 !== "string" ||
    !Object.prototype.hasOwnProperty.call(equipamentos, esp32)
  ) {
    return res.status(400).json({
      sucesso: false,
      erro: "ESP32 invalido"
    });
  }

  // ----------------------------------------
  // VALIDAR TIPO DE EVENTO
  // ----------------------------------------

  const ehAperto = aperto === true;

  const ehHeartbeat =
    tipo === "online" || online === true;

  if (!ehAperto && !ehHeartbeat) {
    return res.status(400).json({
      sucesso: false,
      erro: "Tipo de sinal invalido"
    });
  }

  // ----------------------------------------
  // IDENTIFICAR EQUIPAMENTO
  // ----------------------------------------

  const equipamento = equipamentos[esp32];

  const agora = new Date();
  const horarioRecebimento = agora.toISOString();

  // A data enviada pelo dispositivo e apenas
  // informativa. O status usa o horario do servidor.

  const horarioEvento =
    typeof data === "string" && !isNaN(Date.parse(data))
      ? data
      : horarioRecebimento;

  // ----------------------------------------
  // ATUALIZAR STATUS DO EQUIPAMENTO
  // ----------------------------------------

  equipamento.online = true;
  equipamento.ultimoSinal = horarioRecebimento;

  // ----------------------------------------
  // REGISTRAR APERTO
  // ----------------------------------------

  if (ehAperto) {

    equipamento.apertos++;

    historico.push({
      tipo: tipo || "aperto",
      esp32,
      parafusadeira:
        parafusadeira || equipamento.nome,
      aperto: true,
      online: true,
      horario: horarioEvento
    });

    console.log(
      `[APERTO] ${esp32} | ` +
      `${parafusadeira || equipamento.nome} | ` +
      `Total: ${equipamento.apertos}`
    );

  }

  // ----------------------------------------
  // REGISTRAR SINAL DE VIDA
  // ----------------------------------------

  else {

    historico.push({
      tipo: "online",
      esp32,
      parafusadeira:
        parafusadeira || equipamento.nome,
      online: true,
      apertosUltimos10Segundos:
        apertosUltimos10Segundos ?? null,
      horario: horarioEvento
    });

    console.log(
      `[HEARTBEAT] ${esp32} | ONLINE`
    );
  }

  // ----------------------------------------
  // RESPOSTA
  // ----------------------------------------

  return res.status(200).json({
    sucesso: true,
    mensagem: ehAperto
      ? "Aperto registrado"
      : "Sinal de vida recebido",
    esp32,
    online: equipamento.online,
    apertos: equipamento.apertos,
    ultimoSinal: equipamento.ultimoSinal
  });

});

// ==========================================
// ATUALIZAR STATUS DOS EQUIPAMENTOS
//
// Offline apos 15 segundos sem sinal
// ==========================================

function atualizarEstadoEquipamentos() {

  const agora = Date.now();

  Object.values(equipamentos).forEach(equipamento => {

    if (!equipamento.ultimoSinal) {
      equipamento.online = false;
      return;
    }

    const ultimo = new Date(
      equipamento.ultimoSinal
    ).getTime();

    equipamento.online =
      agora - ultimo <= TEMPO_LIMITE_OFFLINE;

  });

}

// ==========================================
// STATUS GERAL DO SISTEMA
//
// GET /api/status
// ==========================================

app.get("/api/status", (req, res) => {

  atualizarEstadoEquipamentos();

  // ----------------------------------------
  // TOTAL DE APERTOS
  // ----------------------------------------

  let totalApertos = 0;

  Object.values(equipamentos).forEach(equipamento => {
    totalApertos += equipamento.apertos;
  });

  // ----------------------------------------
  // EQUIPAMENTOS ONLINE
  // ----------------------------------------

  const equipamentosOnline =
    Object.values(equipamentos)
      .filter(equipamento => equipamento.online)
      .length;

  // ----------------------------------------
  // RESPOSTA
  // ----------------------------------------

  return res.json({
    totalApertos,
    equipamentosOnline,
    equipamentos
  });

});

// ==========================================
// HISTORICO DE EVENTOS
//
// GET /api/historico
// ==========================================

app.get("/api/historico", (req, res) => {

  return res.json(historico);

});

// ==========================================
// ROTA DE TESTE
//
// GET /api
// ==========================================

app.get("/api", (req, res) => {

  res.json({
    sucesso: true,
    mensagem: "Cavalleti API funcionando",
    endpoints: [
      "POST /api/sinal",
      "GET /api/status",
      "GET /api/historico"
    ]
  });

});

// ==========================================
// TRATAMENTO DE ERROS JSON
// ==========================================

app.use((err, req, res, next) => {

  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({
      sucesso: false,
      erro: "JSON invalido"
    });
  }

  console.error("Erro no servidor:", err);

  return res.status(500).json({
    sucesso: false,
    erro: "Erro interno do servidor"
  });

});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

app.listen(PORT, "0.0.0.0", () => {

  console.log(
    `Cavalleti API rodando na porta ${PORT}`
  );

  console.log(
    `Timeout de equipamentos offline: ` +
    `${TEMPO_LIMITE_OFFLINE / 1000} segundos`
  );

});
