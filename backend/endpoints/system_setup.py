from fastapi import APIRouter, Depends
from models import system_setup as system_setup_model
from auth.oidc import auth_without_auto_error, Auth
from util import deployment_restrictions

system_setup_router = APIRouter(prefix="/system-setup", tags=["System setup"])


@system_setup_router.get("/info", operation_id="get_system_info", response_model=system_setup_model.SystemSetupInfo)
def get_system_info(user: Auth = Depends(auth_without_auto_error)):
    if deployment_restrictions.is_local():
        # Local mode
        return system_setup_model.SystemSetupInfo(
            deployment_mode=False,
            is_authenticated=False,
            requires_authentication=False,
            user=None
        )

    name = None
    if user.is_authenticated():
        name = user.get_name()

    # Deployment mode
    return system_setup_model.SystemSetupInfo(
        deployment_mode=True,
        is_authenticated=user.is_authenticated(),
        requires_authentication=not user.is_authenticated(),
        user=name
    )
