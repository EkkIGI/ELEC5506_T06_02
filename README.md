# ELEC5506_T06_02: Team 6 Design Outputs

## Introduction

Welcome to the ELEC5506_T06_02 repository! This repository serves as a comprehensive collection of design outputs from Team 06's work in the University of Western Australia's Electrical Design Project Part 2 (ELEC5506), specifically for project one. The central focus of this design project is the creation of a robust data logging and access control system, tailor-made to meet the unique needs of the ANFF WA laboratories.

The design itself is intricate and modular, comprising five key components:

1.  USB Data Logger: Captures and logs data from devices connected via USB.
2.  RS232 Data Logger: Gathers and logs data from devices interfacing through RS232.
3.  Interlock Module: Ensures safe and secure access control.
4.  Gateway Device: Serves as a central hub for data transmission and network management.
5.  Webserver: Manages data storage, access, and presents a user interface for interaction.

By integrating Zigbee 3.0 technology with Digi XBee3 devices, the gateway module is able to establish a meshed network. This network facilitates seamless communication, transmitting all logged data and interlock requests directly to the webserver module, ensuring efficiency and reliability in data management and access control.

## Repository Layout

### Root Folder Structure

-   **/Documentation/**:
    
    -   This directory is populated with comprehensive source code documentation for the gateway, interlock, and data logging modules, meticulously generated using Doxygen. The documentation is accessible in two formats: as a downloadable PDF or viewable directly in a web browser using the provided HTML files.
-   **/Manuals/**:
    
    -   Here, you will find detailed configuration and setup manuals applicable to all modules. This folder also houses additional resources and information pertaining to the Digi XBee data APIs, ensuring you have all the knowledge needed to successfully implement and interact with the system.
-   **/Schematics/**:
    
    -   This folder is the go-to destination for all schematics and visual representations of both the hardware and software aspects of the design. It serves as a valuable resource for understanding the intricacies of the system’s architecture and functionality.
-   **/src/**:
    
    -   The `/src/` directory contains all the source code pertinent to the various modules. Each module's code is organised and stored here, ready for implementation, testing, and further development.

## Getting Started

Please refer to the `/Manuals/` directory for detailed setup and configuration instructions for each module. Ensure that you have all necessary hardware and software components ready, and follow the provided guides to ensure a smooth setup process.
