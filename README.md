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

## 🚀 Key Features
* **Non-Blocking Concurrency:** Backend uses `asyncio` to probe network nodes without blocking the WebSocket heartbeat.
* **Real-Time Streaming:** Full-duplex communication via `ws://` protocol.
* **Automated Alerts:** Statistical analysis detects jitter and connection drops.