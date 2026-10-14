from typing import Type, TypeVar

import httpx
from pydantic import BaseModel, ValidationError

from . import config

T = TypeVar("T", bound=BaseModel)


class LLMError(Exception):
    pass


async def chat_json(
    schema: Type[T], system: str, user: str, model: str | None = None
) -> T:
    m = model or config.MODEL_NAME
    payload = {
        "model": m,
        "stream": False,
        "format": schema.model_json_schema(),
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "options": {"temperature": config.TEMPERATURE, "num_ctx": config.NUM_CTX},
        "keep_alive": "10m",
    }

    last_err: Exception | None = None
    for _ in range(2):  # one retry if the JSON fails validation
        try:
            async with httpx.AsyncClient(timeout=config.TIMEOUT) as client:
                r = await client.post(f"{config.OLLAMA_URL}/api/chat", json=payload)
        except httpx.ConnectError:
            raise LLMError(
                f"Could not connect to Ollama at {config.OLLAMA_URL}. "
                "Start it with `ollama serve` and try again."
            )
        except httpx.TimeoutException:
            raise LLMError(
                "The model took too long to respond. "
                "Try a lighter model (e.g. qwen2.5:1.5b)."
            )

        if r.status_code == 404:
            raise LLMError(
                f"Model '{m}' is not installed. Run: ollama pull {m}"
            )
        if r.status_code >= 400:
            raise LLMError(f"Ollama returned {r.status_code}: {r.text[:200]}")

        content = r.json().get("message", {}).get("content", "")
        try:
            return schema.model_validate_json(content)
        except ValidationError as e:
            last_err = e

    raise LLMError(f"The model did not return valid JSON: {last_err}")
