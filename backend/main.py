from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import databases
import sqlalchemy
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

import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

database = databases.Database(DATABASE_URL)

metadata = sqlalchemy.MetaData()

messages = sqlalchemy.Table(
    "messages",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("name", sqlalchemy.String(100)),
    sqlalchemy.Column("message", sqlalchemy.Text),
    sqlalchemy.Column("created_at", sqlalchemy.DateTime, default=datetime.utcnow),
    sqlalchemy.Column("visible", sqlalchemy.Boolean, default=True),
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://brockhusk.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await database.connect()

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
    app_logger.info("inbox message stored", extra={"id": last_id, "name": msg.name})
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
    query = messages.select().order_by(messages.c.created_at.desc())
    results = await database.fetch_all(query)
    return results