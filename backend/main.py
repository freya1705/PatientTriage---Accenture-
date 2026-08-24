"""
PatientTriage.ai FastAPI Application Entry Point
Accenture Innovation Challenge 2026 — Round 2 Prototype
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database import init_db
from .routes.patient_routes import router as patient_router
from .routes.queue_routes import router as queue_router
from .routes.surge_routes import router as surge_router
from .routes.audit_routes import router as audit_router
from .routes.triage_routes import router as triage_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB and seed 20 benchmark patients
    init_db(seed_if_empty=True)
    yield
    # Shutdown logic if needed

app = FastAPI(
    title="PatientTriage.ai API",
    description="Dynamic Safety Intelligence for Emergency Departments — Decide First. Watch Continuously. Act in Time.",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for React frontend (Vite running on localhost:5173 or other ports)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(patient_router)
app.include_router(queue_router)
app.include_router(surge_router)
app.include_router(audit_router)
app.include_router(triage_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "PatientTriage.ai Intelligence Backend",
        "version": "2.0.0",
        "regulatory_mode": "Synthetic Demo / Research Prototype (HIPAA / GDPR Aligned)"
    }
