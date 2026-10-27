# SLM Arena 🚀

SLM Arena is a premium, ChatGPT-style benchmarking application for Small Language Models (SLMs). It allows you to run, compare, and analyze performance metrics for multiple local models (Mistral, Phi-3, Llama 3) simultaneously using Ollama.

![SLM Arena Redesign](https://img.shields.io/badge/Interface-ChatGPT--Style-blue)
![Backend](https://img.shields.io/badge/Backend-FastAPI-green)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb)

## ✨ Features

- **Premium Chat Interface**: A clean, threaded conversation UI inspired by ChatGPT.
- **Parallel Benchmarking**: Run up to 3 models side-by-side to compare responses in real-time.
- **Performance Metrics**: Detailed tracking of latency (ms), throughput (tokens/sec), and token counts.
- **System Monitoring**: Live tracking of CPU, RAM, and Disk usage during model inference.
- **Dark Mode**: Native support for OS-level and manual dark/light mode toggling.
- **Chat History**: Persistent conversation history stored locally.
- **Docker Support**: Containerized deployment for easy setup.

## 🛠 Tech Stack

- **Frontend**: React, Vite, Recharts (for visualizations), Lucide-React (icons).
- **Backend**: FastAPI, HTTPX (async streaming), psutil (system stats).
- **Inference**: Ollama (running on host machine for GPU acceleration).
- **Deployment**: Docker, Docker Compose, Nginx (reverse proxy).

## 🚀 Getting Started

### Prerequisites

1.  **Install Ollama**: Download and install from [ollama.com](https://ollama.com).
2.  **Pull Models**:
    ```bash
    ollama pull mistral
    ollama pull phi3
    ollama pull llama3
    ```

### Option 1: Run with Docker (Recommended)

The easiest way to get started. Handles all dependencies and networking automatically.

**Windows:**
```powershell
.\start.bat
```

**Mac/Linux:**
```bash
chmod +x scripts/start.sh
./scripts/start.sh
```

### Option 2: Run Manually (Development)

#### Backend
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
python main.py
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📊 Accessing the App

- **App**: [http://localhost](http://localhost) (Docker) or [http://localhost:5173](http://localhost:5173) (Manual)
- **API Docs**: [http://localhost:8080/docs](http://localhost:8080/docs)

## ⚠️ Important Notes for Large Models (Llama 3)

Running Llama 3 in parallel with other models is hardware-intensive.
- **Timeout**: The app has a built-in 5-minute timeout to allow Llama 3 to initialize.
- **VRAM**: If you experience crashes or slow performance, try turning off **Compare Mode** or running only one model at a time.

---
Built with ❤️ for local LLM enthusiasts.
