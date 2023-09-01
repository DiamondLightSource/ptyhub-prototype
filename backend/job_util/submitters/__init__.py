from models.cluster_form_submit import ClusterFormSubmissionBase
from models.parameter_tree_structure import ParameterTreeType
from . import ptypy_submitter, ptyrex_submitter, base_submitter

SUBMITTER_TYPE_SUBMITTER_MAP = {
    ParameterTreeType.PTYPY: ptypy_submitter.PtyPySubmitter,
    ParameterTreeType.PTYREX: ptyrex_submitter.PtyRexSubmitter
}


def get_submitter(
    parameter_tree_type: ParameterTreeType,
    cluster_form_submission: ClusterFormSubmissionBase,
    safe_output_folder_path: str
) -> base_submitter.BaseSubmitter:
    if parameter_tree_type not in SUBMITTER_TYPE_SUBMITTER_MAP:
        raise ValueError(f"Unknown parameter tree type: {parameter_tree_type}")
    return SUBMITTER_TYPE_SUBMITTER_MAP[parameter_tree_type](cluster_form_submission, safe_output_folder_path)
