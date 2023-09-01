from pydantic import BaseModel
from ptydls.cluster.scheduler import JobStatus


class JobSummaryResponse(BaseModel):
    job_id: str
    scan_id: str
    progress_percent: int
    status: JobStatus
