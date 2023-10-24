//////////////  Define Variables //////////////
#include <Adafruit_RA8875.h>
#include <SPI.h>
#include "Adafruit_GFX.h"
#include <Keypad.h>
#include <MFRC522.h>
#include <stdio.h>
#include <stdint.h>
#include <SoftwareSerial.h>
#include <Arduino.h>
////////////// Define Pins //////////////
#define RA8875_CS 10
#define RA8875_RESET 9
#define RA8875_INT 3
#define RST_PIN 7    // Define the reset pin
#define SS_PIN 8    // Define the SS pin (SDA)

////////////// Global Variable //////////////
int timeoutResponse = 100;
String userID = "";
String pin = "";
String loginDuration = ""; // in minutes
String RFIDtrans = "";
int state = 1;             //current state ----   1 - user id input   2 - pasword pin input   3 - select login time duration    4 - display logged in user and duration
String key = "";
String key1 = "";
const byte ROWS = 4; //four rows
const byte COLS = 3; //four columns
//4x3 Button Matrix character definitions
// Define the setup of the matrix keypad for use with the keypad library 
char hexaKeys[ROWS][COLS] = {
  {'1','2','3'},
  {'4','5','6'},
  {'7','8','9'},
  {'*','0','#'}
};
byte rowPins[ROWS] = {31, 36, 35, 33}; //Define the pins to be used 
byte colPins[COLS] = {32, 30, 34}; //connect to the column pinouts of the keypad
////////////// Create objects //////////////
MFRC522 mfrc522(SS_PIN, RST_PIN);  // Create MFRC522 instance
Keypad customKeypad = Keypad( makeKeymap(hexaKeys), rowPins, colPins, ROWS, COLS);  // Create the instance of the keypad using the library
Adafruit_RA8875 tft = Adafruit_RA8875(RA8875_CS, RA8875_RESET); //Create the instance for the RA8875 driver board
////////////// Setup //////////////

void setup() {
  Serial.begin(9600);
  SPI.begin();  
  pinMode(8, OUTPUT); //RFID SPI Slave Select (SS) pin
  pinMode(10,OUTPUT); //Driverboard SPI Slave Select (SS) pin
  digitalWrite(10, LOW); 
  digitalWrite(8,HIGH);
  //Serial.println("mfrc552 initiated");
  /* Initialize the display using 'RA8875_480x80', 'RA8875_480x128', 'RA8875_480x272' or 'RA8875_800x480' */
  if (!tft.begin(RA8875_800x480)) {
    Serial.println("RA8875 Not Found");
    while (1)
      ;
  }
  /* Initialize the display using 'RA8875_480x80', 'RA8875_480x128', 'RA8875_480x272' or 'RA8875_800x480' */
  if (!tft.begin(RA8875_800x480)) {
    Serial.println("RA8875 Not Found!");
    while (1)
      ;
  }
  
  Serial.println("Setup");
  tft.displayOn(true);
  tft.GPIOX(true);                               // Enable TFT - display enable tied to GPIOX
  tft.PWM1config(true, RA8875_PWM_CLK_DIV1024);  // PWM output for backlight
  tft.PWM1out(255);
  delay(10);
  drawUserIDScreen();
  //drawPinScreen();
  //drawDurationScreen("0");
  //drawLoggedInScreen();
  digitalWrite(10,HIGH);
  digitalWrite(8,LOW);
  mfrc522.PCD_Init();
  Serial.println("Finished Setup");
}

void loop() {
  //Serial.println("test");
  //Controls which screen will be displayed and will also incorporate the control of selecting whether RFID is in use or
  //buttons and screen + implement ZigBee transmission here
  char customKey = customKeypad.getKey();
  switch (state) {

    case 1:
      // Select User ID on this screen
      //if (Serial.available()) { (Use if testing from Serial Monitor)
      digitalWrite(10,HIGH);
      digitalWrite(8,LOW);
      if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
        Serial.print("UID Tag: ");
        String content = "";
        for (byte i = 0; i < mfrc522.uid.size; i++) {
          content.concat(String(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " "));
          content.concat(String(mfrc522.uid.uidByte[i], HEX));
        }
          content.toUpperCase();
          Serial.println(content);
          delay(1000);
          drawDurationScreen(loginDuration);
          RFIDtrans += content;
          state = 6;
      }
      else if ((customKey)) {
        state = 2;
        digitalWrite(10,LOW);
        digitalWrite(8,HIGH);
        drawUserIDScreenUpdating(key1);
        break;
      }
    
    break;

    case 2:
      if ((customKey)) {
        key = customKey;   //Serial.readStringUntil('\n'); (Necessary for testing from Serial Monitor)
        if (key == "#" && key1.length() > 0) {
          userID = key1;
          key1 = "";
          state = 3;
          drawPinScreen(key1);
          // tft.textMode();
          // tft.cursorBlink(32);
          // tft.textSetCursor(100, 100);
          // tft.textColor(RA8875_BLUE, RA8875_MAGENTA);
          // tft.textEnlarge(3);
          // String temp1 = "Enter PIN: " + key1;
          // tft.textWrite(temp1.c_str());
          //break;
        }
        else if (key == "*") {
            key1.remove(key1.length() - 1);
            drawUserIDScreenUpdating(key1);
          } 
        else {
          key1 += key;
          Serial.println(key1);
          drawUserIDScreenUpdating(key1);
          key = "";
        }
      }
    break;
      
    case 3:
    // Input PIN Password here
      if (customKey) {
        key = customKey;
        if (key == "#") {
          pin = key1;
          key1 = "  ";
          state = 4;
          tft.fillScreen(RA8875_BLACK);
          tft.textMode();
          tft.cursorBlink(32);
          tft.textSetCursor(10, 100);
          tft.textEnlarge(1);
          tft.textColor(RA8875_RED, RA8875_WHITE);
          String temp2 = "Select login duration: " + key1 + "minutes";
          tft.textWrite(temp2.c_str());
          key1="";
          } 
        else if (key == "*") { 
          key1.remove(key1.length() - 1);
          drawPinScreen(key1);
        } 
        else {
          key1 += key;
          Serial.println(key1);
          drawPinScreen(key1);
          key = "";
        }
      }
    break;

    case 4:
      // Select duration of usage here
      if (customKey) {
        key = customKey;
        if (key == "#") {
          loginDuration = key1;
          key1 = "  ";
          state = 5;
          drawLoggedInScreen(key1, userID);
          key1 = "";
          // uint32_t transID = userID.toInt();
          // byte userIDBytes[4];
          // decomposeInt32(transID,userIDBytes);
          // char PINArray[4];
          // for (int i = 0; i < 4; i++) {
          //   PINArray[4] = pin.charAt(i);
          // }
          // byte time = TimeToByte(loginDuration);
          // XbeeCredentials(userIDBytes, PINArray, time);
          // delay(10000);
          // byte status;
          // status = XbeeReceive();
          } 
        else if (key == "*") {
          key1.remove(key1.length() - 1);
          drawDurationScreen(key1);
          } 
        else {
          key1 += key;
          Serial.println(key1);
          drawDurationScreen(key1);
          key = "";
          }
      }
    break;

    case 5:
      Serial.println("Enter case 5");
      if (customKey) {
        key = customKey;
        if (key == "#") {
          if (key1 == "0000"){
              //XbeeLogout();
              pin = "";
              userID = "";
              loginDuration = "";
              state = 1;
              key1 = "";
              drawUserIDScreen();
           }
          //loginDuration = key1;
          } 
        else if (key == "*") {
          key1.remove(key1.length() - 1);
          drawLoggedInScreen(key1, RFIDtrans);
          } 
        else {
          key1 += key;
          Serial.println(key1);
          drawLoggedInScreen(key1, RFIDtrans);
          key = "";
          }
      }
    break;

    case 6:
          // Select duration of usage here
      if (customKey) {
        key = customKey;
        if (key == "#") {
          loginDuration = key1;
          key1 = "  ";
          state = 5;
          String RFIDStripped = removeWhitespace(RFIDtrans);
          char RFIDArray[RFIDStripped.length()];
          for (int i = 0; i < RFIDStripped.length(); i++) {
            RFIDArray[i] = RFIDStripped.charAt(i);
          }
          byte time = TimeToByte(loginDuration);
          //XbeeRFID(RFIDArray, time);
          //drawLoggedInScreen(key1,RFIDtrans);
          key1 = "";
          } 
        else if (key == "*") {
          key1.remove(key1.length() - 1);
          drawDurationScreen(key1);
          } 
        else {
          key1 += key;
          Serial.println(key1);
          drawDurationScreen(key1);
          key = "";
          }
      }

    break;
    default:
      
      // Waiting for ZigBee transmission here as well as checking for input from buttons for state change possibly
      
      break;    
      }
    }
// This function is created to send arbitrary signals to the network hub via zigbee, they can be of variable length but the data must be parsed as bytes and the length must be defined and sent as part of the packet
void XbeeSend(const byte *Data, const size_t DataLength){
    const byte StartDelimiter = 0x7E;///< Digi Xbee Start Delimeter
    byte XbeeLength[] = {0x00, DataLength + 14};
    const byte FrameType = 0x10;
    const byte FrameID = 0x00;
    byte address64_bit[] = {0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00};
    byte address16_bit[] = {0xFF,0xFE};
    const byte BroadcastRadius = 0x00;
    const byte Options = 0x00;
    const size_t FrameLength = DataLength + 18;

    byte Frame[FrameLength];

    Frame[0] = StartDelimiter;
    memcpy(&Frame[1], XbeeLength, 2);
    Frame[3] = FrameType;
    Frame[4] = FrameID;
    memcpy(&Frame[5], address64_bit, 8);
    memcpy(&Frame[13], address16_bit, 2);
    Frame[15] = BroadcastRadius;
    Frame[16] = Options;
    memcpy(&Frame[17], Data, DataLength);
    byte checksum = calculateChecksum(Data, FrameLength);
    Frame[(FrameLength-1)] = checksum;
    Serial.write(Frame, FrameLength);
}

// A function for sending manual credential login attempts to the network hub via zigbee. It sends both the duration of the login and the credentials, i.e. the userID and the passwordPIN. 
void XbeeCredentials(const uint32_t userID, const char *pin, const byte time){
    const size_t DataLength = 10;
    const byte command = 0x01;
    byte userBytes[4];
    userBytes[0] = (userID >> 24) & 0xFF;
    userBytes[1] = (userID >> 16) & 0xFF;
    userBytes[2] = (userID >> 8) & 0xFF;
    userBytes[3] = userID & 0xFF;
    byte Data[DataLength];
    Data[0] = command;
    memcpy(&Data[1], userBytes, 4);
    memcpy(&Data[5], pin, 4);
    Data[9] = time;
    XbeeSend(Data, DataLength);
}
// This sends the manual logout request from the interlock device to the network hub via zigbee for the purpose of logging user access time
void XbeeLogout(){
    const size_t DataLength = 1;
    const byte Data = 0x00;
    XbeeSend(Data, DataLength);
}
// A function that sends the RFID login credentials and the requested access time to the network hub for credential checking
void XbeeRFID(const byte *RFID, const byte time){
    const size_t DataLength = 10;
    const byte command = 0x02;
    byte Data[DataLength];
    Data[0] = command;
    memcpy(&Data[1], RFID, 8);
    Data[9] = time;
    XbeeSend(Data, DataLength);
}
//a function to receive information from ZigBee. Called upon when we are expecting to hear back from the Network hub or if we are in a state where a command may be received from the network hub. 
byte XbeeReceive(){
    const byte StartDelimiter = 0x7E;
    const byte FrameType = 0x90;
    const byte XbeeLength = 13;

    while (Serial.available()) {
        const byte StartDelimiter = 0x7E;
        if (Serial.read() == StartDelimiter) {
            uint16_t Length = (Serial.read() << 8) | Serial.read();

            if(Length == XbeeLength && Serial.read() == FrameType){
                for (int i = 0; i < 11; i++) {
                    Serial.read();
                }
            byte Data = Serial.read();
            Serial.read();
            return Data;
            }
        }      
    }
    return -1;
}
//A function that sends, via zigbee, to the network hub a request to extend the logged in time for the current user
void XbeeExtend(const byte time){
    const size_t DataLength = 2;
    const byte command = 0x03;
    byte Data[DataLength];
    Data[0] = command;
    Data[1] = time;
    XbeeSend(Data, DataLength);
}

void decomposeInt32(uint32_t input_int, byte bytes[4]){
  bytes[3] = (input_int >> 24) & 0xFF;  // Extracts byte 3
  bytes[2] = (input_int >> 16) & 0xFF;  // Extracts byte 2
  bytes[1] = (input_int >> 8) & 0xFF;   // Extracts byte 1
  bytes[0] = input_int & 0xFF;          // Extracts byte 0
}
//A function that decomposes information into bytes for the purpose of ZigBee transmission
void decomposeInt64(uint64_t input_int, byte bytes[8]){
  bytes[7] = (input_int >> 56) & 0xFF;  // Extracts byte 7
  bytes[6] = (input_int >> 48) & 0xFF;  // Extracts byte 6
  bytes[5] = (input_int >> 40) & 0xFF;  // Extracts byte 5
  bytes[4] = (input_int >> 32) & 0xFF;  // Extracts byte 4
  bytes[3] = (input_int >> 24) & 0xFF;  // Extracts byte 3
  bytes[2] = (input_int >> 16) & 0xFF;  // Extracts byte 2
  bytes[1] = (input_int >> 8) & 0xFF;   // Extracts byte 1
  bytes[0] = input_int & 0xFF;          // Extracts byte 0
}
// Used to calculate the checksum of an input frame, given the length of the frame also
byte calculateChecksum(const byte *Frame, size_t FrameLength) {
  word sum = 0;
  for (size_t i = 3; i < (FrameLength-1); i++) {
    sum += Frame[i];
  }
    byte checksum = 0xFF - (sum & 0xFF);
    return checksum;
}
//Draws the screen for once the user has successfully logged in - displaying the user ID or RFID in addition to the time they have been approved to be logged in. It will also display the instructions to logout early.
void drawLoggedInScreen(String u, String x1) {
  tft.fillScreen(RA8875_BLACK);
  tft.textMode();
  tft.textSetCursor(50, 20);
  tft.textEnlarge(3);
  tft.textColor(RA8875_MAGENTA, RA8875_WHITE);
  tft.textWrite("Logged in as: ");
  tft.textWrite(x1.c_str());
  tft.textSetCursor(50, 100);
  tft.textColor(RA8875_RED, RA8875_WHITE);
  tft.textWrite("Login duration: ");
  tft.textSetCursor(50, 180);
  tft.textWrite(String(loginDuration).c_str());
  tft.textWrite(" minutes");
  tft.textSetCursor(50,260);
  tft.textColor(RA8875_WHITE, RA8875_RED);
  String temp3 = "Input 0000# to logout: " + u;
  tft.textWrite(temp3.c_str());
}
//Draws the manual credential initial login screen requesting a button input to begin the login sequence
void drawUserIDScreen() {
  Serial.println("DrawingFirstSCreen");
  tft.fillScreen(RA8875_BLACK);
  tft.textMode();
  tft.cursorBlink(32);
  tft.textSetCursor(100, 100);
  tft.textColor(RA8875_WHITE, RA8875_BLACK);
  tft.textEnlarge(1);
  tft.textWrite("Press any key to begin credential login");
}
//The actual screen where manual credential login begins - This screen specifically requests the users ID be input
void drawUserIDScreenUpdating(String x) {
  tft.fillScreen(RA8875_BLACK);
  tft.textMode();
  tft.cursorBlink(32);
  tft.textSetCursor(100, 100);
  tft.textColor(RA8875_WHITE, RA8875_BLACK);
  tft.textEnlarge(3);
  String temp = "Enter User ID: " + x;
  tft.textWrite(temp.c_str());
}
//The second screen in the manual credential login process - This screen specifically requests the passwordPIN
void drawPinScreen(String y) {
  tft.fillScreen(RA8875_BLACK);
  tft.textMode();
  tft.cursorBlink(32);
  tft.textSetCursor(100, 100);
  tft.textColor(RA8875_BLUE, RA8875_MAGENTA);
  tft.textEnlarge(3);
  String temp1 = "Enter PIN: " + y;
  tft.textWrite(temp1.c_str());
}
// The 2nd screen in the RFID login process and the 3rd screen in the manual credential login process - this screen specifically asks the user to input their requested login duration
void drawDurationScreen(String z) {
  tft.fillScreen(RA8875_BLACK);
  tft.textMode();
  tft.cursorBlink(32);
  tft.textSetCursor(10, 100);
  tft.textEnlarge(1);
  tft.textColor(RA8875_RED, RA8875_WHITE);
  String temp2 = "Select login duration: " + z +" minutes";
  tft.textWrite(temp2.c_str());
}


byte TimeToByte(const String& str) {
  return (byte)str.toInt();
}
//This function removes white spaces from a string. This makes sending bytes via ZigBee easier. 
String removeWhitespace(String str) {
  String result;
  for (unsigned int i = 0; i < str.length(); i++) {
    if (!isWhitespace(str.charAt(i))) {
      result += str.charAt(i);
    }
  }
  return result;
}
