import functools

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from util.config import config

_EXTERNAL_IP_ENV_KEY = "PTYHUB_ALLOW_EXTERNAL_IP_IN_LOCAL_MODE_DO_NOT_USE_UNLESS_YOU_KNOW_WHAT_YOU_ARE_DOING"


def is_deployment() -> bool:
    return config.get('PTYHUB_DEPLOYMENT', "false").lower() == "true"


def is_local() -> bool:
    return not is_deployment()


def is_development() -> bool:
    return config.get('PTYHUB_DEVELOPMENT', "false").lower() == "true"


def is_allow_external_ip_in_local_mode() -> bool:
    return config.get(_EXTERNAL_IP_ENV_KEY, "false").lower() == "true"


def restrict_endpoint(allow_local=False, allow_deployment=False, only_development_mode=False):
    # Decorator used to restrict access to endpoints based on the PtyHub deployment mode
    def decorator(func):
        @functools.wraps(func)  # This is needed to preserve the original function's metadata
        def wrapper(*args, **kwargs):
            if is_local() and not allow_local:
                raise HTTPException(403, "This endpoint is not accessible when running PtyHub in local mode")
            if is_deployment() and not allow_deployment:
                raise HTTPException(403, "This endpoint is not accessible when running PtyHub in deployment mode")
            if not is_development() and only_development_mode:
                raise HTTPException(403, "This endpoint is only accessible when running PtyHub in development mode")

            return func(*args, **kwargs)

        return wrapper

    return decorator


class RestrictToLocalhostMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        client_host = request.client.host
        if client_host not in ("localhost", "127.0.0.1"):
            return JSONResponse(status_code=401, content={
                "reason": "Connection is not from localhost whilst in local mode. "
                          "If you are a developer and need to have access from "
                          "another host in local mode, set the "
                          f"{_EXTERNAL_IP_ENV_KEY} "
                          "environment variable to true. "
                          "WARNING: This will allow anyone on the network to browse and read from "
                          "the file system as your user so only do this if you know what you are doing."
            })
        response = await call_next(request)
        return response
