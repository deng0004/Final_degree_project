#include <Arduino.h>
#include <WiFi.h>
#include <FirebaseESP32.h>
#include <Wire.h>
#include <MQUnifiedsensor.h>
#include <Arduino_JSON.h>
#include "time.h"


//Wifi details
#define WIFI_SSID ""
#define WIFI_PASSWORD ""

//Firebase api
#define api "";

// Firebase authorised email and password
#define USER_EMAIL ""
#define USER_PASSWORD ""

//Firebase URL
#define DATABASE_URL ""

// Firebase library does not work without this
#include "addons/TokenHelper.h"

// Firebase library does not work without this
#include "addons/RTDBHelper.h"

// Create Firebase objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Variable to save USER UID
String uid;

//To set the time when the data is transported to Firebase
int timestamp;
FirebaseJson json;

//Timer variables
unsigned long sendDataPrevMillis = 0;
unsigned long timerDelay = 500;

//Too get time from this server
const char* ntpServer = "pool.ntp.org";

/************************Hardware Related Macros************************************/
#define         Board                   ("ESP32")
#define         Pin32                     (32)  // MQ2
#define         Pin33                     (33)  // MQ3
#define         Pin34                     (34)  // MQ136
/***********************Software Related Macros************************************/
#define         Type_MQ2                    ("MQ-2") //MQ2
#define         Type_MQ3                    ("MQ-3") //MQ3
#define         Type_MQ136                  ("MQ-136") //MQ136

#define         Voltage_Resolution      (3.3)
#define         ADC_Bit_Resolution      (12) // For arduino UNO/MEGA/NANO
#define         RatioMQ2CleanAir        (9.83) //RS / R0 = 9.83 ppm 
#define         RatioMQ3CleanAir        (60) //RS / R0 = 60 ppm 
#define         RatioMQ136CleanAir      (3.6)//RS / R0 = 3.6 ppm  

// Json Variable to Hold Sensor Readings
JSONVar readings;

//Declare Sensor
MQUnifiedsensor MQ2(Board, Voltage_Resolution, ADC_Bit_Resolution, Pin32, Type_MQ2);
MQUnifiedsensor MQ3(Board, Voltage_Resolution, ADC_Bit_Resolution, Pin33, Type_MQ3);
MQUnifiedsensor MQ136(Board, Voltage_Resolution, ADC_Bit_Resolution, Pin34, Type_MQ136);

// Database main path (to be updated in setup with the user UID)
String databasePath;
// Database child nodes
String MQ2_H2Path = "/MQ2_H2";
String MQ2_AlcPath = "/MQ2_Alc";
String MQ2_PropPath = "/MQ2_Prop";
String MQ2_LPGPath = "/MQ2_LPG";
String MQ2_COPath = "/MQ2_CO";

String MQ3_LPGPath = "/MQ3_LPG";
String MQ3_CH4Path = "/MQ3_CH4";
String MQ3_COPath = "/MQ3_CO";
String MQ3_AlcPath = "/MQ3_Alc";
String MQ3_BenPath = "/MQ3_Ben";
String MQ3_HexPath = "/MQ3_Hex";

String MQ136_H2SPath = "/MQ136_H2S";
String MQ136_NH4Path = "/MQ136_NH4";
String MQ136_COPath = "/MQ136_CO";


String timePath = "/timestamp";


// Parent Node (to be updated in every loop)
String parentPath;

void initWifi(){
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wifi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print('.');
    delay(1000);
  }
  Serial.println(WiFi.localIP());
  Serial.println();
}

// Gets time so that we can see when the data is read
unsigned long getTime() {
  time_t now;
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Failed to obtain time");
    return(0);
  }
  time(&now);
  return now;
}

String MQ136_readGasH2S(){
  MQ136.update();
  MQ136.setA(36.737); MQ136.setB(-3.536);
  float H2S = MQ136.readSensor();
   if (isnan(H2S)){
   Serial.println("Failed to read from MQ136 H2S gas");
   return "";
   }else{
    Serial.println(H2S);
    return String(H2S);
   }
 }

 String MQ136_readGasNH4(){
  MQ136.update();
  MQ136.setA(98.551); MQ136.setB(-2.475);
  float NH4 = MQ136.readSensor();
   if (isnan(NH4)){
   Serial.println("Failed to read from MQ136 NH4 gas");
   return "";
   }else{
    Serial.println(NH4);
    return String(NH4);
   }
 }

 String MQ136_readGasCO(){
  MQ136.update();
  MQ136.setA(503.34); MQ136.setB(-3.774);
  float CO = MQ136.readSensor();
   if (isnan(CO)){
   Serial.println("Failed to read from MQ136 CO gas");
   return "";
   }else{
    Serial.println(CO);
    return String(CO);
   }
 }


String MQ3_readGasLPG(){
  MQ3.update();
  MQ3.setA(574.25); MQ3.setB(-2.222);
  float LPG = MQ3.readSensor();
   if (isnan(LPG)){
   Serial.println("Failed to read from MQ3 LPG gas");
   return "";
   }else{
    Serial.println(LPG);
    return String(LPG);
   }
 }

String MQ3_readGasCH4(){
  MQ3.update();
  //MQ3.setA(2*10^31); MQ3.setB(19.01);
  MQ3.setA(1012.7); MQ3.setB(-2.786);
  float CH4 = MQ3.readSensor();
   if (isnan(CH4)){
   Serial.println("Failed to read from MQ3 CH4 gas");
   return "";
   }else{
    Serial.println(CH4);
    MQ3.serialDebug();
    return String(CH4);
   }
 }

String MQ3_readGasCO(){
  MQ3.update();
  MQ3.setA(369); MQ3.setB(-3.109);
  float CO = MQ3.readSensor();
   if (isnan(CO)){
   Serial.println("Failed to read from MQ3 CO gas");
   return "";
   }else{
    Serial.println(CO);
    return String(CO);
    MQ3.serialDebug();
   }
 }

String MQ3_readGasAlcohol(){
  MQ3.update();
  MQ3.setA(0.3934); MQ3.setB(-1.504);
  float Alcohol = MQ3.readSensor();
   if (isnan(Alcohol)){
   Serial.println("Failed to read from MQ3 Alcohol gas");
   return "";
   }else{
    Serial.printf("%.6f\n", Alcohol);
    return String(Alcohol, 6);
   }
 }

 String MQ3_readGasBenzene(){
  MQ3.update();
  MQ3.setA(4.8387); MQ3.setB(-2.68);
  float Benzene = MQ3.readSensor();
   if (isnan(Benzene)){
   Serial.println("Failed to read from MQ3 Benzene gas");
   return "";
   }else{
    Serial.printf("%.6f\n", Benzene);
    return String(Benzene, 6);
   }
 }

 String MQ3_readGasHexane(){
  MQ3.update();
  MQ3.setA(7585.3); MQ3.setB(-2.849);
  float Hexane = MQ3.readSensor();
   if (isnan(Hexane)){
   Serial.println("Failed to read from MQ3 Hexane gas");
   return "";
   }else{
    Serial.println(Hexane);
    return String(Hexane);
   }
 }
 

String MQ2_readGasH2(){
   MQ2.update();
   MQ2.setA(987.99); MQ2.setB(-2.162);
   float H2 = MQ2.readSensor();
   if (isnan(H2)){
   Serial.println("Failed to read from MQ2 H2 gas");
   return "";
   }else{
    Serial.println(H2);
    return String(H2);
   }
}

String MQ2_readGasLPG(){
   MQ2.update();
   MQ2.setA(574.25); MQ2.setB(-2.222);
   float LPG = MQ2.readSensor();
   if (isnan(LPG)){
   Serial.println("Failed to read from MQ2 LPG gas");
   return "";
   }else{
    Serial.println(LPG);
    return String(LPG);
   }
}

String MQ2_readGasCO(){
   MQ2.update();
   MQ2.setA(36974); MQ2.setB(-3.109);
   float CO = MQ2.readSensor();
   if (isnan(CO)){
   Serial.println("Failed to read from MQ2 CO gas");
   return "";
   }else{
    Serial.println(CO);
    return String(CO);
   }
}

String MQ2_readGasAlcohol(){
   MQ2.update();
   MQ2.setA(3616.1); MQ2.setB(-2.675);
   float Alcohol = MQ2.readSensor();
   if (isnan(Alcohol)){
   Serial.println("Failed to read from MQ2 Alcohol gas");
   return "";
   }else{
    Serial.println(Alcohol);
    return String(Alcohol);
   }
}

String MQ2_readGasPropane(){
   MQ2.update();
   MQ2.setA(658.71); MQ2.setB(-2.168);
   float Propane = MQ2.readSensor();
   if (isnan(Propane)){
   Serial.println("Failed to read from MQ2 Propane gas");
   return "";
   }else{
    Serial.println(Propane);
    return String(Propane);
   }
}



void setup() {
  Serial.begin(115200);

  initWifi();
  configTime(0, 0, ntpServer);
  MQ2.init(); 
  MQ2.setRegressionMethod(1); //_PPM =  a*ratio^b
  MQ3.init(); 
  MQ3.setRegressionMethod(1); //_PPM =  a*ratio^b
  MQ136.init();
  MQ136.setRegressionMethod(1); //_PPM =  a*ratio^b
  

  /*****************************  MQ CAlibration ********************************************/ 
  // Explanation: 
  // In this routine the sensor will measure the resistance of the sensor supposedly before being pre-heated
  // and on clean air (Calibration conditions), setting up R0 value.
  // We recomend executing this routine only on setup in laboratory conditions.
  // This routine does not need to be executed on each restart, you can load your R0 value from eeprom.
  // Acknowledgements: https://jayconsystems.com/blog/understanding-a-gas-sensor
  Serial.print("Calibrating please wait.");
  float calcR0 = 0;
  for(int i = 1; i<=10; i ++)
  {
    MQ2.update(); // Update data, the arduino will read the voltage from the analog pin
    calcR0 += MQ2.calibrate(RatioMQ2CleanAir);
    Serial.print(".");
  }
  
  for(int i = 1; i<=10; i ++)
  {
    MQ3.update(); // Update data, the arduino will read the voltage from the analog pin
    calcR0 += MQ3.calibrate(RatioMQ3CleanAir);
    Serial.print(".");
  }

  for(int i = 1; i<=10; i ++)
  {
    MQ136.update(); // Update data, the arduino will read the voltage from the analog pin
    calcR0 += MQ136.calibrate(RatioMQ136CleanAir);
    Serial.print(".");
  }
  
  
  MQ2.setR0(calcR0/10);
  Serial.println("  done!.");

  MQ3.setR0(calcR0/10);
  Serial.println("  done!.");

  MQ136.setR0(calcR0/10);
  Serial.println("  done!.");

  
  if(isinf(calcR0)) {Serial.println("Warning: Conection issue, R0 is infinite (Open circuit detected) please check your wiring and supply"); while(1);}
  if(calcR0 == 0){Serial.println("Warning: Conection issue found, R0 is zero (Analog pin shorts to ground) please check your wiring and supply"); while(1);}  
  
  //Set the api key
  config.api_key = api;
  //Set the correct email and password for the login
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  config.database_url = DATABASE_URL;

  //Idk what this does but it does not work without it Q_Q
  config.token_status_callback = tokenStatusCallback; 
  config.max_token_generation_retry = 5;
  // Initialize Firebase
  Firebase.begin(&config, &auth);

  //Gets the User Id
  Serial.println("Getting User UID");
  while ((auth.token.uid) == "") {
  Serial.print('.');
  delay(1000);
  }

  uid = auth.token.uid.c_str();
  Serial.print("User UID: ");
  Serial.println(uid);
  // Update database path
  databasePath = "/UsersData/" + uid + "/readings";

  MQ3.serialDebug(true); 

}

void loop() {
   if (Firebase.ready() && (millis() - sendDataPrevMillis > timerDelay || sendDataPrevMillis == 0)){
    sendDataPrevMillis = millis();

    timestamp = getTime();
    Serial.print ("time: ");
    Serial.println (timestamp);

    parentPath= databasePath + "/" + String(timestamp);

    json.set(MQ2_H2Path.c_str(),MQ2_readGasH2());
    json.set(MQ2_LPGPath.c_str(),MQ2_readGasLPG());
    json.set(MQ2_AlcPath.c_str(),MQ2_readGasAlcohol());
    json.set(MQ2_PropPath.c_str(),MQ2_readGasPropane());
    json.set(MQ2_COPath.c_str(),MQ2_readGasCO());
    
    json.set(MQ3_LPGPath.c_str(), MQ3_readGasLPG());
    json.set(MQ3_CH4Path.c_str(), MQ3_readGasCH4());
    json.set(MQ3_COPath.c_str(), MQ3_readGasCO());
    json.set(MQ3_AlcPath.c_str(), MQ3_readGasAlcohol());
    json.set(MQ3_BenPath.c_str(), MQ3_readGasBenzene());
    json.set(MQ3_HexPath.c_str(), MQ3_readGasHexane());

    json.set(MQ136_H2SPath.c_str(), MQ136_readGasH2S());
    json.set(MQ136_NH4Path.c_str(), MQ136_readGasNH4());
    json.set(MQ136_COPath.c_str(), MQ136_readGasCO());


    
    
    json.set(timePath, String(timestamp));
    

    Serial.printf("Set json... %s\n", Firebase.RTDB.setJSON(&fbdo, parentPath.c_str(), &json) ? "ok" : fbdo.errorReason().c_str());
    
  }
}
