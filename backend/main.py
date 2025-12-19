import time
import asyncio
import random
import requests
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI()

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simulated network nodes with realistic regional differences
NODES = ["US-East", "EU-West", "Asia-Pacific", "South-America"]

TARGET_URL = "https://www.google.com"

# Blocking real latency measurement
def get_real_latency():
    try:
        start_time = time.time()
        requests.get(TARGET_URL, timeout=1)
        latency = (time.time() - start_time) * 1000
        return round(latency, 2)
    except Exception:
        return None

# Async-safe wrapper
async def get_latency_safe():
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, get_real_latency)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected!")

    try:
        while True:
            # Try real latency once per cycle (shared baseline)
            real_latency = await get_latency_safe()

            for node in NODES:
                # Use real latency as base if available, otherwise simulate
                if real_latency is not None:
                    base = real_latency
                else:
                    # Region-specific baseline + jitter
                    if "Asia" in node:
                        base = random.uniform(80, 180)
                    elif "South-America" in node:
                        base = random.uniform(100, 220)
                    else:
                        base = random.uniform(20, 80)

                # Add jitter and occasional spikes
                jitter = random.uniform(-30, 60)
                latency = base + jitter

                if random.random() < 0.06:  # ~6% chance of major spike
                    latency += random.uniform(150, 400)

                status = "High Latency Warning" if latency > 200 else "Normal"

                data = {
                    "node": node,
                    "timestamp": time.strftime("%H:%M:%S"),
                    "latency": round(max(0, latency), 2),
                    "status": status
                }

                await websocket.send_json(data)

            # ~2 updates per second across all nodes
            await asyncio.sleep(0.5)

    except Exception as e:
        print(f"Client disconnected: {e}")

# -------------------------------
# Production Static File Serving
# -------------------------------

# For local development (when running separately)
if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")

# For production (Docker/Render) – serve Vite build from frontend/dist
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")

if os.path.exists(STATIC_DIR):
    # Serve assets (JS, CSS, etc.)
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

    # Catch-all route for React Router (SPA)
    @app.get("/{full_path:path}")
    async def serve_react(full_path: str):
        file_path = os.path.join(STATIC_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        # Fallback to index.html for client-side routing
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))

# -------------------------------
# Local Development Runner
# -------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000)