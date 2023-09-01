import os
import random
import string
from abc import ABC, abstractmethod
from datetime import datetime

from fastapi import HTTPException

from models.cluster_form_submit import ClusterFormSubmissionBase, ClusterType
from ptydls.cluster._submitter import Submitter as PtydlsSubmitter
from typing import Type

from models.parameter_tree_structure import ParameterTreeType


class BaseSubmitter(ABC):
    def __init__(self,
                 ptydls_submitter_type: Type[PtydlsSubmitter],
                 cluster_form_submission: ClusterFormSubmissionBase,
                 safe_output_folder_path: str,
                 parameter_tree_type: ParameterTreeType
                 ):
        self.submitter_type: Type[PtydlsSubmitter] = ptydls_submitter_type
        self.cluster_form_submission: ClusterFormSubmissionBase = cluster_form_submission
        self.safe_output_folder_path: str = safe_output_folder_path
        self.parameter_tree_type: ParameterTreeType = parameter_tree_type
        self.additional_launch_options: dict = {}

    @abstractmethod
    # Generates the launch options for the ptyDLS submitter
    def get_submitter_launch_options(self):
        pass

    @abstractmethod
    # The path to the final file output of the reconstruction
    def get_final_output_file_path(self) -> str:
        pass

    def get_config_file_path(self, create=True):
        # The config file is written to <working_directory>/.ptyhub/config_<timestamp>.json
        config_file_folder_path = os.path.join(self.safe_output_folder_path, ".ptyhub")
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        # Adding random string to avoid collisions if multiple jobs are submitted at the same time
        random_string = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
        unique_filename = f"config_{timestamp}_{random_string}.json"
        config_file_path = os.path.join(config_file_folder_path, unique_filename)

        if create:
            # Creating the config file folder if it doesn't exist
            os.makedirs(config_file_folder_path, exist_ok=True)

        return config_file_path


# Find the number of CPUs and GPUs to use for the PtyRex job
def default_calculate_number_of_processors(data: ClusterFormSubmissionBase, gpu: bool) -> int:
    if gpu and not data.use_gpu:
        # If we don't use the GPU, we don't need any processors
        return 0

    if gpu:
        if data.cluster == ClusterType.SCIENCE:
            return 2
        if data.cluster == ClusterType.HAMILTON:
            return 4
    else:
        if data.cluster == ClusterType.SCIENCE:
            return 20
        if data.cluster == ClusterType.HAMILTON:
            return 40

    raise HTTPException(400, f"Invalid cluster type {data.cluster}")
