from .ptypy_parameter_tree import ptypy_paramtree
from .ptyrex_parameter_tree import ptyrex_paramtree

parameter_trees = [
    ptypy_paramtree.get_pydantic_parameter_tree(),
    ptyrex_paramtree.get_pydantic_parameter_tree()
]
