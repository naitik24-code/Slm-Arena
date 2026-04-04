@echo off
echo Starting FastAPI Backend (Port 8080)...
start "SLM Backend" cmd /k "call .\venv\Scripts\activate.bat && cd backend && uvicorn main:app --port 8080"

echo Starting React Frontend...
start "SLM Frontend" cmd /k "cd frontend && npm run dev"

echo Both servers are launching in new terminal windows!
echo Frontend UI will load at -> http://localhost:5173
