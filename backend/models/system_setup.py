from pydantic import BaseModel
from typing import Union


class User(BaseModel):
    first_name: str
    last_name: str
    fed_id: str


class SystemSetupInfo(BaseModel):
    deployment_mode: bool
    is_authenticated: bool
    requires_authentication: bool
    user: Union[None, User]
