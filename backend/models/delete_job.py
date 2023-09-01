from pydantic import BaseModel
import typing


class DeleteJobResponse(BaseModel):
    job_ids: typing.List[str]
    success: bool
