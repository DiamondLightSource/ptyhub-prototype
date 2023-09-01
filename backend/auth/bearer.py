# Modified version of
# https://gitlab.diamond.ac.uk/sscc-docs/python-oidc-auth-example/-/blob/f7bfb865680fd097af37517b652156f721745c06/src/auth_example/utils/bearer.py

from typing import Optional

from fastapi import HTTPException, Request, status
from fastapi.openapi.models import OAuthFlows as OAuthFlowsModel
from fastapi.security import OAuth2
from util import deployment_restrictions
from util.config import config

"""This scheme extracts the authorisation token from a cookie. If that
is not present, then it falls back into checking for one inside an authorisation
header."""


class OAuth2PasswordBearerCookie(OAuth2):
    def __init__(
            self,
            token_url: str,
            scheme_name: Optional[str] = None,
            scopes: Optional[dict] = None,
            auto_error: bool = True,
    ):
        if not scopes:
            scopes = {}
        flows = OAuthFlowsModel(password={"tokenUrl": token_url, "scopes": scopes})
        super().__init__(flows=flows, scheme_name=scheme_name, auto_error=auto_error)

    async def __call__(self, request: Request) -> Optional[str]:
        if deployment_restrictions.is_development():
            # When we are in development mode, we don't have oauth2 proxy in front of the backend
            # so we need to get the token from the cookie
            token = request.cookies.get(config["PTYHUB_AUTH_COOKIE_KEY"])

            if token is not None:
                return token

            if self.auto_error:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Missing token cookie"
                )

            return None

        # Not in development mode, so we are behind oauth2 proxy
        token = request.headers.get("x-auth-request-access-token")

        if token is not None:
            return token

        raise HTTPException(  # Ignore auto_error, we should be behind oauth2 proxy so this should never happen
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="'x-auth-request-access-token' is not passed to the backend from oauth2 proxy"
        )
