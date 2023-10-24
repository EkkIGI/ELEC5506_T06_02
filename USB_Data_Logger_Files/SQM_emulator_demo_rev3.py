import serial
import time
import random

def wait_for_serial_message(ser):
    """@brief Wait for a message from the serial port and return it.
    
    @param ser: The serial port object.
    @type ser: Serial
    @return: The received message.
    @rtype: str
    """
    while True:
        received_message = ser.readline().decode('utf-8').strip()
        if received_message:
            return received_message

def send_serial_response(ser, response_message):
    """@brief Send a response message over the serial port.
    
    @param ser: The serial port object.
    @type ser: Serial
    @param response_message: The response message to send.
    @type response_message: str
    """
    ser.write(response_message.encode('utf-8'))
    ser.flush()

if __name__ == "__main__":
    ## Set the serial port and baud rate.
    serial_port = "COM6"
    baud_rate = 9600

    ## Open the serial port.
    with serial.Serial(serial_port, baud_rate, timeout=1) as ser:
        print("Emulator is waiting for a message...")

        rate_count = 0
        thickness_count = 0
        timer_started = False  ## Flag to indicate if the timer has started.

        while True:
            ## Generate random values for rate and thickness.
            rate = round(random.uniform(2.0, 10.0), 2)
            thickness = round(random.uniform(2.0, 10.0), 2)

            ## Wait for a message and process the received message.
            received_message = wait_for_serial_message(ser)
            print(f"Received Message: {received_message}")

            if received_message == "!$U?(91)(84)":
                ## Emulate and respond to the U message.
                if rate_count < 25 and thickness_count < 25:
                    response_message = "!%A1(118)(135)"  # Continue with normal response
                else:
                    response_message = "!%A0(118)(135)"  # Stop the process
                send_serial_response(ser, response_message)
                print(f"Sent Response: {response_message}")

            elif received_message == "!%A1?(46)(149)":
                ## Emulate and respond to the A message.
                response_message = "!0AFILM1____1.21_126__1.253_33.380__0.211_0_1(79)(59)"
                send_serial_response(ser, response_message)
                print(f"Density: {1.21}")
                print(f"Tooling: {126}")
                print(f"Z-Ratio: {1.253}")

                ## Start a timer if it hasn't been started.
                if not timer_started:
                    timer_started = True
                    start_time = time.time()

            elif received_message == "!%L1?(133)(123)":
                ## Emulate and respond to the L message.
                rate_count += 1
                response_message = f"!*A_{rate}_(91)(100)"
                print(f"Rate: {rate}")
                send_serial_response(ser, response_message)

            elif received_message == "!$N1(93)(81)":
                ## Emulate and respond to the N message.
                thickness_count += 1
                response_message = f"!+A_{thickness}_(74)(111)"
                print(f"Thickness: {thickness}")
                send_serial_response(ser, response_message)

            ## Check and respond if logging is complete.
            if rate_count >= 25 and thickness_count >= 25:
                print("Logging complete. Sending '0' to stop the process.")
                response_message = "!%A0(118)(135)"  # Stop the process
                send_serial_response(ser, response_message)
                print(f"Sent Response: {response_message}")

                ## Record the end time and display elapsed time.
                end_time = time.time()
                elapsed_time = end_time - start_time
                print(f"Elapsed Time: {elapsed_time} seconds")

                break  # Exit the loop
