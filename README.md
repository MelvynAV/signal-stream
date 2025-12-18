# signal-stream (Still under construction )
# 📡 SignalStream: Real-Time Network Telemetry Dashboard

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Python](https://img.shields.io/badge/python-3.10-blue) ![React](https://img.shields.io/badge/react-18-blue) ![AWS](https://img.shields.io/badge/AWS-EC2-orange)

**SignalStream** is a full-stack network monitoring tool designed to visualize high-frequency telemetry data. Unlike standard dashboards that rely on REST API polling, SignalStream utilizes **WebSockets** to stream latency metrics in real-time (500ms intervals), simulating the performance requirements of enterprise telecom infrastructure.

It features an automated **Anomaly Detection Engine** that flags network degradation (latency spikes > 200ms) instantly, providing operators with immediate visual feedback.

![SignalStream Dashboard](LINK_TO_IMAGE)

## 🛠️ Tech Stack
* **Backend:** Python 3.10, FastAPI, Uvicorn, AsyncIO
* **Frontend:** React.js (Vite), Recharts
* **DevOps:** AWS EC2 (Ubuntu Linux), Security Groups

## 🛠 Prerequisites

Before you begin, ensure you have the following installed on your local machine:
* **Python 3.10+** (Required for the backend)
* **Node.js (v18+) & npm** (Required for the frontend)
* **Git** (For cloning the repository)

---
## 🚀 Local Development Setup

Follow these steps exactly to clone, install, and run the application.
 
 1. Clone the Repository
Open your terminal and run:
git clone [https://github.com/MelvynAv/signal-stream.git](https://github.com/MelvynAv/signal-stream.git)
cd signal-stream

Backend Setup (FastAPI)
The backend generates and streams data via a WebSocket server.

Navigate to the backend directory:

Bash

cd backend
Activate the Virtual Environment:
Windows : 
..\.venv\Scripts\activate
Mac/Linux:
source ../.venv/bin/activate
Install Python Dependencies:

pip install -r requirements.txt
Launch the Backend Server:

python main.py
The server should initialize and report: INFO: Uvicorn running on http://127.0.0.1:5000.

Then keep the backend running and open a new terminal and go to : 
cd frontend 
npm install
Start the Development Server:
npm run dev
🖥️ Accessing the Application
Once both servers are running, open your browser to the URL provided by Vite: http://localhost:5173
The dashboard should display a "Network Status: Active" indicator.
Real-time latency and network telemetry will begin plotting on the live Recharts graph.

🏗️ Technical Architecture & Debugging
To ensure local connectivity and performance, the following technical configurations were implemented:
FastAPI Implementaion: Migrated the entry point to an ASGI-compliant uvicorn.run implementation to support asynchronous WebSocket streaming.
WebSocket Synchronization: Mapped the frontend connection string in App.jsx (ws://127.0.0.1:5000/ws) to the backend's listener port to resolve ERR_CONNECTION_REFUSED errors.
UI Optimization: Wrapped the Recharts ResponsiveContainer in a fixed-height parent div to ensure correct dimensions during the initial render and prevent chart collapse.

🐛 Common Troubleshooting
WebSocket Closed (Code 1006): Ensure the backend is fully initialized and listening on Port 5000 before the frontend attempts to establish the handshake.

Missing Dependencies: Ensure you have activated the .venv before running python main.py to avoid ModuleNotFoundError.

Port Conflicts: If Port 5000 is in use, kill existing Python processes using stop-process -name python -force (Windows).
