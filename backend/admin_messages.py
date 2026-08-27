"""Admin message management.

Every route here is private. The dependency is declared once on the router
rather than repeated on each handler, so a new endpoint added to this file is
guarded by default and cannot be left open by forgetting a line.

Paths omit the /api prefix because Nginx strips it before proxying. The browser
calls /api/admin/messages.
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import require_admin
from db import database, messages

app_logger = logging.getLogger("reddevil")

router = APIRouter(
    prefix="/admin/messages",
    tags=["admin"],
    dependencies=[Depends(require_admin)],
)


class VisibilityUpdate(BaseModel):
    # Omit the field entirely to toggle. Send an explicit true or false to set.
    # Toggling is what the button in the UI does. Setting is what a future bulk
    # action would want, and it keeps the endpoint idempotent when it matters.
    visible: Optional[bool] = None


async def _get_or_404(message_id: int):
    row = await database.fetch_one(
        messages.select().where(messages.c.id == message_id)
    )
    if row is None:
        raise HTTPException(status_code=404, detail="Message not found")
    return row


@router.get("")
async def list_messages():
    """All messages, hidden ones included. The public routes filter on visible,
    this one deliberately does not."""
    query = messages.select().order_by(
        messages.c.created_at.desc(), messages.c.id.desc()
    )
    return await database.fetch_all(query)


@router.patch("/{message_id}")
async def set_visibility(message_id: int, body: VisibilityUpdate):
    row = await _get_or_404(message_id)

    new_visible = (not bool(row["visible"])) if body.visible is None else body.visible

    await database.execute(
        messages.update()
        .where(messages.c.id == message_id)
        .values(visible=new_visible)
    )
    app_logger.info(
        "admin message visibility changed",
        extra={"message_id": message_id, "visible": new_visible},
    )
    return {"id": message_id, "visible": new_visible}


@router.delete("/{message_id}")
async def delete_message(message_id: int):
    row = await _get_or_404(message_id)

    await database.execute(messages.delete().where(messages.c.id == message_id))

    # WARNING rather than INFO. This is irreversible and there is no undo, so it
    # should stand out in Datadog without needing a filter.
    app_logger.warning(
        "admin message deleted",
        extra={"message_id": message_id, "sender_name": row["name"]},
    )
    return {"status": "deleted", "id": message_id}
