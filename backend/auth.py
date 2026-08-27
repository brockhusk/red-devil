"""Admin authentication.

Reusable scaffolding for every admin surface, not just messages. Anything that
should be private imports require_admin from here and declares it as a
dependency.

Route paths here are declared without the /api prefix on purpose. Nginx proxies
location /api/ to http://127.0.0.1:8000/ with a trailing slash, which strips
/api before the request reaches FastAPI. So /admin/login below is reached by the
browser as /api/admin/login.
"""

import logging
import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from passlib.context import CryptContext
from pydantic import BaseModel

# Same named logger main.py configures. logging.getLogger returns the one shared
# instance, so importing from main is unnecessary and would be circular.
app_logger = logging.getLogger("reddevil")

COOKIE_NAME = "admin_session"
TOKEN_TTL_HOURS = 24
JWT_ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(prefix="/admin", tags=["admin"])


class LoginRequest(BaseModel):
    password: str


def _require_env(name):
    value = os.getenv(name)
    if not value:
        # A 500 is correct here. The caller did nothing wrong, the server is
        # misconfigured, and returning 401 would send us hunting the wrong bug.
        app_logger.error("admin auth misconfigured", extra={"missing_env": name})
        raise HTTPException(status_code=500, detail="Server misconfigured")
    return value


def config_ready():
    """True when both admin secrets are present. Used for a startup warning."""
    return bool(os.getenv("ADMIN_PASSWORD_HASH")) and bool(os.getenv("JWT_SECRET"))


def cookie_secure():
    """Whether to mark the session cookie Secure. Defaults to on.

    Set COOKIE_SECURE=false only for local development. Safari refuses Secure
    cookies over http://localhost, which makes the admin page untestable there
    otherwise. Production must leave this unset.
    """
    return os.getenv("COOKIE_SECURE", "true").lower() != "false"


def create_token():
    now = datetime.now(timezone.utc)
    payload = {
        "sub": "admin",
        "iat": now,
        "exp": now + timedelta(hours=TOKEN_TTL_HOURS),
    }
    return jwt.encode(payload, _require_env("JWT_SECRET"), algorithm=JWT_ALGORITHM)


def require_admin(request: Request):
    """FastAPI dependency guarding every admin endpoint.

    Raises 401 on a missing, malformed, tampered, or expired cookie. Returns the
    token subject so handlers can log who acted.
    """
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(
            token,
            _require_env("JWT_SECRET"),
            algorithms=[JWT_ALGORITHM],
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired")
    except jwt.InvalidTokenError:
        # Covers a bad signature, a garbage cookie, and an algorithm mismatch.
        app_logger.warning("admin token rejected")
        raise HTTPException(status_code=401, detail="Not authenticated")

    return payload.get("sub")


@router.post("/login")
async def login(body: LoginRequest, response: Response):
    if not pwd_context.verify(body.password, _require_env("ADMIN_PASSWORD_HASH")):
        app_logger.warning("admin login failed")
        raise HTTPException(status_code=401, detail="Invalid password")

    response.set_cookie(
        key=COOKIE_NAME,
        value=create_token(),
        httponly=True,
        secure=cookie_secure(),
        samesite="strict",
        max_age=TOKEN_TTL_HOURS * 3600,
        path="/",
    )
    app_logger.info("admin login succeeded")
    return {"status": "ok"}


@router.post("/logout")
async def logout(response: Response):
    # Unauthenticated on purpose. Clearing a cookie you cannot prove you own is
    # harmless, and requiring auth to log out means an expired session can never
    # clear itself.
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
        httponly=True,
        secure=cookie_secure(),
        samesite="strict",
    )
    app_logger.info("admin logout")
    return {"status": "ok"}


@router.get("/me")
async def me(subject: str = Depends(require_admin)):
    """Auth probe for the frontend.

    The session cookie is httpOnly, so JavaScript cannot read it. The only way
    the admin page can learn whether it is logged in is to call a guarded
    endpoint and interpret the status code. This is also the template every
    admin endpoint in later phases follows: add Depends(require_admin) and the
    401 handling is done.
    """
    return {"authenticated": True, "subject": subject}
