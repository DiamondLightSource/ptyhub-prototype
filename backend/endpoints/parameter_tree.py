import fastapi
import parameter_tree_util
from models.parameter_tree_structure import ParameterTreeStructure as ParameterTreeModel
import typing

parameter_tree_router = fastapi.APIRouter(prefix="/parameter-tree", tags=["Parameter tree"])


@parameter_tree_router.get("/trees",
                           response_model=typing.List[ParameterTreeModel],
                           operation_id="get_parameter_trees",
                           )
def get_parameter_trees():
    return parameter_tree_util.parameter_trees
