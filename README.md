# HEMS Ops Center: Packaging & Distribution Guide

## 1. Overview

The HEMS Ops Center is a comprehensive platform for Helicopter Emergency Medical Services (HEMS) operations. It provides a suite of tools for mission planning, live tracking, fleet management, and crew coordination. The system is designed to be used by dispatchers, pilots, and administrative staff to streamline operations and enhance situational awareness.

This guide provides instructions on how to package and distribute the HEMS Ops Center desktop application, as well as an overview of the project's current status and future roadmap.

## 2. What's Happening Now

The HEMS Ops Center is in a stable, feature-rich state. Recent developments have focused on:

*   **Cross-Platform Desktop Application:** The core application is now a standalone desktop app built with Electron, providing a consistent experience across Windows and macOS.
*   **Real-Time Mission Tracking:** A live map interface allows for real-time tracking of all active missions, with detailed telemetry data.
*   **Comprehensive Mission Planning:** A multi-step mission planner enables the creation of detailed mission profiles, including crew assignment, patient details, and flight calculations.
*   **Fleet & Crew Management:** The platform includes a directory of all helicopters and personnel, with detailed information on each.
*   **Integrated Dispatch System:** A dispatch system with AI-powered features is available as a separate, downloadable application.

## 3. What to Expect

The HEMS Ops Center is under continuous development. Future releases will focus on:

*   **Enhanced AI Capabilities:** The AI dispatcher will be further enhanced with more sophisticated natural language processing and decision-making capabilities.
*   **Mobile Application:** A native mobile application for iOS and Android will be developed to provide pilots with a more streamlined in-flight experience.
*   **Deeper Simulator Integration:** We will be working to create a more seamless integration with popular flight simulators, such as X-Plane and Microsoft Flight Simulator.
*   **Offline Functionality:** The desktop application will be enhanced to provide more robust offline capabilities, allowing for mission planning and data access even without an internet connection.

## 4. Packaging the Application

The HEMS Ops Center desktop application can be packaged for Windows and macOS using the `electron-builder` tool.

### 4.1. Prerequisites

Before you can package the application, you must have the following installed:

*   Node.js (v18 or later)
*   npm (v9 or later)

### 4.2. Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/hems-ops-center.git
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```

### 4.3. Packaging for Windows

To package the application for Windows, run the following command:

```bash
npm run electron:build:win
```

This will generate an `.exe` installer in the `dist` directory.

### 4.4. Packaging for macOS

To package the application for macOS, run the following command:

```bash
npm run electron:build:mac
```

This will generate a `.dmg` file in the `dist` directory.

## 5. Distribution

The packaged application can be distributed to users in a variety of ways:

*   **Direct Download:** The `.exe` and `.dmg` files can be hosted on a website or file server for direct download.
*   **Automatic Updates:** The application is configured to automatically check for updates and notify the user when a new version is available.
*   **App Stores:** In the future, the application may be distributed through the Mac App Store and the Microsoft Store.

## 6. Lua Script for X-Plane

The X-Plane plugin for HEMS Ops Center uses a Lua script to communicate with the application. The script can be downloaded and viewed using the following link:

[Download hems_xplane_connector.lua](<REPLACE_WITH_ACTUAL_DOWNLOAD_LINK>)

To view the script, you can open it in any text editor. The script is written in Lua and can be easily understood by anyone with a basic knowledge of programming.
