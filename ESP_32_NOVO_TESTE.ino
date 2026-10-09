#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <freertos/FreeRTOS.h>
#include <freertos/queue.h>

// ==========================================
// WIFI
// ==========================================

const char* WIFI_SSID = "SEU_WIFI";
const char* WIFI_SENHA = "SUA_SENHA";

// ==========================================
// API DO GITHUB CODESPACES
// ==========================================

const char* API_URL =
  "https://symmetrical-space-sniffle-x95x5xw4799hvv47-3000.app.github.dev/api/sinal";

// ==========================================
// IDENTIFICACAO DO ESP32
// ==========================================

const char* ESP32_ID = "ESP32 01";
const char* PARAFUSADEIRA = "Parafusadeira 01";

// ==========================================
// ENTRADAS DA PARAFUSADEIRA
// ==========================================

const int PINO_APERTO = 27;
const int PINO_RESULTADO = 26;

// ==========================================
// FILA DE APERTOS
// ==========================================

const int TAMANHO_FILA = 50;

struct EventoAperto {
  bool correto;
};

QueueHandle_t filaApertos = nullptr;

portMUX_TYPE mux = portMUX_INITIALIZER_UNLOCKED;

volatile uint32_t eventosPerdidos = 0;

// ==========================================
// CONTROLE DO WIFI
// ==========================================

unsigned long ultimaTentativaWiFi = 0;

const unsigned long INTERVALO_WIFI = 5000;

// ==========================================
// CONTROLE DE REENVIO DOS APERTOS
// ==========================================

const unsigned long INTERVALO_REENVIO = 2000;

unsigned long ultimaTentativaEnvio = 0;

bool tentativaEnvioRealizada = false;
bool temPendente = false;

EventoAperto eventoPendente;

// ==========================================
// HEARTBEAT
// ==========================================

const unsigned long INTERVALO_HEARTBEAT = 10000;

unsigned long ultimoHeartbeat = 0;

// ==========================================
// CONEXAO WIFI
// ==========================================

void conectarWiFi() {

  Serial.println();
  Serial.println("==============================");
  Serial.println("      CAVALLETI ESP32");
  Serial.println("==============================");

  Serial.print("Conectando ao Wi-Fi: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.begin(WIFI_SSID, WIFI_SENHA);

  ultimaTentativaWiFi = millis();

  Serial.println("Tentativa de conexao iniciada.");
}

void manterWiFi() {

  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  unsigned long agora = millis();

  if (agora - ultimaTentativaWiFi >= INTERVALO_WIFI) {

    ultimaTentativaWiFi = agora;

    Serial.println("Wi-Fi desconectado. Reconectando...");

    WiFi.reconnect();
  }
}

// ==========================================
// DETECTAR APERTO REAL
// ==========================================

void IRAM_ATTR detectarAperto() {

  // Leitura instantanea do resultado no momento
  // em que o GPIO 27 apresenta a borda de subida.

  EventoAperto evento;

  evento.correto =
    (digitalRead(PINO_RESULTADO) == HIGH);

  BaseType_t tarefaDespertada = pdFALSE;

  // Nenhuma requisicao de rede e realizada
  // dentro da interrupcao.

  if (xQueueSendFromISR(
        filaApertos,
        &evento,
        &tarefaDespertada
      ) != pdPASS) {

    portENTER_CRITICAL_ISR(&mux);
    eventosPerdidos++;
    portEXIT_CRITICAL_ISR(&mux);
  }

  if (tarefaDespertada) {
    portYIELD_FROM_ISR();
  }
}

// ==========================================
// ENVIAR APERTO PARA A API
// ==========================================

bool enviarAperto(bool correto) {

  Serial.println();
  Serial.println("--------------------------------");
  Serial.println("        NOVO APERTO REAL");
  Serial.println("--------------------------------");

  Serial.print("ESP32: ");
  Serial.println(ESP32_ID);

  Serial.print("Parafusadeira: ");
  Serial.println(PARAFUSADEIRA);

  Serial.print("Resultado: ");
  Serial.println(correto ? "CORRETO" : "INCORRETO");

  if (WiFi.status() != WL_CONNECTED) {

    Serial.println("Wi-Fi desconectado.");
    Serial.println("Evento mantido para reenvio.");

    return false;
  }

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;

  http.setConnectTimeout(3000);
  http.setTimeout(3000);

  Serial.println("Conectando na API...");

  if (!http.begin(client, API_URL)) {

    Serial.println("ERRO AO INICIAR HTTPS!");

    return false;
  }

  http.addHeader("Content-Type", "application/json");

  String json = "{";

  json += "\"esp32\":\"";
  json += ESP32_ID;
  json += "\",";

  json += "\"parafusadeira\":\"";
  json += PARAFUSADEIRA;
  json += "\",";

  json += "\"aperto\":true,";

  json += "\"correto\":";
  json += correto ? "true" : "false";

  json += "}";

  Serial.println("JSON:");
  Serial.println(json);

  int codigoHTTP = http.POST(json);

  Serial.print("STATUS HTTP: ");
  Serial.println(codigoHTTP);

  bool sucesso = false;

  if (codigoHTTP >= 200 && codigoHTTP < 300) {

    Serial.println("APERTO REGISTRADO COM SUCESSO!");

    sucesso = true;

  } else {

    Serial.println("Falha no envio do aperto.");

    if (codigoHTTP > 0) {
      Serial.print("Resposta HTTP: ");
      Serial.println(http.getString());
    }

    Serial.println("Evento sera reenviado.");
  }

  http.end();

  Serial.println("--------------------------------");

  return sucesso;
}

// ==========================================
// ENVIAR SINAL DE VIDA
//
// Executado a cada 10 segundos.
// Nao incrementa o contador de apertos.
// ==========================================

bool enviarSinalOnline() {

  if (WiFi.status() != WL_CONNECTED) {
    return false;
  }

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;

  http.setConnectTimeout(3000);
  http.setTimeout(3000);

  if (!http.begin(client, API_URL)) {

    Serial.println("Erro ao iniciar HTTPS do heartbeat.");

    return false;
  }

  http.addHeader("Content-Type", "application/json");

  String json = "{";

  json += "\"tipo\":\"online\",";
  json += "\"esp32\":\"";
  json += ESP32_ID;
  json += "\",";
  json += "\"parafusadeira\":\"";
  json += PARAFUSADEIRA;
  json += "\",";
  json += "\"online\":true";

  json += "}";

  Serial.println();
  Serial.println("[HEARTBEAT] Enviando sinal de vida...");

  int codigoHTTP = http.POST(json);

  bool sucesso =
    (codigoHTTP >= 200 && codigoHTTP < 300);

  if (sucesso) {

    Serial.println("[HEARTBEAT] ESP32 confirmado online.");

  } else {

    Serial.print("[HEARTBEAT] Falha. HTTP: ");
    Serial.println(codigoHTTP);

    if (codigoHTTP > 0) {
      Serial.println(http.getString());
    }
  }

  http.end();

  return sucesso;
}

// ==========================================
// SETUP
// ==========================================

void setup() {

  Serial.begin(115200);

  delay(500);

  pinMode(PINO_APERTO, INPUT_PULLDOWN);
  pinMode(PINO_RESULTADO, INPUT_PULLDOWN);

  // Criar a fila antes de ativar a interrupcao.

  filaApertos = xQueueCreate(
    TAMANHO_FILA,
    sizeof(EventoAperto)
  );

  if (filaApertos == nullptr) {

    Serial.println("ERRO: NAO FOI POSSIVEL CRIAR A FILA!");

    while (true) {
      delay(1000);
    }
  }

  conectarWiFi();

  attachInterrupt(
    digitalPinToInterrupt(PINO_APERTO),
    detectarAperto,
    RISING
  );

  // Permite enviar o primeiro heartbeat assim que
  // o loop executar e o Wi-Fi estiver conectado.

  ultimoHeartbeat = millis() - INTERVALO_HEARTBEAT;

  Serial.println();
  Serial.println("Sistema iniciado!");
  Serial.println("Leitura instantanea habilitada.");
  Serial.println("Fila de apertos habilitada.");
  Serial.println("Reconexao automatica habilitada.");
  Serial.println("Heartbeat a cada 10 segundos habilitado.");
  Serial.println("Aguardando apertos reais da parafusadeira.");
}

// ==========================================
// LOOP
// ==========================================

void loop() {

  // 1. Manter a conexao Wi-Fi.

  manterWiFi();

  // 2. Informar se a fila ficou cheia.

  uint32_t perdidos = 0;

  portENTER_CRITICAL(&mux);

  if (eventosPerdidos > 0) {
    perdidos = eventosPerdidos;
    eventosPerdidos = 0;
  }

  portEXIT_CRITICAL(&mux);

  if (perdidos > 0) {

    Serial.print("ATENCAO: apertos perdidos por fila cheia: ");
    Serial.println(perdidos);
  }

  // 3. Obter o proximo aperto da fila.

  if (!temPendente) {

    if (xQueueReceive(
          filaApertos,
          &eventoPendente,
          0
        ) == pdPASS) {

      temPendente = true;
      tentativaEnvioRealizada = false;
    }
  }

  // 4. Enviar apertos pendentes.
  // Em caso de falha, preservar para reenvio.

  if (temPendente && WiFi.status() == WL_CONNECTED) {

    unsigned long agora = millis();

    bool podeTentar =
      !tentativaEnvioRealizada ||
      (agora - ultimaTentativaEnvio >= INTERVALO_REENVIO);

    if (podeTentar) {

      ultimaTentativaEnvio = agora;
      tentativaEnvioRealizada = true;

      bool sucesso = enviarAperto(
        eventoPendente.correto
      );

      if (sucesso) {

        temPendente = false;
        tentativaEnvioRealizada = false;

      } else {

        Serial.println(
          "Aperto preservado para nova tentativa."
        );
      }
    }
  }

  // 5. Heartbeat a cada 10 segundos.
  // Independente da atividade da parafusadeira.

  unsigned long agora = millis();

  if (WiFi.status() == WL_CONNECTED &&
      agora - ultimoHeartbeat >= INTERVALO_HEARTBEAT) {

    // Atualizar antes do envio evita tentativas
    // continuas caso a API esteja indisponivel.

    ultimoHeartbeat = agora;

    enviarSinalOnline();
  }

  delay(1);
}
