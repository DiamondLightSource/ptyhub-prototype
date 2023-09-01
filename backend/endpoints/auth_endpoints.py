from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse, Response
from auth.oidc import Auth
from util.config import config
from models.util import Success
from util import deployment_restrictions

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])


@auth_router.get("/authorise",
                 status_code=302,
                 response_class=RedirectResponse,
                 operation_id="authorise_user"
                 )
@deployment_restrictions.restrict_endpoint(allow_deployment=True, only_development_mode=True)
def authorise_user():
    """Redirect user to authorisation page"""
    return Auth.get_auth_redirect(config.get("PTYHUB_OIDC_REDIRECT_URI"), "code")


@auth_router.get("/callback", response_class=RedirectResponse, operation_id="auth_code_callback")
@deployment_restrictions.restrict_endpoint(allow_deployment=True, only_development_mode=True)
def code_callback(code: str, response: RedirectResponse):
    """Get an access token from a authentication code"""
    user_info = Auth.exchange_code_for_token(config.get("PTYHUB_OIDC_REDIRECT_URI"), code)

    if "error" in user_info:
        raise HTTPException(
            status_code=401,
            detail=user_info["error"],
        )

    # Cookie is set automatically in the frontend, nothing needs to be done client-side
    response.set_cookie(
        # The __Host- prefix prevents the cookie from being overwritten by other
        # subdomains
        key=config.get("PTYHUB_AUTH_COOKIE_KEY"),
        value=user_info.get("access_token"),
        # Disallows client-side scripts from accessing the token
        httponly=True,
        # Token is not sent to other domains
        samesite="strict",
        # Does not allow cookie to be sent through connections without TLS
        secure=not deployment_restrictions.is_development(),
        # Limits where the cookie is included in the frontend (in this case,
        # matches everything under the root folder
        path="/",
        expires=user_info.get("expires", 28800),
    )

    return "/"


@auth_router.get("/logout", status_code=302, response_class=RedirectResponse, operation_id="logout")
@deployment_restrictions.restrict_endpoint(allow_deployment=True)
def logout():
    """Redirect user to logout page"""
    return Auth.get_logout_redirect()
