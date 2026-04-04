import requests
import sys

res = requests.post(
    "http://localhost:11434/api/generate",
    json={
        "model": "phi",
        "prompt": "What is AI?",
        "stream": False
    }
)

print(res.json())