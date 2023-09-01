import jwt
from fastapi import HTTPException
from starlette import status
from util import config

INVALID_TOKEN_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Invalid token",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_job_id_from_token(token: str) -> str:
    try:
        decoded = jwt.decode(jwt=token, key=config.config["PTYHUB_JWT_SECRET"], algorithms=["HS256"])
        if "job_id" not in decoded:
            raise INVALID_TOKEN_EXCEPTION

        return decoded["job_id"]
    except jwt.PyJWTError:
        raise INVALID_TOKEN_EXCEPTION
