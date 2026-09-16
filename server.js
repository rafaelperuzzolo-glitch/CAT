const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Estado atual dos ESP32
const equipamentos = {
  "ESP32 01": {
    nome: "Parafusadeira 01",
    online: false,
    apertos: 0,
    corretos: 0,
    incorretos: 0,
    ultimoSinal: null
  },
  "ESP32 02": {
    nome: "Parafusadeira 02",
    online: false,
    apertos: 0,
    corretos: 0,
    incorretos: 0,
    ultimoSinal: null
  },
  "ESP32 03": {
    nome: "Parafusadeira 03",
    online: false,
    apertos: 0,
    corretos: 0,
    incorretos: 0,
    ultimoSinal: null
  },
  "ESP32 04": {
    nome: "Parafusadeira 04",
    online: false,
    apertos: 0,
    corretos: 0,
    incorretos: 0,
    ultimoSinal: null
  },
  "ESP32 05": {
    nome: "Parafusadeira 05",
    online: false,
    apertos: 0,
    corretos: 0,
    incorretos: 0,
    ultimoSinal: null
  }
};

// Histórico de apertos
const historico = [];

/*
 * ESP32 envia dados para esta rota
 *
 * POST /api/sinal
 */
app.post("/api/sinal", (req, res) => {
  const {
    esp32,
    parafusadeira,
    aperto,
    correto
  } = req.body;

  if (!esp32 || !equipamentos[esp32]) {
    return res.status(400).json({
      erro: "ESP32 inválido"
    });
  }

  const equipamento = equipamentos[esp32];

  equipamento.online = true;
  equipamento.ultimoSinal = new Date().toISOString();

  if (aperto) {
    equipamento.apertos++;

    if (correto) {
      equipamento.corretos++;
    } else {
      equipamento.incorretos++;
    }

    historico.push({
      esp32,
      parafusadeira,
      correto,
      horario: new Date().toISOString()
    });
  }

  res.json({
    sucesso: true,
    mensagem: "Sinal recebido"
  });
});

/*
 * Retorna o estado geral do sistema
 *
 * GET /api/status
 */
app.get("/api/status", (req, res) => {
  const agora = Date.now();

  // Considera offline quem não envia sinal há mais de 15 segundos
  Object.values(equipamentos).forEach(equipamento => {
    if (!equipamento.ultimoSinal) {
      equipamento.online = false;
      return;
    }

    const ultimo = new Date(equipamento.ultimoSinal).getTime();

    equipamento.online =
      agora - ultimo <= 15000;
  });

  let totalApertos = 0;
  let corretos = 0;
  let incorretos = 0;

  Object.values(equipamentos).forEach(equipamento => {
    totalApertos += equipamento.apertos;
    corretos += equipamento.corretos;
    incorretos += equipamento.incorretos;
  });

  const equipamentosOnline =
    Object.values(equipamentos)
      .filter(equipamento => equipamento.online)
      .length;

  res.json({
    totalApertos,
    corretos,
    incorretos,
    equipamentosOnline,
    equipamentos
  });
});

/*
 * Histórico
 *
 * GET /api/historico
 */
app.get("/api/historico", (req, res) => {
  res.json(historico);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Cavalleti API rodando em http://localhost:${PORT}`);
});
