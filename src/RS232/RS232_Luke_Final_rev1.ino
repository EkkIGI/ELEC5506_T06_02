/**
 * @file main.cpp
 * @brief Arduino code for monitoring the SQM-160, logging the process data to an SD card, and sending data over Zigbee.
 */

#include <stdio.h>
#include <SoftwareSerial.h>
#include <Arduino.h>
#include <SD.h>
#include <SPI.h>

// Constants
const int baudRate = 9600; ///< RS232 baud rate of 9600, this can be updated to 19200 for use with SQM-160
const int pollInterval = 1000; ///< Log interval in milliseconds
const int timeoutResponse = 100; ///< Wait time for serial response
const String messageA = "!%A1?(46)(149)"; ///< A message
const String messageL = "!%L1?(133)(123)"; ///< L message
const String messageN = "!$N1(93)(81)";   ///< N message
const String messageU = "!$U?(91)(84)";   ///< U message

// Variables
char responseU, UTracker = '0'; ///< Initialise responseU to 0 and a flag for the U tracker
bool logActive = false; ///< Flag for if a log is active
unsigned long lastPollTime = 0; ///< Initialise the last poll time to 0.

/**
 * @brief Function to set up the baud rate for Serial port (RS232) and for the Serial1 port (Zigbee)
 * Sets up a timeout for inactive responses
 * Initialises the SD card for writing
 */
void setup() {
  Serial1.begin(baudRate);
  Serial1.setTimeout(timeoutResponse);
  Serial.begin(baudRate);
  Serial.setTimeout(timeoutResponse);
  if (!SD.begin(53)) {
    Serial1.println("SD Card Initialisation failed");
    return;
  }
  Serial1.println("SD Card Initialisation successful");
}

/**
 * @brief Main loop function
 */
void loop() {
  unsigned long currentMillis = millis(); // Get the current time

  // If serial is connected and the difference between the current time - last poll time is greater than the poll interval, then it is polling every 1 second
  if (Serial && (currentMillis - lastPollTime > pollInterval)) {
    lastPollTime = currentMillis;
    Serial1.println(messageU); // Sends command U to check if the shutter is on
    String readResponseU = readSerialResponse();
    Serial1.println(readResponseU);
    responseU = extractResponseU(readResponseU); // Extracts the response of U from the string sent back from SQM160

    // If there is a change in state
    if (responseU != UTracker) {
      if (responseU == '1') {
        // A process has started, so set the logActive flag to true
        float density, tooling, zRatio;
        logActive = true;
        Serial1.println(messageA); // Send command A to extract the density, tooling, and zRatio at the start of the process
        String readResponseA = readSerialResponse();
        extractResponseA(readResponseA, density, tooling, zRatio);
        
        writeToSDCardFloat(density);
        writeToSDCardFloat(tooling);
        writeToSDCardFloat(zRatio);
      } else {
        // The deposition process has ended and needs to send the data to zigbee
        logActive = false;
        sendToZigbee(); // Send to Zigbee
        deleteAllTextEntries(); // Delete all entries of the text file so that the new process starts on an empty text file.
      }
    }

    // There was no change in state from the previous state, and an active process is happening,
    // so get the values for the rate and thickness and write them to SD card
    if (logActive) {
      Serial1.println(messageL);
      String readResponseL = readSerialResponse();
      float rate = extractResponseL(readResponseL);
      writeToSDCardFloat(rate);
      Serial1.println(messageN);
      String readResponseN = readSerialResponse();
      float thickness = extractResponseN(readResponseN);
      writeToSDCardFloat(thickness);
    }
    UTracker = responseU; // Update the UTracker to the current value
  }
}

/**
 * @brief Function to read a string from the serial buffer
 * @return The read string
 */
String readSerialResponse() {
  String response = Serial1.readString();
  return response;
}

/**
 * @brief Function to handle the extraction of the density, tooling, and zratio values from the received string from SQM
 * The received string structure is: !0AFILM1____1.01_120__1.213_33.380__0.211_0_1(79)(59), where the first three values are the desired values
 * The function returns them as floats
 * @param receivedPacket The received string
 * @param density Output parameter for density
 * @param tooling Output parameter for tooling
 * @param zRatio Output parameter for zRatio
 */
void extractResponseA(const String &receivedPacket, float &density, float &tooling, float &zRatio) {
  int underscorePos = receivedPacket.indexOf("____");
  if (underscorePos != -1) {
    int startPos = underscorePos + 4;
    int endPos = receivedPacket.indexOf('_', startPos);
    if (endPos != -1) {
      String densityStr = receivedPacket.substring(startPos, endPos);
      density = densityStr.toFloat();
    }
    startPos = endPos + 1;
    endPos = receivedPacket.indexOf('__', startPos);
    if (endPos != -1) {
      String toolingStr = receivedPacket.substring(startPos, endPos);
      tooling = toolingStr.toFloat();
    }
    startPos = endPos + 2;
    endPos = receivedPacket.indexOf('_', startPos);
    if (endPos != -1) {
      String zRatioStr = receivedPacket.substring(startPos, endPos);
      zRatio = zRatioStr.toFloat();
    }
  }
}

/**
 * @brief Function to handle the extraction of the response from command U
 * The received string structure is: !%A1(118)(135) where the value of U is the 4th character (either 1 or 0)
 * @param receivedPacket The received string
 * @return The extracted response character
 */
char extractResponseU(const String &receivedPacket) {
  if (receivedPacket.length() >= 4) {
    return receivedPacket.charAt(3);
  }
  return '\0'; // Return null character if response is too short
}

/**
 * @brief Function to handle the extraction of the rate from the returned string from command L
 * The received string structure is: !*A_8.20_(91)(100) where the rate value is the float after the first underscore
 * @param receivedPacket The received string
 * @return The extracted rate value
 */
float extractResponseL(const String &receivedPacket) {
  int underscore1 = receivedPacket.indexOf('_');
  int underscore2 = receivedPacket.indexOf('_', underscore1 + 1);
  if (underscore1 != -1 && underscore2 != -1) {
    String rateStr = receivedPacket.substring(underscore1 + 1, underscore2);
    return rateStr.toFloat();
  }
  return 0.0; // Return 0.0 if response is invalid
}

/**
 * @brief Function to handle the extraction of the thickness from the returned string from command N
 * The received string structure is: !+A_2.00_(74)(111) where the thickness value is the float after the first underscore
 * @param receivedPacket The received string
 * @return The extracted thickness value
 */
float extractResponseN(const String &receivedPacket) {
  int underscore1 = receivedPacket.indexOf('_');
  int underscore2 = receivedPacket.indexOf('_', underscore1 + 1);
  if (underscore1 != -1 && underscore2 != -1) {
    String thicknessStr = receivedPacket.substring(underscore1 + 1, underscore2);
    return thicknessStr.toFloat();
  }
  return 0.0; // Return 0.0 if response is invalid
}

/**
 * @brief Function to write a float value to the SD card
 * @param value The float value to write
 */
void writeToSDCardFloat(float value) {
  // Open the file for writing
  File dataFile = SD.open("data.txt", FILE_WRITE);

  // If the file is open, write the data
  if (dataFile) {
    dataFile.write((byte*)&value, sizeof(float));
    dataFile.flush();
    Serial1.println("Data written to SD card");
    Serial1.println("closing the file");
    dataFile.close();
    Serial1.println("file closed"); 
  } 
  else {
    // If the file isn't open, print an error
    Serial1.println("Error opening data File");
  }
}

/**
 * @brief Function that deletes every entry of the text file after all the data has been sent to zigbee for that process
 */
void deleteAllTextEntries() {
  // Open the file for writing and truncate (clear) its content
  File dataFile = SD.open("data.txt", FILE_WRITE | O_TRUNC);

  // Check if the file is open
  if (dataFile) {
    // Close the file
    dataFile.close();
    Serial.println("All values deleted from the file.");
  } else {
    Serial1.println("Error opening data file");
  }
}

/**
 * @brief Function to send data to Zigbee
 */
void sendToZigbee() {
  // Constants to set up the frame readable by the Xbee module
  const byte StartDelimiter = 0x7E;
  const word headerLength = 0x001A; // Value that goes into the "Length" portion of the frame structure
  const word Length = 0x00D6; // Length of the rate/thickness frame
  const byte FrameType = 0x10; 
  const byte headerFrameID = 0x01; // ID of the header frame (density, tooling and zratio)
  const uint64_t address1 = 0x0000000000000000; // 64 bit address
  const word address2 = 0xFFFE; // 16 bit address
  const byte BroadcastRadius = 0x00; // Broadcast radius
  const byte options = 0x00; // Options
  const size_t headerFrameLength = 30; // Total length of the density, tooling, zratio frame
  const size_t headerDataLength = 12; // Number of bytes storing the density, tooling and zratio
  const size_t DataLength = 200; // Number of bytes storing the rate and thickness values (25 x 2 x 4)
  const size_t FrameLength = 218; // Total length of the rate, thickness frame

  File dataFile = SD.open("data.txt", FILE_READ);
  if (dataFile) {
    // Send the first three value (density, tooling and zratio) to zigbee first
    byte FrameID = 1;
    byte HeaderData[headerDataLength];
    for (int i = 0; i < headerDataLength; i += 4) {
      if (dataFile.available()) {
        float value;
        dataFile.read((byte*)&value, sizeof(float));  // Read raw bytes
        memcpy(&HeaderData[i], &value, 4);
      }
    }
    byte Headerframe[headerFrameLength];
    Headerframe[0] = StartDelimiter;
    Headerframe[1] = (headerLength >> 8) & 0xFF; // High byte
    Headerframe[2] = headerLength & 0xFF; // Low byte
    Headerframe[3] = FrameType;
    Headerframe[4] = headerFrameID;
    byte address1Bytes[8];
    for (int i = 0; i < 8; i++) {
      address1Bytes[i] = (address1 >> (i * 8)) & 0xFF;
    }
    memcpy(&Headerframe[5], address1Bytes, 8);
    Headerframe[13] = (address2 >> 8) & 0xFF; // High byte
    Headerframe[14] = address2 & 0xFF; // Low byte
    Headerframe[15] = BroadcastRadius;
    Headerframe[16] = options;
    memcpy(&Headerframe[17], HeaderData, headerDataLength);
    byte checksum = calculateChecksum(Headerframe,headerFrameLength);
    Headerframe[29] = checksum;
    Serial.write(Headerframe, headerFrameLength);

    // Once the density, tooling and zratio have been sent, send the remaining data in frames where the length of data is 50
    while (dataFile.available()) {
      FrameID++;
      byte Data[DataLength] = {0};
      for (int i = 0; i < DataLength; i += 4) {
        if (dataFile.available()) {
          float value;
          dataFile.read((byte*)&value, sizeof(float));
          memcpy(&Data[i], &value, 4);
        }
      }
      byte DataFrame[FrameLength];
      DataFrame[0] = StartDelimiter;
      DataFrame[1] = (Length >> 8) & 0xFF; // High byte
      DataFrame[2] = Length & 0xFF; // Low byte
      DataFrame[3] = FrameType;
      DataFrame[4] = FrameID;
      memcpy(&DataFrame[5], address1Bytes, 8);
      DataFrame[13] = (address2 >> 8) & 0xFF; // High byte
      DataFrame[14] = address2 & 0xFF; // Low byte
      DataFrame[15] = BroadcastRadius;
      DataFrame[16] = options;
      memcpy(&DataFrame[17], Data, DataLength);
      byte checksum = calculateChecksum(DataFrame, FrameLength);
      DataFrame[217] = checksum;
      Serial.write(DataFrame, FrameLength);
    }
  } else {
    Serial1.println("Error opening data file");
  }
  dataFile.close();
}

/**
 * @brief Function to calculate the checksum of a frame
 * @param Frame Pointer to the frame
 * @param FrameLength Length of the frame
 * @return The calculated checksum
 */
byte calculateChecksum(const byte *Frame, size_t FrameLength) {
  word sum = 0;
  for (size_t i = 3; i < (FrameLength-1); i++) {
    sum += Frame[i];
  }
    // Trim the sum to 8 bits and subtract from 0xFF
    byte checksum = 0xFF - (sum & 0xFF);
  return checksum;
}
