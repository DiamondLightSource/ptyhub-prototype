from fastapi import APIRouter, Depends, HTTPException
import os.path

from auth.oidc import Auth
from crud import processed_jobs as processed_jobs_crud
from util import deployment_restrictions
from util.database import get_session

processed_job_router = APIRouter(prefix="/processed-job", tags=["Processed job"])


@processed_job_router.get("/get-config",
                          response_model=str,
                          operation_id="get_processed_job_config")
@deployment_restrictions.restrict_endpoint(allow_deployment=True)
def processed_job_config(processed_job_id: int, user: Auth = Depends(Auth)):
    with get_session():
        user.check_access_to_processed_job(processed_job_id)
        config_file_path = processed_jobs_crud.get_proc_job_config_file_path(processed_job_id)

        if not os.path.exists(config_file_path):
            raise HTTPException(
                status_code=404,
                detail="No config file found at the path specified for this processed job."
            )

        with open(config_file_path, "r") as config_file:
            return config_file.read()
