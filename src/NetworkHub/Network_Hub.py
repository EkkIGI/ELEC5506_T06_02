## @package py_xbee
#  @brief This module provides functions to parse and send data from XBee devices and RS232 interfaces.
#
#  The main functionalities include data parsing from Zigbee, USB log, and RS232,
#  as well as sending the parsed data to a specified URL.
#  It also implements a watchdog timer for RS232 data reception.

import struct
import time
import threading
import requests
import json
from digi.xbee.devices import XBeeDevice
from datetime import datetime

## @brief Parse and return Zigbee data for "Verify" command from an interlock device.
#  @param data_bytes Byte array of raw data.
#  @return Dictionary of parsed data.
def parse_verify_data(data_bytes):
    command_value = struct.unpack('<H', data_bytes[0])
    if command_value == 1:  # Credential Login
        user_id, pin1, pin2, pin3, pin4, time_length = struct.unpack('<I C C C C B', data_bytes[1:10])
        return {
            "Command": "Credential Login",
            "User ID": user_id,
            "Pin": pin1+pin2+pin3+pin4,
            "Time-Length": time_length
        }
    elif command_value == 2:  # RFID Login
        rfid1, rfid2, rfid3, rfid4, time_length = struct.unpack('<B B B B B', data_bytes[1:6])
        return {
            "Command": "RFID Login",
            "RFID1": rfid1,
            "RFID2": rfid2,
            "RFID3": rfid3,
            "RFID4": rfid4,
            "Time Length": time_length
        }
    elif command_value == 3:  # Extend
        time_length, = struct.unpack('<B', data_bytes[1])
        return {
            "Command": "Extend",
            "Time Length": time_length
        }

## @brief Parse and return Zigbee data for "Validate" command from an interlock device.
#  @param data_bytes Byte array of raw data.
#  @return Dictionary of parsed data.
def parse_validate_data(data_bytes):
    user_id, outcome = struct.unpack('<I B', data_bytes)
    return {
        "User ID": user_id,
        "Outcome": "Successful" if outcome == 1 else "Unsuccessful"
    }

## @brief Parse and return header and body data from RS232 interface.
#  @param data_bytes Byte array of raw data.
#  @return Dictionary of parsed data.
def parse_zigbee_data(data_bytes):
    if len(data_bytes) == 12:  # Header frame consisting of 12 bytes data
        density, tooling, z_ratio = struct.unpack('<f f f', data_bytes) #the data types are f, f, f
        return {
            "Density": density,
            "Tooling": tooling,
            "Z Ratio": z_ratio
        }
    elif len(data_bytes) == 200:  # Body frame, this consists of 25 values of rate and thickness which sums to 50
        values = struct.unpack('<' + 'f' * 50, data_bytes) #All the data are floats which takes 4 bytes, hence lenth is 4 * 50 = 200
        data_dict = {}
        for i in range(25): #do iteration of rate and thickness up to 25 for both value
            data_dict[f"Rate{i+1}"] = values[2*i] 
            data_dict[f"Thickness{i+1}"] = values[2*i+1]  
        return data_dict


## @brief Parse and return USB log data.
#  @param data_bytes Byte array of raw data.
#  @return Dictionary of parsed data.
def parse_data(data_bytes):
    penningpr_time0, msk_time0, penningpr_timemax, msk_timemax, process_time, ICPpower_avg, containsStandardCleaning = struct.unpack('>f f f f I f B', data_bytes)
    return {
        "logid": 8,
        "device_id": 8,
        "log_data": {
            "penningpr_time0": penningpr_time0,
            "msk_time0": msk_time0,
            "penningpr_timemax": penningpr_timemax,
            "msk_timemax": msk_timemax,
            "process_time": process_time,
            "ICPpower_avg": ICPpower_avg,
            "containsStandardCleaning": containsStandardCleaning
        },
        "time_submitted": "test",
        "dataframe": 0
    }  # this return values are in JSON format with the same header to be sent to the webserver using http request

## @brief A function to handle watchdog timer timeout.
#  Resets state and logs timeout event.
def watchdog_timeout():
    print("Watchdog timer expired. Back to search mode.")
    global waiting_for_body
    waiting_for_body = False

## @brief Starts the watchdog timer with a 60-second timeout.
def start_watchdog_timer():
    global watchdog_timer
    watchdog_timer = threading.Timer(60.0, watchdog_timeout)
    watchdog_timer.start()

## @brief Resets the watchdog timer.
def reset_watchdog_timer():
    global watchdog_timer
    watchdog_timer.cancel()
    start_watchdog_timer()

## @brief Posts JSON data to the specified URL.
#  @param url The URL to post data to.
#  @param data The data to be posted.
def post_to_url(url, data):
    headers = {'Content-Type': 'application/json'}
    try:
        response = requests.post(url, json=data, headers=headers)
        if response.status_code != 200:
            print(f"Failed to post data. Status code: {response.status_code}. Response: {response.text}")
        else:
            print(f"Data posted successfully: {response.text}")
    except requests.RequestException as e:
        print(f"Network error occurred: {e}")

## @brief The main function for setting up the XBee device, reading data, and initiating parsing.
def main():
    # XBEE device is configured as 9600 baud rate and the location of serial port is ttyUSB0 in beagleboard
    device = XBeeDevice("/dev/ttyUSB0", 9600)
    # initiating an array of received data
    received_data_list = []
    global waiting_for_body
    waiting_for_body = False

    try:
        device.open()
        device.flush_queues()

        while True:
            # reading the data from serial port as defined earlier
            xbee_message = device.read_data()
            # When there is something sent, then executes this loop
            if xbee_message is not None:
                # get the address of the sender
                remote_addr = xbee_message.remote_device.get_64bit_addr()
                # get the sent hex data from end devices
                hex_data = xbee_message.data.hex()
                print(f"From {remote_addr}: {hex_data}")

                # USB data log condition
                if str(remote_addr) == "0013A200423D8A1B" and len(xbee_message.data) == 25:
                    parsed_data = parse_data(xbee_message.data)
                    post_to_url('http://192.168.137.34:3000/logs', parsed_data)

                # Zigbee data log condition
                elif str(remote_addr) == "0013A2004200AE52" and len(xbee_message.data) == 12:
                    parsed_data = parse_zigbee_data(xbee_message.data)
                    post_to_url('http://192.168.137.34:3000/logs', parsed_data)

                # Zigbee data log condition
                elif str(remote_addr) == "0013A2004200AE52" and len(xbee_message.data) == 200:
                    parsed_data = parse_zigbee_data(xbee_message.data)
                    post_to_url('http://192.168.137.34:3000/logs', parsed_data)

    finally:
        if device is not None and device.is_open():
            device.close()

if __name__ == "__main__":
    main()
