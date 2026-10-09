
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


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
// HISTÓRICO DE EVENTOS
// ==========================================

const historico = [];


// ==========================================
// RECEBER SINAL DO ESP32
//
// POST /api/sinal
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
  // VALIDAR ESP32
  // ----------------------------------------

  if (!esp32 || !equipamentos[esp32]) {
    return res.status(400).json({
      erro: "ESP32 inválido"
    });
  }

  const equipamento = equipamentos[esp32];

  const agora = new Date().toISOString();

  const horario = data || agora;

  // ----------------------------------------
  // ATUALIZAR IDENTIFICAÇÃO E STATUS
  // ----------------------------------------

  equipamento.online = true;
  equipamento.ultimoSinal = agora;

  // ----------------------------------------
  // REGISTRAR APERTO
  // ----------------------------------------

  if (aperto === true) {

    // Todos os apertos são considerados válidos
    equipamento.apertos++;

    historico.push({
      tipo: tipo || "aperto",
      esp32,
      parafusadeira: parafusadeira || equipamento.nome,
      aperto: true,
      online: true,
      horario
    });

  }

  // ----------------------------------------
  // REGISTRAR STATUS ONLINE
  // ----------------------------------------

  else if (tipo === "online" || online === true) {

    historico.push({
      tipo: "online",
      esp32,
      parafusadeira: parafusadeira || equipamento.nome,
      online: true,
      apertosUltimos10Segundos:
        apertosUltimos10Segundos ?? null,
      horario
    });

  }

  // ----------------------------------------
  // RESPOSTA
  // ----------------------------------------

  res.json({
    sucesso: true,
    mensagem: "Sinal recebido",
    esp32,
    apertos: equipamento.apertos
  });

});


// ==========================================
// ATUALIZAR STATUS DOS EQUIPAMENTOS
//
// Considera offline após 15 segundos
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
      agora - ultimo <= 15000;

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
  // RESPOSTA DA API
  // ----------------------------------------

  res.json({
    totalApertos,
    equipamentosOnline,
    equipamentos
  });

});


// ==========================================
// HISTÓRICO DE EVENTOS
//
// GET /api/historico
// ==========================================

app.get("/api/historico", (req, res) => {

  res.json(historico);

});


// ==========================================
// INICIAR SERVIDOR
// ==========================================

app.listen(PORT, "0.0.0.0", () => {

  console.log(
    `Cavalleti API rodando em http://localhost:${PORT}`
  );

});
