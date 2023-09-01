import typing

from fastapi import APIRouter, Depends

from auth.oidc import Auth
from models import data_collection as dc_model
from crud import collections as collections_crud
from util import deployment_restrictions
from util.database import get_session

data_collection_router = APIRouter(prefix="/data-collection", tags=["Data collection"])


@data_collection_router.get("/",
                            response_model=dc_model.DataCollection,
                            operation_id="get_data_collection")
@deployment_restrictions.restrict_endpoint(allow_deployment=True)
def get_data_collection(data_collection_id: int, user: Auth = Depends(Auth)):
    user.check_access_to_data_collection(data_collection_id)

    with get_session():
        # We now know the user has access to the data collection
        return collections_crud.get_data_collection_response(data_collection_id)


@data_collection_router.get("/processed-jobs",
                            response_model=typing.List[dc_model.ProcessedJob],
                            operation_id="get_processed_jobs")
@deployment_restrictions.restrict_endpoint(allow_deployment=True)
def get_data_collection(data_collection_id: int, user: Auth = Depends(Auth)):
    user.check_access_to_data_collection(data_collection_id)

    with get_session():
        # We now know the user has access to the data collection
        return collections_crud.get_proc_jobs_response(data_collection_id)
