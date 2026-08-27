"""Database connection and table definitions.

Split out of main.py so that main.py and the admin routers can share one
connection without importing each other, which would be a circular import.
Every future admin surface (blog, currently, reactions) imports from here.
"""

import os
from datetime import datetime

import databases
import sqlalchemy
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
