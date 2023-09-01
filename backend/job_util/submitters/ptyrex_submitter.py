import os
import typing

from fastapi import HTTPException
from ptydls.cluster.submitter_ptyrex import SubmitterPtyREX
from pydantic import BaseModel

from models.cluster_form_submit import ClusterFormSubmissionBase
from models.parameter_tree_structure import ParameterTreeType
from .base_submitter import BaseSubmitter, default_calculate_number_of_processors


class Projections(BaseModel):
    projections: typing.List[str]


class PtyRexSubmitter(BaseSubmitter):
    def __init__(self, cluster_form_submission: ClusterFormSubmissionBase, safe_output_folder_path: str):
        super().__init__(SubmitterPtyREX, cluster_form_submission, safe_output_folder_path, ParameterTreeType.PTYREX)

    def get_submitter_launch_options(self):
        config_file_path = self.get_config_file_path()

        with open(config_file_path, "w") as f:
            f.write(self.cluster_form_submission.config_file_data)

        number_of_processors_cpu = default_calculate_number_of_processors(self.cluster_form_submission, False)
        number_of_processors_gpu = default_calculate_number_of_processors(self.cluster_form_submission, True)

        if "projections" not in self.cluster_form_submission.extra_option_values:
            raise HTTPException(422, "'projections' extra option is required for PtyREX")

        # Used to validate that the projections are valid
        projections = Projections(projections=self.cluster_form_submission.extra_option_values["projections"])

        # We need to get abs path of launch script as command will be run from users home directory
        launch_script_config = {
            'config': config_file_path,
            'cpus': 4,
            'gpus': number_of_processors_gpu,
            'wd': self.safe_output_folder_path,
            'identifier': self.cluster_form_submission.scan_id,
            'projection': ",".join(projections.projections),
            'keep_log': True,
            'app_version': 'latest',
            **self.additional_launch_options
        }

        return launch_script_config

    def get_final_output_file_path(self) -> str:
        return os.path.abspath(
            os.path.join(self.safe_output_folder_path,
                         f"scan_{self.cluster_form_submission.scan_id}",
                         f"scan_{self.cluster_form_submission.scan_id}.ptyr"
                         )
        )
