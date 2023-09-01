import os

import jwt
from fastapi import HTTPException

from job_util import submission_manager
from models.cluster_form_submit import ClusterFormSubmissionResponse, ClusterFormSubmissionLocal, \
    ClusterFormSubmissionDeployment, ClusterFormSubmissionSubmittedJob
from models.reconstruction_viewer import ReconstructionViewerAccessToken
from util import config, path_access, deployment_restrictions
from . import submitters
from job_util.submitters.base_submitter import BaseSubmitter
from crud import collections as collections_crud, processed_jobs as processed_jobs_crud
import traceback


def _submit_reconstruction(submitter: BaseSubmitter):
    launch_options = submitter.get_submitter_launch_options()

    try:
        with submitter.submitter_type(launch_options) as ptydls_submission:
            ptydls_submission.submit()
    except Exception as e:
        raise HTTPException(422, "PtyDLS submission error: " + str(e) + " " + traceback.format_exc())

    submitted_jobs = []
    for job_id in ptydls_submission.rinfo.cluster.scheduler.jtid:
        # Generating token for user to access this job
        token_data = ReconstructionViewerAccessToken(job_id=job_id)
        token = jwt.encode(payload=token_data.dict(),
                           key=config.config["PTYHUB_JWT_SECRET"],
                           algorithm="HS256")
        submitted_job = ClusterFormSubmissionSubmittedJob(job_id=job_id, access_token=token)
        submitted_jobs.append(submitted_job)

    submission = submission_manager.Submission(submitter, ptydls_submission)

    for submitted_job in submitted_jobs:
        submission_manager.set_submission(submitted_job.job_id, submission)

    return ClusterFormSubmissionResponse(
        success=True,
        submitted_jobs=submitted_jobs
    )


def submit_reconstruction_local(request: ClusterFormSubmissionLocal) -> ClusterFormSubmissionResponse:
    # Check if the shell is unix
    if os.name != "posix":
        raise Exception("It doesn't look like the current shell is unix. "
                        "Please use a unix shell to run this script. Current OS is: " + os.name)

    # We can now safely assume that the shell is unix and escape our variables

    # Expanding paths into absolute form so that they run the same wherever they are called from
    output_folder_path = path_access.normalise_path(request.output_folder_path)

    if not path_access.is_allowed_to_access(output_folder_path):
        raise HTTPException(401, "You are not allowed to access the output folder path")

    # Create the output directory recursively if it doesn't exist
    os.makedirs(output_folder_path, exist_ok=True)

    submitter_config = submitters.get_submitter(request.parameter_tree_type, request, output_folder_path)
    return _submit_reconstruction(submitter_config)


def submit_reconstruction_deployment(request: ClusterFormSubmissionDeployment) -> ClusterFormSubmissionResponse:
    dcid = processed_jobs_crud.get_proc_job(request.processed_job_id).ProcessingJob.dataCollectionId
    dc = collections_crud.get_data_collection_exception(dcid)
    image_directory = dc.imageDirectory

    if "nexus" in image_directory:
        # If the image directory is a nexus path, we need to remove the nexus part
        image_directory = image_directory.split("nexus")[0]
    output_folder_path = os.path.join(image_directory, "processing/ptyhub")

    submitter_config = submitters.get_submitter(request.parameter_tree_type, request, output_folder_path)
    # Once there is a service to get the slurm jwt for an authenticated user,
    # the slurm jwt should be removed from the request and the fetching of the jwt should be done here
    submitter_config.additional_launch_options = {
        "slurm_jwt": request.slurm_jwt
    }
    return _submit_reconstruction(submitter_config)
