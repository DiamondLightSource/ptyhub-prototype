# Modified version of
# https://gitlab.diamond.ac.uk/sscc-docs/python-oidc-auth-example/-/blob/f7bfb865680fd097af37517b652156f721745c06/src/auth_example/auth/oidc.py

import base64
import typing
from urllib.parse import quote

import requests
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2

from auth.bearer import OAuth2PasswordBearerCookie
from crud.processed_jobs import get_proc_job
from util import deployment_restrictions
from util.config import config
from models.system_setup import User


def b64encode(input: str):
    return base64.b64encode(input.encode()).decode()


def _discovery():
    return requests.get(config["PTYHUB_OIDC_WELL_KNOWN_ENDPOINT"]).json()


"""It is good practice to get your endpoints from a discovery endpoint, rather than
hardcoding them in. That makes it easier to move to different endpoints in the future"""

oidc_endpoints = _discovery()
client_creds = b64encode(":".join([config["PTYHUB_OIDC_CLIENT_ID"], config["PTYHUB_OIDC_CLIENT_SECRET"]]))

"""This scheme extracts the token from the relevant header/cookie. You can add it as a
dependency in order to use it whenever relevant. Note in your documentation (if using
FastAPI) that all endpoints that ultimately require authentication (this scheme) will
be marked as 'protected' with a padlock."""
oauth2_scheme: OAuth2 = OAuth2PasswordBearerCookie(
    token_url=oidc_endpoints["token_endpoint"],
    auto_error=False
)


def auth_without_auto_error(token: typing.Union[str, None] = Depends(oauth2_scheme)):
    return Auth(token, auto_error=False)


class Auth:
    """A sample authentication class, containing basic actions"""

    fed_id: typing.Union[None, str] = None
    token: typing.Union[None, str] = None

    def __init__(self, token: typing.Union[str, None] = Depends(oauth2_scheme), auto_error=True):
        """If the application you are developing is not a FastAPI application, and does
        not support dependency injections in a similar way, you can pass tokens
        explicitly, use decorators and other alternatives.

        For example, in Flask, you could use decorators on protected endpoints that
        looks for a token in authorisation headers."""
        if token is None:
            # Allowing local mode to be used without authentication
            # Any other mode (just deployment mode for now) requires authentication
            if not deployment_restrictions.is_local() and auto_error:
                raise HTTPException(
                    status_code=403, detail="Not authenticated"
                )

            self.fed_id = None
            self.token = token
        else:
            if deployment_restrictions.is_local():
                # Local mode should not be used with authentication, throwing
                # an error to make debugging easier if this happens
                raise HTTPException(
                    status_code=400, detail="Authentication provided in local mode"
                )
            self.fed_id = self.auth(token)
            self.token = token

    @classmethod
    def auth(cls, token: str):
        response = requests.get(
            oidc_endpoints["userinfo_endpoint"],
            headers={"Authorization": f"Bearer {token}"},
        )

        """401, as a HTTP error code, means unauthorised, whilst 403 means forbidden.
        In this context, unauthorised means that the service could not validate your
        identity, forbidden means that while you were authenticated, the service decided
        you should not have access to this resource"""
        if response.status_code == 401:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user token",
            )

        return response.json().get("id")

    @classmethod
    def exchange_code_for_token(cls, redirect_uri: str, code: str):
        """To get a token in code flow, the user must get a code first.
        That can be done by hitting the authentication endpoint while passing
        'code' as your responseType"""

        params = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri
        }

        response = requests.get(
            oidc_endpoints['token_endpoint'],
            headers={"Authorization": f"Basic {client_creds}"},
            params=params
        )

        if response.status_code == 401:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user code",
            )

        return response.json()

    @classmethod
    def get_auth_redirect(cls, redirect: str, response_type: str):
        """Redirects user to the CAS authentication page. It is up to the redirected
        page to store and manage the token.

        If your application is strictly a CLI interface, you could ask the user to
        enter it later on (or, even better, use device authentication flow)"""

        return (
                oidc_endpoints["authorization_endpoint"]
                + f"?response_type={response_type}&client_id={config['PTYHUB_OIDC_CLIENT_ID']}&redirect_uri="  # noqa: E501
                + quote(redirect)
        )

    @classmethod
    def get_logout_redirect(cls):
        return oidc_endpoints["end_session_endpoint"]

    def get_token(self):
        if not self.is_authenticated() or self.token is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No user token",
            )

        return self.token

    def get_name(self):
        response = requests.get(
            config.get("PTYHUB_USER_INFO_ENDPOINT"),
            headers={"Authorization": f"Bearer {self.get_token()}"},
        )

        """401, as a HTTP error code, means unauthorised, whilst 403 means forbidden.
        In this context, unauthorised means that the service could not validate your
        identity, forbidden means that while you were authenticated, the service decided
        you should not have access to this resource"""
        if response.status_code == 401:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user token",
            )

        response_json = response.json()

        return User(
            fed_id=response_json.get("fedid"),
            first_name=response_json.get("givenName"),
            last_name=response_json.get("familyName")
        )

    def check_access_to_data_collection(self, data_collection_id: int) -> bool:
        # Checks if the user has access to the data collection, throws
        # an error if not
        response = requests.get(
            f"{config.get('PTYHUB_COLLECTION_PERMISSION_ENDPOINT')}/{data_collection_id}",
            headers={"Authorization": f"Bearer {self.get_token()}"},
        )

        if response.status_code == 401:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user token",
            )

        response_json = response.json()
        if isinstance(response_json, dict):
            # Throwing a nice error if we can get some detail why the authentication failed
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=response_json.get("detail", "User does not have access to this data collection")
            )

        if isinstance(response_json, bool):
            if not response_json:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User does not have access to this data collection",
                )

            return True

        # Response is not a boolean or a dict, something is wrong
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User does not have access to this data collection"
        )

    def check_access_to_processed_job(self, processed_job_id: int) -> bool:
        proc_job = get_proc_job(processed_job_id)
        if proc_job is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Processed job not found"
            )

        data_collection_id = proc_job.ProcessingJob.dataCollectionId
        return self.check_access_to_data_collection(data_collection_id)

    def is_authenticated(self):
        return self.fed_id is not None
