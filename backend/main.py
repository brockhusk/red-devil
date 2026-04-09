from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://brockhusk.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temporary in-memory store (will be replaced with PostgreSQL)
messages = []

class Message(BaseModel):
    name: str
    message: str

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/inbox")
def submit_message(msg: Message):
    entry = {
        "id": len(messages) + 1,
        "name": msg.name,
        "message": msg.message,
        "created_at": datetime.utcnow().isoformat(),
        "visible": True
    }
    messages.append(entry)
    return {"status": "received", "id": entry["id"]}

@app.get("/inbox/recent")
def get_recent():
    visible = [m for m in messages if m["visible"]]
    return visible[-5:]

@app.get("/inbox/all")
def get_all():
    return messages