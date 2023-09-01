from typing import Dict

from job_util.submitters.base_submitter import BaseSubmitter
from ptydls.cluster._submitter import Submitter as PtydlsSubmission


class JobNotFound(Exception):
    pass


class Submission:
    def __init__(self, submitter: BaseSubmitter, ptydls_submission: PtydlsSubmission):
        self.submitter = submitter
        self.ptydls_submission = ptydls_submission


# Job ID: submitter
submitter_tracker: Dict[str, Submission] = {}


def get_submission(job_id: str) -> Submission:
    """Get the submission for a job ID."""
    if job_id not in submitter_tracker:
        raise JobNotFound(f"Job ID {job_id} not found")
    return submitter_tracker[job_id]


def set_submission(job_id: str, submitter: Submission) -> None:
    """Set the submitter for a job ID."""
    submitter_tracker[job_id] = submitter
