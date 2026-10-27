import asyncio
import json
import os
import sys
import time
from typing import List, Optional

import httpx
import psutil
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

app = FastAPI(title="SLM Benchmarking API")

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE", "http://localhost:11434")
DEFAULT_MODELS = ["mistral", "phi3", "llama3"]

# Pydantic Models
class HealthResponse(BaseModel):
    status: str
    ollama: bool
    available_models: List[str]

class SystemStats(BaseModel):
    cpu_percent: float
    memory_percent: float
    memory_used_mb: float
    memory_total_mb: float
    disk_percent: float

class QueryRequest(BaseModel):
    prompt: str
    models: Optional[List[str]] = Field(default=DEFAULT_MODELS)
    max_tokens: Optional[int] = 512

class ModelResult(BaseModel):
    model: str
    response: str
    latency_ms: float
    tokens_per_second: float
    eval_count: int
    prompt_eval_count: int
    cpu_percent: float
    memory_mb: float
    error: Optional[str] = None

class BenchmarkResult(BaseModel):
    prompt: str
    results: List[ModelResult]
    total_time_ms: float
    fastest_model: str
    timestamp: float

# Helper functions
async def get_ollama_tags():
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            response.raise_for_status()
            data = response.json()
            return [model["name"].split(":")[0] for model in data.get("models", [])]
        except Exception:
            return []

async def query_model(model: str, prompt: str, max_tokens: int) -> ModelResult:
    start_time = time.time()
    cpu_snapshot = psutil.cpu_percent()
    mem_snapshot = psutil.Process().memory_info().rss / (1024 * 1024)
    
    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {"num_predict": max_tokens}
                }
            )
            response.raise_for_status()
            data = response.json()
            
            end_time = time.time()
            latency_ms = (end_time - start_time) * 1000
            
            eval_count = data.get("eval_count", 0)
            # tokens_per_second = eval_count / (eval_duration_ns / 1e9)
            # But let's use the actual time we measured for simplicity or if ns not available
            eval_duration_ns = data.get("eval_duration", 1)
            tps = eval_count / (eval_duration_ns / 1e9) if eval_duration_ns > 0 else 0
            
            return ModelResult(
                model=model,
                response=data.get("response", ""),
                latency_ms=round(latency_ms, 2),
                tokens_per_second=round(tps, 2),
                eval_count=eval_count,
                prompt_eval_count=data.get("prompt_eval_count", 0),
                cpu_percent=cpu_snapshot,
                memory_mb=round(mem_snapshot, 2)
            )
    except Exception as e:
        return ModelResult(
            model=model,
            response="",
            latency_ms=0,
            tokens_per_second=0,
            eval_count=0,
            prompt_eval_count=0,
            cpu_percent=cpu_snapshot,
            memory_mb=round(mem_snapshot, 2),
            error=str(e)
        )

# Routes
@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """
    Checks the health of the API and Ollama connectivity.
    """
    models = await get_ollama_tags()
    return HealthResponse(
        status="ok",
        ollama=len(models) > 0,
        available_models=models
    )

@app.get("/api/system", response_model=SystemStats)
async def system_stats():
    """
    Returns live system resource usage (CPU, Memory, Disk).
    """
    disk_path = "C:\\" if sys.platform == "win32" else "/"
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage(disk_path)
    
    return SystemStats(
        cpu_percent=psutil.cpu_percent(interval=None),
        memory_percent=mem.percent,
        memory_used_mb=round(mem.used / (1024 * 1024), 2),
        memory_total_mb=round(mem.total / (1024 * 1024), 2),
        disk_percent=disk.percent
    )

@app.post("/api/query", response_model=BenchmarkResult)
async def benchmark_query(request: QueryRequest):
    """
    Runs a prompt across multiple models in parallel and returns benchmark metrics.
    """
    start_total = time.time()
    
    tasks = [query_model(m, request.prompt, request.max_tokens) for m in request.models]
    results = await asyncio.gather(*tasks)
    
    end_total = time.time()
    total_time_ms = (end_total - start_total) * 1000
    
    # Filter out errors for fastest model calculation
    valid_results = [r for r in results if not r.error]
    fastest_model = "N/A"
    if valid_results:
        fastest_model = min(valid_results, key=lambda x: x.latency_ms).model
        
    return BenchmarkResult(
        prompt=request.prompt,
        results=results,
        total_time_ms=round(total_time_ms, 2),
        fastest_model=fastest_model,
        timestamp=time.time()
    )

@app.get("/api/stream/{model}")
async def stream_model(model: str, prompt: str, max_tokens: int = 512):
    """
    Streams tokens from a specific Ollama model using Server-Sent Events (SSE).
    """
    async def event_generator():
        start_time = time.time()
        token_count = 0
        
        try:
            async with httpx.AsyncClient(timeout=180.0) as client:
                async with client.stream(
                    "POST",
                    f"{OLLAMA_BASE_URL}/api/generate",
                    json={
                        "model": model,
                        "prompt": prompt,
                        "stream": True,
                        "options": {"num_predict": max_tokens}
                    }
                ) as response:
                    async for line in response.aiter_lines():
                        if not line:
                            continue
                        
                        data = json.loads(line)
                        token_count += 1
                        current_time = time.time()
                        latency_ms = (current_time - start_time) * 1000
                        tps = token_count / (current_time - start_time) if (current_time - start_time) > 0 else 0
                        
                        yield f"data: {json.dumps({
                            'token': data.get('response', ''),
                            'done': data.get('done', False),
                            'latency_ms': round(latency_ms, 2),
                            'tokens_per_second': round(tps, 2),
                            'token_count': token_count
                        })}\n\n"
                        
                        if data.get("done"):
                            break
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
