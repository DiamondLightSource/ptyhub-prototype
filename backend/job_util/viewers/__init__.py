from models.parameter_tree_structure import ParameterTreeType
from .base_viewer import BaseViewer
from .ptypy_viewer import PtyPyViewer
from .ptyrex_viewer import PtyRexViewer

PARAMETER_TREE_TYPE_VIEWER_MAP = {
    ParameterTreeType.PTYPY: PtyPyViewer(),
    ParameterTreeType.PTYREX: PtyRexViewer(),
}


def get_viewer(parameter_tree_type: ParameterTreeType) -> BaseViewer:
    if parameter_tree_type not in PARAMETER_TREE_TYPE_VIEWER_MAP:
        raise ValueError(f"Unknown parameter tree type: {parameter_tree_type}")
    return PARAMETER_TREE_TYPE_VIEWER_MAP[parameter_tree_type]
