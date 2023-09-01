from pydantic import BaseModel
from .reconstruction_viewer import ReconstructionViewerResponse
from typing import Optional


class LogsResponse(BaseModel):
    stdout_log: str
    stderr_log: str


class JobStatusResponse(BaseModel):
    reconstruction: Optional[ReconstructionViewerResponse]
    logs: LogsResponse
