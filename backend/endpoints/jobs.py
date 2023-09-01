import typing

import fastapi
import msgpack
from fastapi import APIRouter, HTTPException, Depends
from ptydls.cluster.scheduler import JobStatus, Slurm

from auth.oidc import Auth
from job_util import submission_manager, authentication, submit_reconstruction, viewer_generate_response, \
    plot_client_manager, slurm_job_status_cache
from models.cluster_form_submit import ClusterFormSubmissionLocal, ClusterFormSubmissionDeployment, \
    ClusterFormSubmissionResponse
from models.job_status import JobStatusResponse, LogsResponse
from models.job_summary import JobSummaryResponse
from models.job_token_list import JobTokenList
from models.delete_job import DeleteJobResponse
from util import deployment_restrictions
from util.database import get_session

jobs_router = APIRouter(tags=["Jobs"])


@jobs_router.post("/job/submit/local",
                  response_model=ClusterFormSubmissionResponse,
                  operation_id="submit_local_job")
@deployment_restrictions.restrict_endpoint(allow_local=True)
def submit_job(cluster_config: ClusterFormSubmissionLocal):
    """
    Submit a job to the cluster whilst running in local mode
    """
    start_job_result = submit_reconstruction.submit_reconstruction_local(cluster_config)

    return start_job_result


@jobs_router.post("/job/submit/deployment",
                  response_model=ClusterFormSubmissionResponse,
                  operation_id="submit_deployment_job")
@deployment_restrictions.restrict_endpoint(allow_deployment=True)
def submit_job(cluster_config: ClusterFormSubmissionDeployment, user: Auth = Depends(Auth)):
    """
    Submit a job to the cluster whilst running in deployment mode
    """
    with get_session():
        # Ensure the user has access to the processed job
        user.check_access_to_processed_job(cluster_config.processed_job_id)
        start_job_result = submit_reconstruction.submit_reconstruction_deployment(cluster_config)

        return start_job_result


@jobs_router.get("/job/status",
                 operation_id="get_job_status",
                 responses={
                     200: {
                         "content": {"application/msgpack": {}},
                         "description": "Return the scan data and logs in msgpack format",
                     }
                 },
                 response_model=JobStatusResponse,
                 response_class=fastapi.Response
                 )
def get_job_status(token: str):
    job_id = authentication.get_job_id_from_token(token)

    submitter = submission_manager.get_submission(job_id).ptydls_submission
    standard_out_log_dict = submitter.rinfo.cluster.scheduler.stdout_log
    standard_err_log_dict = submitter.rinfo.cluster.scheduler.stderr_log

    standard_out_log = standard_out_log_dict[job_id]
    standard_err_log = standard_err_log_dict[job_id]

    logs_dict = LogsResponse(
        stdout_log=standard_out_log,
        stderr_log=standard_err_log
    ).dict()

    try:
        viewer_response_dict = viewer_generate_response.get_viewer_endpoint_response_dict(
            job_id, standard_out_log, standard_err_log
        )
    except submission_manager.JobNotFound:
        viewer_response_dict = None
    except plot_client_manager.ClusterJobNotStarted:
        viewer_response_dict = None
    except plot_client_manager.ClusterJobFinished:
        viewer_response_dict = None
    except plot_client_manager.NoReconstructionData:
        viewer_response_dict = None

    converted = msgpack.packb({
        "reconstruction": viewer_response_dict,
        "logs": logs_dict
    })

    return fastapi.Response(converted, headers={
        "Content-Type": "application/msgpack"
    })


@jobs_router.delete("/jobs/delete",
                    operation_id="delete_jobs",
                    response_model=DeleteJobResponse)
def delete_job(tokens: JobTokenList):
    deleted_job_ids = []
    for token in tokens.tokens:
        job_id = authentication.get_job_id_from_token(token)

        submitter = submission_manager.get_submission(job_id).ptydls_submission
        if "." in job_id:
            task_id = int(job_id.split(".")[1])
            submitter.job_delete(tid=task_id)
        else:
            submitter.job_delete()
        deleted_job_ids.append(job_id)

    return DeleteJobResponse(
        job_ids=deleted_job_ids,
        success=True
    )


@jobs_router.post("/jobs/summary",
                  response_model=typing.List[JobSummaryResponse],
                  operation_id="get_jobs")
def get_job_summary(tokens: JobTokenList):
    job_summaries: typing.List[JobSummaryResponse] = []

    for token in tokens.tokens:
        job_id = authentication.get_job_id_from_token(token)
        try:
            submitter = submission_manager.get_submission(job_id).ptydls_submission
        except submission_manager.JobNotFound:
            raise HTTPException(status_code=404, detail=f"Could not find the submitter for job ID {job_id}")

        job_task_ids = submitter.rinfo.cluster.scheduler.jtid
        job_scan_ids = submitter.rinfo.identifier
        number_of_projections = len(job_task_ids) / len(job_scan_ids)

        if job_id not in job_task_ids:
            raise HTTPException(status_code=404, detail="Could not find this job task ID on the submitter")

        if not number_of_projections.is_integer():
            raise HTTPException(status_code=500, detail="The number of projections is not a integer")

        number_of_projections = int(number_of_projections)
        job_task_id_index = job_task_ids.index(job_id) // number_of_projections
        scan_id = job_scan_ids[job_task_id_index]
        task_id = int(job_id.split(".")[1]) if "." in job_id else None

        if isinstance(submitter.rinfo.cluster.scheduler, Slurm):
            job_status = slurm_job_status_cache.get_slurm_jtid_status(job_id)
        else:
            try:
                job_status = submitter.rinfo.cluster.job_status(task_id)
            except IndexError:
                job_status = JobStatus.UNDEFINED

        progress = 0

        if job_status == JobStatus.RUNNING:
            try:
                plot_client = plot_client_manager.get_plot_client(job_id)
                _, _, runtime = plot_client.get_data()
                iter_info = runtime.iter_info
                if isinstance(iter_info, list) and len(iter_info) > 0:
                    last_iter = iter_info[-1]
                    total_iters = last_iter["numiter"]
                    current_iter = last_iter["iteration"]

                    if total_iters > 0:
                        progress = int(current_iter / total_iters * 100)
            except submission_manager.JobNotFound:
                progress = 0
            except plot_client_manager.ClusterJobNotStarted:
                progress = 0
            except plot_client_manager.ClusterJobFinished:
                progress = 100
            except plot_client_manager.NoReconstructionData:
                progress = 0

        if job_status in [JobStatus.STOPPED, JobStatus.ABORTED, JobStatus.FAILED, JobStatus.COMPLETED]:
            progress = 100

        job_summaries.append(JobSummaryResponse(
            job_id=job_id,
            scan_id=str(scan_id),
            progress_percent=progress,
            status=job_status,
        ))

    return job_summaries
