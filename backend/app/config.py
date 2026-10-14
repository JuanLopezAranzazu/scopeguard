import os

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434").rstrip("/")
MODEL_NAME = os.getenv("MODEL_NAME", "qwen2.5:3b")
TEMPERATURE = float(os.getenv("TEMPERATURE", "0.1"))
NUM_CTX = int(os.getenv("NUM_CTX", "4096"))
TIMEOUT = float(os.getenv("OLLAMA_TIMEOUT", "180"))
CORS_ORIGINS = [
    o.strip()
    for o in os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if o.strip()
]
