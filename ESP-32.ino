#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>

// ==========================================
// WIFI
// ==========================================

const char* WIFI_SSID = "moto g86";
const char* WIFI_SENHA = "Familia99";

// ==========================================
// API DO GITHUB CODESPACES
// ==========================================

const char* API_URL =
  "https://symmetrical-space-sniffle-x95x5xw4799hvv47-3000.app.github.dev/api/sinal";

// ==========================================
// IDENTIFICAÇÃO DO ESP32
// ==========================================

const char* ESP32_ID = "ESP32 01";
const char* PARAFUSADEIRA = "Parafusadeira 01";

// ==========================================
// CONFIGURAÇÃO DA SIMULAÇÃO
// ==========================================

const unsigned long INTERVALO_APERTO = 5000;

unsigned long ultimoAperto = 0;


// ==========================================
// CONECTAR NO WIFI
// ==========================================

void conectarWiFi() {

  Serial.println();
  Serial.println("==============================");
  Serial.println("      CAVALLETI ESP32");
  Serial.println("==============================");

  Serial.print("Conectando ao Wi-Fi: ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_SENHA);

  int tentativas = 0;

  while (WiFi.status() != WL_CONNECTED) {

    delay(500);

    Serial.print(".");

    tentativas++;

    if (tentativas >= 30) {

      Serial.println();
      Serial.println("ERRO AO CONECTAR NO WIFI");

      Serial.println("Reiniciando...");

      delay(2000);

      ESP.restart();
    }
  }

  Serial.println();
  Serial.println();

  Serial.println("WIFI CONECTADO!");

  Serial.print("IP DO ESP32: ");
  Serial.println(WiFi.localIP());

  Serial.println();

  Serial.println("API:");
  Serial.println(API_URL);

  Serial.println();

  Serial.println("==============================");
}


// ==========================================
// ENVIAR APERTO
// ==========================================

void enviarAperto() {

  Serial.println();
  Serial.println("--------------------------------");
  Serial.println("        NOVO APERTO");
  Serial.println("--------------------------------");

  // 90% correto
  bool correto = random(0, 100) < 90;

  Serial.print("ESP32: ");
  Serial.println(ESP32_ID);

  Serial.print("Parafusadeira: ");
  Serial.println(PARAFUSADEIRA);

  Serial.print("Resultado: ");

  if (correto) {
    Serial.println("CORRETO");
  } else {
    Serial.println("INCORRETO");
  }


  // ========================================
  // VERIFICAR WIFI
  // ========================================

  if (WiFi.status() != WL_CONNECTED) {

    Serial.println();
    Serial.println("WIFI DESCONECTADO!");

    conectarWiFi();

    return;
  }


  // ========================================
  // CLIENTE HTTPS
  // ========================================

  WiFiClientSecure client;

  // Para teste.
  // Não valida o certificado SSL.
  client.setInsecure();


  HTTPClient http;


  Serial.println();
  Serial.println("Conectando na API...");


  if (!http.begin(client, API_URL)) {

    Serial.println("ERRO AO INICIAR HTTPS!");

    return;
  }


  // ========================================
  // HEADER
  // ========================================

  http.addHeader(
    "Content-Type",
    "application/json"
  );


  // ========================================
  // JSON
  // ========================================

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


  Serial.println();
  Serial.println("JSON:");

  Serial.println(json);


  // ========================================
  // POST
  // ========================================

  int codigoHTTP = http.POST(json);


  // ========================================
  // RESPOSTA
  // ========================================

  Serial.println();

  Serial.print("STATUS HTTP: ");
  Serial.println(codigoHTTP);


  if (codigoHTTP > 0) {

    String resposta = http.getString();

    Serial.println();
    Serial.println("RESPOSTA DA API:");

    Serial.println(resposta);

    if (codigoHTTP == 200) {

      Serial.println();
      Serial.println("================================");
      Serial.println(" APERTO REGISTRADO COM SUCESSO ");
      Serial.println("================================");

    } else {

      Serial.println();
      Serial.println("API RETORNOU UM ERRO!");
    }

  } else {

    Serial.println();
    Serial.println("ERRO DE COMUNICACAO!");

    Serial.print("Codigo: ");
    Serial.println(codigoHTTP);

    Serial.println();
    Serial.println("Possiveis problemas:");
    Serial.println("- Codespace desligado");
    Serial.println("- Porta 3000 nao esta publica");
    Serial.println("- URL incorreta");
    Serial.println("- Problema de HTTPS");
  }


  http.end();

  Serial.println("--------------------------------");
}


// ==========================================
// SETUP
// ==========================================

void setup() {

  Serial.begin(115200);

  delay(1000);

  randomSeed(
    analogRead(0)
  );

  conectarWiFi();

  Serial.println();
  Serial.println("Sistema iniciado!");
  Serial.println("Simulando apertos a cada 5 segundos...");
}


// ==========================================
// LOOP
// ==========================================

void loop() {

  unsigned long agora = millis();


  if (
    agora - ultimoAperto >= INTERVALO_APERTO
  ) {

    ultimoAperto = agora;

    enviarAperto();
  }


  delay(10);
}
