from pydantic import BaseModel
import enum
import typing
from .parameter_tree_structure import ParameterTreeType


class ClusterType(enum.Enum):
    HAMILTON = "hamilton"
    SCIENCE = "science"


class ClusterFormSubmissionBase(BaseModel):
    config_file_data: str
    scan_id: str
    cluster: ClusterType
    use_gpu: bool
    parameter_tree_type: ParameterTreeType
    extra_option_values: typing.Dict[str, typing.Any]


class ClusterFormSubmissionLocal(ClusterFormSubmissionBase):
    output_folder_path: str


class ClusterFormSubmissionDeployment(ClusterFormSubmissionBase):
    processed_job_id: int
    slurm_jwt: str


class ClusterFormSubmissionSubmittedJob(BaseModel):
    job_id: str
    access_token: str


class ClusterFormSubmissionResponse(BaseModel):
    success: bool
    submitted_jobs: typing.List[ClusterFormSubmissionSubmittedJob]
