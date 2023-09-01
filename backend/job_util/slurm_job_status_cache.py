from ptydls.cluster.scheduler import JobStatus, Slurm
from ptydls.utils.helper import slurm_job_status
import typing
import time
from job_util import submission_manager
from util.config import config
from util import deployment_restrictions

UPDATE_CACHE_INTERVAL = 5

jtid_statuses_cache: typing.Dict[str, JobStatus] = {}
cache_last_updated_time: typing.Union[int, None] = None
is_cache_updating = False


def _update_cache_from_slurm_response(slurm_response: dict):
    # The job id and task ids are separated by an underscore when returned by ptydls,
    # but the cache uses a dot to separate them.
    new_statuses = {
        new_jtid.replace("_", "."): new_status
        for new_jtid, new_status in slurm_response.items()
    }

    # Updating the cache with the new values
    for new_jtid, new_status in new_statuses.items():
        jtid_statuses_cache[new_jtid] = new_status


def _update_jtid_status_cache():
    global jtid_statuses_cache
    global cache_last_updated_time

    all_slurm_jtids = []

    jtids_to_update = []
    for jtid, submitter in submission_manager.submitter_tracker.items():
        if isinstance(submitter.ptydls_submission.rinfo.cluster.scheduler, Slurm):
            all_slurm_jtids.append(jtid)
            jtid_underscore = jtid.replace(".", "_")
            # If the job is running, queued or undefined, we need to update it.
            # All other statuses are final and don't need to be updated.
            if jtid in jtid_statuses_cache:
                cached_status = jtid_statuses_cache[jtid]
                if cached_status in [JobStatus.RUNNING, JobStatus.UNDEFINED, JobStatus.QUEUED]:
                    jtids_to_update.append(jtid_underscore)
            else:
                # Job is not in the cache, so we need to update it
                jtids_to_update.append(jtid_underscore)

    # In case getting the latest slurm response takes over 1s, we want the cache last update time to be
    # when we sent the request, not when we got the response.
    old_cache_last_updated_time = cache_last_updated_time
    cache_last_updated_time = int(time.time())

    # Fetching the status of all jobs that need to be updated.
    # This will only return the status of jobs that have changed since the last update.
    if len(jtids_to_update) > 0:
        slurm_jwt = None
        if deployment_restrictions.is_deployment():
            slurm_jwt = config["PTYHUB_SLURM_JWT"]

        _update_cache_from_slurm_response(
            slurm_job_status(
                jtids_to_update,
                update_time=old_cache_last_updated_time,
                full=False,
                slurm_jwt=slurm_jwt
            )
        )

    # Checking if any jtids are missing from the cache, and if so forcefully fetching their status
    missing_jtids = []
    for jtid in all_slurm_jtids:
        if jtid not in jtid_statuses_cache:
            # If there is a slurm job that we still don't have the status of, we need to update it forcefully
            missing_jtids.append(jtid)

    if len(missing_jtids) > 0:
        print(f"WARNING: Missing status for {len(missing_jtids)} jobs. Forcing update.")
        _update_cache_from_slurm_response(
            slurm_job_status(
                jtids_to_update,
                # The last update time was just now, so set this to time.time()
                update_time=int(time.time()),
                full=True
            )
        )


def update_jtid_status_cache():
    global is_cache_updating
    global cache_last_updated_time

    is_cache_updating = True

    try:
        _update_jtid_status_cache()
    finally:
        is_cache_updating = False


def get_slurm_jtid_status(jtid, force_update=False) -> JobStatus:
    global jtid_statuses_cache
    if cache_last_updated_time is None or time.time() - cache_last_updated_time > UPDATE_CACHE_INTERVAL or force_update:
        # We need to update the cache
        update_jtid_status_cache()

    if jtid not in jtid_statuses_cache:
        # If the job is not in the cache, it has likely been added since the last update.
        return JobStatus.UNDEFINED

    return jtid_statuses_cache[jtid]
