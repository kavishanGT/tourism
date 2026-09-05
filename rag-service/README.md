# Sri Lanka Tourism RAG Service

AI/RAG microservice for the Sri Lanka Tourism platform.

## Purpose

The service will provide:

- Tourism knowledge retrieval
- Semantic search
- Document ingestion
- Embeddings
- Reranking
- LLM-based generation
- Source citations
- AI travel assistance

## Architecture

Next.js
    ↓
Spring Boot
    ↓
FastAPI RAG Service
    ↓
Retriever + Vector DB + LLM

## Development

Create virtual environment:

python -m venv .venv

Activate:

.venv\Scripts\activate

Install:

pip install -r requirements.txt

Run:

uvicorn app.main:app --reload --port 8001

Swagger:

http://localhost:8001/docs