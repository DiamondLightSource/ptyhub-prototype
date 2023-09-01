import ptypy
import getpass
from util import deployment_restrictions

from models import parameter_tree_structure as pt_models

ptypy.load_ptyscan_module("hdf5_loader")


class ParamTree:
    def __init__(self):
        self.root = self._parse_defaults(ptypy.defaults_tree["ptycho"])
        self.root["io"] = self._expand_defaults(self.root["io"])
        self.engines = self._expand_defaults(ptypy.defaults_tree["engine"])
        self.scans = self._expand_defaults(ptypy.defaults_tree["scan"])
        del self.scans["ScanModel"]
        del self.scans["BlockScanModel"]
        self.data = self._get_data_loaders()
        del self.data["PtyScan"]
        for k, s in self.scans.items():
            s["data"] = self.data
        self.fulltree = self.root.copy()
        self.fulltree["scans"] = self.scans
        self.fulltree["engines"] = self.engines

    def _parse_defaults(self, defaults, depth=0, user_level=1):
        outdict = {}
        for k, desc in defaults.descendants:
            _is_at_depth = (k.count(".") <= depth)
            _is_at_level = (desc.userlevel <= user_level if not (desc.userlevel is None) else True)
            if _is_at_depth and _is_at_level:
                outdict[k] = desc
        return outdict

    def _expand_defaults(self, defaults):
        root = self._parse_defaults(defaults, depth=0, user_level=5)
        for l, v in root.items():
            if len(v.type) > 1:
                assert "Not implemented"
            if v.type[0] == "Param":
                child = self._expand_defaults(v)
                root[l] = child
            elif isinstance(v.type[0], ptypy.utils.descriptor.EvalDescriptor):
                root[l] = self._parse_defaults(v.type[0], depth=0, user_level=5)
        return root

    def _get_data_loaders(self):
        datadict = {}
        loaders = self._parse_defaults(self._parse_defaults(ptypy.defaults_tree["scan"])["ScanModel"])["data"].type
        for l in loaders:
            datadict[l.name] = self._expand_defaults(l)
        return datadict


def _convert_param_to_pydantic(value, definitions_dict_value_key_map, path):
    if id(value) in definitions_dict_value_key_map:
        return pt_models.Reference(**{"$ref": f"#/definitions/{definitions_dict_value_key_map[id(value)]}"})

    if isinstance(value, dict):
        value = {
            k: _convert_param_to_pydantic(v, definitions_dict_value_key_map, path + [k])
            for k, v in value.items()
        }

        return pt_models.ParameterTreeStructureBranch(value=value)
    elif isinstance(value, ptypy.utils.descriptor.EvalDescriptor):
        param_default = value.default
        if isinstance(param_default, ptypy.utils.parameters.Param):
            # Checking if we can be of type string as well
            if "str" in value.type:
                param_default = ""
            else:
                raise ValueError("Default value is of type Param and cannot be of type string")

        return pt_models.ParameterTreeStructureLeaf(
            name=value.name,
            parameterType=value.type,
            user_level=value.userlevel or 0,
            description_short=value.help.replace("<newline>", "\n"),
            description_long=value.doc.replace("<newline>", "\n"),
            default=param_default,
            choices=value.choices
        )


def _convert_param_to_pydantic_mutable(value: dict, default_key: str, default_name: str, allow_multiple: bool,
                                       definitions_dict_value_key_map, path):
    if not isinstance(value, dict):
        raise ValueError("Expected dict")

    value = {
        k: _convert_param_to_pydantic(v, definitions_dict_value_key_map, path + [k])
        for k, v in value.items()
    }

    return pt_models.ParameterTreeStructureBranchMutable(value=value,
                                                         default_key=default_key,
                                                         default_name=default_name,
                                                         allow_multiple=allow_multiple)


def get_pydantic_parameter_tree():
    ptpy_param_tree = ParamTree()
    definitions_dict_value_key_map = {
        id(ptpy_param_tree.engines): "engines",
        id(ptpy_param_tree.data): "data",
        id(ptpy_param_tree.scans): "scans"
    }

    definitions = {
        "engines": _convert_param_to_pydantic_mutable(ptpy_param_tree.engines, "DM", "engine", True,
                                                      definitions_dict_value_key_map, ["engines"]),
        "data": _convert_param_to_pydantic_mutable(ptpy_param_tree.data, "Hdf5Loader", "data", False,
                                                   definitions_dict_value_key_map, ["data"]),
        "scans": _convert_param_to_pydantic_mutable(ptpy_param_tree.scans, "Full", "scan", True,
                                                    definitions_dict_value_key_map, ["scans"])
    }

    options = []
    default_output_folder = ""

    if deployment_restrictions.is_local():
        # Only add the visit path option if we are on a local deployment
        options.append(
            pt_models.ExtraOption(
                type=pt_models.ExtraOptionType.FILE_SELECT,
                friendly_name="Visit Path",
                config_name="visit_path",
                default_value=""
            )
        )
        default_output_folder = f"/dls/tmp/{getpass.getuser()}/"

    beamlines = [
        pt_models.ParameterTreeBeamline(
            id="ptypy/dls",
            name="dls",
            parameter_tree_type=pt_models.ParameterTreeType.PTYPY,
            definitions=definitions,
            root=_convert_param_to_pydantic(ptpy_param_tree.fulltree, definitions_dict_value_key_map, []),
            default_output_folder=default_output_folder,
            extra_options=options,
            save_extra_options_to_config=True
        )
    ]

    return pt_models.ParameterTreeStructure(
        name="PtyPy Parameter Tree",
        beamlines=beamlines
    )


if __name__ == "__main__":
    pt = ParamTree()
    ptp = get_pydantic_parameter_tree()

    with open("ptypy_parameter_tree.json", "w") as f:
        f.write(ptp.json())
