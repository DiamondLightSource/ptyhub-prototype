import os
import re

import yaml
from fastapi.exceptions import HTTPException
from ptydls.cluster.submitter_ptypy import SubmitterPtyPy

from models.cluster_form_submit import ClusterFormSubmissionBase
from models.parameter_tree_structure import ParameterTreeType
from .base_submitter import BaseSubmitter, default_calculate_number_of_processors
from util import deployment_restrictions, config


class PtyPySubmitter(BaseSubmitter):
    def __init__(self, cluster_form_submission: ClusterFormSubmissionBase, safe_output_folder_path: str):
        super().__init__(SubmitterPtyPy, cluster_form_submission, safe_output_folder_path, ParameterTreeType.PTYPY)

    def get_submitter_launch_options(self):
        # TODO - This is a temporary fix to remove the ffttype from the config file
        updated_config_file_data = re.sub(r"ffttype:\s*\w+", "", self.cluster_form_submission.config_file_data)

        number_of_processors_cpu = calculate_number_of_processors(self.cluster_form_submission, False)
        number_of_processors_gpu = calculate_number_of_processors(self.cluster_form_submission, True)

        # We need to get abs path of launch script as command will be run from users home directory
        launch_script_config = {
            'config': updated_config_file_data,
            'cpus': number_of_processors_cpu,
            'gpus': number_of_processors_gpu,
            'wd': self.safe_output_folder_path,
            'identifier': self.cluster_form_submission.scan_id,
            'plot': True,
            'keep_log': True,
            'app_version': 'stable_cuda12',
            **self.additional_launch_options
        }

        if deployment_restrictions.is_deployment():
            launch_script_config["ptypy_wrapper"] = config.config["PTYHUB_PTYDLS_DEPLOYMENT_WRAPPER_PATH"]

        return launch_script_config

    def get_final_output_file_path(self) -> str:
        return os.path.abspath(
            os.path.join(self.safe_output_folder_path,
                         f"scan_{self.cluster_form_submission.scan_id}",
                         f"scan_{self.cluster_form_submission.scan_id}.ptyr"
                         )
        )


# Find the number of CPUs and GPUs to use for the PtyPy job
# Algorithm is defined here:
# https://confluence.diamond.ac.uk/display/SCI/Web-UI+project?preview=/156110049/185991667/20230411_114958.jpg
def calculate_number_of_processors(data: ClusterFormSubmissionBase, gpu: bool) -> int:
    if gpu and not data.use_gpu:
        # If we don't use the GPU, we don't need any processors
        return 0

    parsed_config_file = yaml.safe_load(data.config_file_data)
    if "parameter_tree" not in parsed_config_file:
        raise HTTPException(400, "Invalid PtyPy config file, missing parameter_tree")

    parameter_tree = parsed_config_file["parameter_tree"]
    engine_types = []

    if "engines" not in parameter_tree:
        raise HTTPException(400, "Invalid PtyPy config file, missing engines")

    for engine in parameter_tree["engines"].values():
        if "name" not in engine:
            raise HTTPException(400, "Invalid PtyPy config file, engine missing name")
        engine_types.append(engine["name"].upper())

    # If there is an EPIE or SDR engine, we only need 1 processor
    if "EPIE" in engine_types or "SDR" in engine_types:
        return 1

    return default_calculate_number_of_processors(data, gpu)
