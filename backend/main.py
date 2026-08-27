from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import logging
from pythonjsonlogger import jsonlogger

# Configure JSON logging for Datadog
logger = logging.getLogger()
handler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter(
    fmt='%(asctime)s %(levelname)s %(name)s %(message)s',
    datefmt='%Y-%m-%dT%H:%M:%S'
)
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)
app_logger = logging.getLogger("reddevil")

# Connection and table definitions live in db.py so the admin routers can share
# them without importing main.py, which would be circular.
from db import database, messages, metadata

import admin_messages
import auth

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://brockhusk.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin_messages.router)

@app.on_event("startup")
async def startup():
    await database.connect()
    if not auth.config_ready():
        # Warn loudly rather than crash. A missing admin secret should never
        # take the public site down.
        app_logger.warning("admin auth disabled: ADMIN_PASSWORD_HASH or JWT_SECRET is unset")

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

class Message(BaseModel):
    name: str
    message: str

@app.get("/health")
async def health_check():
    app_logger.info("health check called")
    return {"status": "ok"}

@app.post("/inbox")
async def submit_message(msg: Message):
    query = messages.insert().values(
        name=msg.name,
        message=msg.message,
        created_at=datetime.utcnow(),
        visible=True
    )
    last_id = await database.execute(query)

    app_logger.info("inbox message stored", extra={"message_id": last_id, "sender_name": msg.name})
    return {"status": "received", "id": last_id}

@app.get("/inbox/recent")
async def get_recent():
    app_logger.info("inbox recent requested")
    query = messages.select().where(
        messages.c.visible == True
    ).order_by(messages.c.created_at.desc()).limit(5)
    results = await database.fetch_all(query)
    return results

@app.get("/inbox/all")
async def get_all():
    query = messages.select().where(
        messages.c.visible == True
    ).order_by(messages.c.created_at.desc())
    results = await database.fetch_all(query)
    return results
